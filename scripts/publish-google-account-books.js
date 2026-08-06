#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const manifestPath = process.argv[2];
if (!manifestPath) {
  throw new Error("Usage: node scripts/publish-google-account-books.js <manifest-json>");
}

for (const script of ["sync-google-account-books.js", "refresh-partner-covers.js"]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script), path.resolve(manifestPath)], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
