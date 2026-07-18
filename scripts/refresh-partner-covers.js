#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const siteRoot = path.resolve(__dirname, "..");
const manifestPath = path.resolve(process.argv[2] || "partner-eligible-books.json");
const coverDir = path.join(siteRoot, "assets", "images", "google-book-cover-images");
const books = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function coverName(key) {
  return `${key.replace(":", "_")}_partner-cover.jpg`;
}

async function download(book) {
  const url = `https://books.google.com/books/publisher/content/images/frontcover/${encodeURIComponent(book.googleBooksId)}?fife=w1200-h1800`;
  const target = path.join(coverDir, coverName(book.googleBooksKey));
  const temporary = `${target}.download`;
  const response = await fetch(url, { redirect: "follow" });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`HTTP ${response.status}, ${contentType || "no content type"}`);
  }
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length < 5000) throw new Error(`image is unexpectedly small (${data.length} bytes)`);
  fs.writeFileSync(temporary, data);
  fs.renameSync(temporary, target);
  return { key: book.googleBooksKey, bytes: data.length, target };
}

async function main() {
  fs.mkdirSync(coverDir, { recursive: true });
  const queue = books.filter((book) => book.googleBooksKey && book.googleBooksId);
  const successes = [];
  const failures = [];
  const concurrency = 6;
  let index = 0;

  async function worker() {
    while (index < queue.length) {
      const book = queue[index++];
      try {
        successes.push(await download(book));
      } catch (error) {
        failures.push({ key: book.googleBooksKey, error: error.message });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(JSON.stringify({ requested: queue.length, updated: successes.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
