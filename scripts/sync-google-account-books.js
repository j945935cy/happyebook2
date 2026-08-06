#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const manifestPath = process.argv[2];
if (!manifestPath) {
  throw new Error("Usage: node scripts/sync-google-account-books.js <manifest-json>");
}

const baseScriptPath = path.join(__dirname, "sync-eligible-google-books.js");
const baseSource = fs.readFileSync(baseScriptPath, "utf8");
const patchedSource = baseSource
  .replace(
    'const eligible = rows.filter((row) => row.status === "在 Google Play 開始販售" && row.googleBooksId);',
    'const publishableStatuses = new Set(["在 Google Play 開始販售", "在 Google Play 上預購"]);\nconst eligible = rows.filter((row) => publishableStatuses.has(row.status) && row.googleBooksId);',
  )
  .replace(
    "category: categories(row.title),",
    "category: Array.isArray(row.category) && row.category.length ? row.category : categories(row.title),",
  );

if (patchedSource === baseSource) {
  throw new Error("The base sync script no longer matches the expected source; review the wrapper before running it.");
}

const tempScriptPath = path.join(__dirname, `.sync-google-account-${process.pid}.tmp.js`);
try {
  fs.writeFileSync(tempScriptPath, patchedSource, "utf8");
  const result = spawnSync(process.execPath, [tempScriptPath, path.resolve(manifestPath)], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, TMPDIR: os.tmpdir() },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
} finally {
  fs.rmSync(tempScriptPath, { force: true });
}
