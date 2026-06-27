const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://happyebook.com";
const BOOKS_JSON = path.join(ROOT, "src", "books.json");
const REQUIRED_BOOK_FIELDS = [
  "id",
  "title",
  "author",
  "category",
  "type",
  "format",
  "cover",
  "description",
  "priceLabel",
];
const VALID_BOOK_TYPES = new Set(["free", "paid", "web"]);
const PUBLIC_HTML_DIRS = [
  "articles",
  "books",
  "learning",
  "mini-projects",
  "resources",
];
const ROOT_PUBLIC_PAGES = [
  "index.html",
  "books.html",
  "book.html",
  "about.html",
  "contact.html",
];

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readBooks() {
  const books = JSON.parse(fs.readFileSync(BOOKS_JSON, "utf8"));
  if (!Array.isArray(books)) {
    throw new Error("src/books.json must contain an array.");
  }
  return books;
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function normalizeAssetPath(value) {
  if (!value || isExternalUrl(value)) {
    return "";
  }
  return String(value).replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
}

function publicBookPagePath(book) {
  return path.join("books", `${book.id}.html`).replace(/\\/g, "/");
}

function publicBookUrl(book) {
  return `${SITE_ORIGIN}/${publicBookPagePath(book)}`;
}

function walkHtmlFiles(dirRelativePath) {
  const dirPath = path.join(ROOT, dirRelativePath);
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryRelativePath = path.join(dirRelativePath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(entryRelativePath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(entryRelativePath.replace(/\\/g, "/"));
    }
  }
  return results;
}

function pathToPublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized === "index.html") {
    return `${SITE_ORIGIN}/`;
  }
  if (normalized.endsWith("/index.html")) {
    return `${SITE_ORIGIN}/${normalized.replace(/index\.html$/, "")}`;
  }
  return `${SITE_ORIGIN}/${normalized}`;
}

function collectPublicHtmlPaths() {
  const paths = new Set();
  for (const page of ROOT_PUBLIC_PAGES) {
    if (fileExists(page)) {
      paths.add(page);
    }
  }
  for (const dir of PUBLIC_HTML_DIRS) {
    for (const file of walkHtmlFiles(dir)) {
      paths.add(file);
    }
  }
  return Array.from(paths).sort((a, b) => pathToPublicUrl(a).localeCompare(pathToPublicUrl(b)));
}

function extractSitemapUrls() {
  if (!fileExists("sitemap.xml")) {
    return new Set();
  }
  const xml = readText("sitemap.xml");
  const urls = new Set();
  const locPattern = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = locPattern.exec(xml))) {
    urls.add(match[1].trim());
  }
  return urls;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function priorityForPath(relativePath) {
  if (relativePath === "index.html") {
    return "1.0";
  }
  if (relativePath === "books.html") {
    return "0.9";
  }
  if (relativePath.startsWith("learning/") || relativePath.startsWith("mini-projects/")) {
    return "0.85";
  }
  if (relativePath.startsWith("books/")) {
    return "0.75";
  }
  return "0.7";
}

function changefreqForPath(relativePath) {
  if (relativePath.startsWith("books/")) {
    return "monthly";
  }
  return "weekly";
}

function validateBooks({ includeSitemap = false } = {}) {
  const books = readBooks();
  const errors = [];
  const warnings = [];
  const seenIds = new Map();

  books.forEach((book, index) => {
    const label = book && book.id ? book.id : `index ${index}`;

    for (const field of REQUIRED_BOOK_FIELDS) {
      const value = book[field];
      const hasValue = Array.isArray(value) ? value.length > 0 : String(value || "").trim().length > 0;
      if (!hasValue) {
        errors.push(`${label}: missing required field "${field}".`);
      }
    }

    if (book.id && /\s|[\\/]/.test(book.id)) {
      errors.push(`${label}: id must not contain spaces or slashes.`);
    }

    if (book.id) {
      if (seenIds.has(book.id)) {
        errors.push(`${label}: duplicate id also used at index ${seenIds.get(book.id)}.`);
      } else {
        seenIds.set(book.id, index);
      }
    }

    if (book.type && !VALID_BOOK_TYPES.has(book.type)) {
      errors.push(`${label}: type "${book.type}" is not one of free, paid, web.`);
    }

    if (book.category && !Array.isArray(book.category) && typeof book.category !== "string") {
      errors.push(`${label}: category must be a string or array.`);
    }

    const coverPath = normalizeAssetPath(book.cover);
    if (coverPath && !fileExists(coverPath)) {
      errors.push(`${label}: cover file not found: ${book.cover}`);
    }

    if (book.id && !fileExists(publicBookPagePath(book))) {
      errors.push(`${label}: missing static book page ${publicBookPagePath(book)}.`);
    }

    const hasActionUrl = Boolean(book.readUrl || book.buyUrl || book.downloadUrl);
    if (!hasActionUrl) {
      warnings.push(`${label}: no readUrl, buyUrl, or downloadUrl.`);
    }
  });

  if (includeSitemap) {
    const sitemapUrls = extractSitemapUrls();
    for (const book of books) {
      if (book.id && !sitemapUrls.has(publicBookUrl(book))) {
        errors.push(`${book.id}: missing from sitemap.xml.`);
      }
    }
  }

  return {
    books,
    errors,
    warnings,
  };
}

function printReport(title, result) {
  console.log(title);
  console.log(`Books: ${result.books.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.errors.length) {
    console.log("\nErrors:");
    result.errors.forEach((message) => console.log(`- ${message}`));
  }

  if (result.warnings.length) {
    console.log("\nWarnings:");
    result.warnings.forEach((message) => console.log(`- ${message}`));
  }
}

module.exports = {
  ROOT,
  SITE_ORIGIN,
  collectPublicHtmlPaths,
  changefreqForPath,
  extractSitemapUrls,
  fileExists,
  pathToPublicUrl,
  priorityForPath,
  publicBookPagePath,
  publicBookUrl,
  readBooks,
  readText,
  todayIsoDate,
  validateBooks,
  xmlEscape,
  printReport,
};
