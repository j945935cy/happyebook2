const fs = require("fs");
const path = require("path");
const {
  ROOT,
  collectPublicHtmlPaths,
  extractSitemapUrls,
  fileExists,
  pathToPublicUrl,
  printReport,
  publicBookUrl,
  readText,
  validateBooks,
} = require("./site-utils");

const result = validateBooks({ includeSitemap: true });
const publicHtmlPaths = collectPublicHtmlPaths();
const sitemapUrls = extractSitemapUrls();
const requiredPages = ["index.html", "books.html", "book.html", "about.html", "contact.html"];
const CURRENT_CSS_VERSION = "20260627-3";
const CURRENT_SCRIPT_VERSION = "20260703-1";
const referencedImagePaths = new Set();

function normalizeReferencedImagePath(pagePath, value) {
  const cleanValue = String(value).replace(/[?#].*$/, "").replace(/\\/g, "/");
  if (cleanValue.startsWith("/")) {
    return cleanValue.replace(/^\/+/, "");
  }
  if (cleanValue.startsWith("assets/")) {
    return cleanValue;
  }
  return path.posix.normalize(path.posix.join(path.posix.dirname(pagePath), cleanValue)).replace(/^(\.\.\/)+/, "");
}

for (const page of requiredPages) {
  if (!fileExists(page)) {
    result.errors.push(`Required page missing: ${page}`);
  }
}

for (const relativePath of publicHtmlPaths) {
  const html = readText(relativePath);

  if (/\b(?:href|src)=["'](?:\.\.\/)*-3["']/i.test(html)) {
    result.errors.push(`${relativePath}: broken shared asset path ending in "-3".`);
  }

  const cssVersionPattern = /\b(?:href|src)=["'](?:\.\.\/)*src\/styles\.css\?v=([^"']+)["']/gi;
  let cssMatch;
  while ((cssMatch = cssVersionPattern.exec(html))) {
    if (cssMatch[1] !== CURRENT_CSS_VERSION) {
      result.errors.push(`${relativePath}: shared CSS version is ${cssMatch[1]}, expected ${CURRENT_CSS_VERSION}.`);
    }
  }

  const scriptVersionPattern = /\b(?:href|src)=["'](?:\.\.\/)*src\/script\.js\?v=([^"']+)["']/gi;
  let scriptMatch;
  while ((scriptMatch = scriptVersionPattern.exec(html))) {
    if (scriptMatch[1] !== CURRENT_SCRIPT_VERSION) {
      result.errors.push(`${relativePath}: shared script version is ${scriptMatch[1]}, expected ${CURRENT_SCRIPT_VERSION}.`);
    }
  }

  const assetPattern = /\b(?:src|href)=["']([^"']+\.(?:png|jpe?g|webp))(?:\?[^"']*)?["']/gi;
  let match;
  while ((match = assetPattern.exec(html))) {
    const value = match[1];
    if (/^https?:\/\//i.test(value)) {
      continue;
    }
    referencedImagePaths.add(normalizeReferencedImagePath(relativePath, value));
  }
}

for (const book of result.books) {
  if (book.id && !sitemapUrls.has(publicBookUrl(book))) {
    result.errors.push(`${book.id}: missing from sitemap.xml.`);
  }
  if (book.cover && !/^https?:\/\//i.test(book.cover)) {
    referencedImagePaths.add(String(book.cover).replace(/^(\.\.\/)+/, "").replace(/^\.\//, ""));
  }
}

for (const relativePath of publicHtmlPaths) {
  const publicUrl = pathToPublicUrl(relativePath);
  if (!sitemapUrls.has(publicUrl)) {
    result.warnings.push(`${relativePath}: public HTML page is not listed in sitemap.xml.`);
  }
}

for (const imagePath of Array.from(referencedImagePaths).sort()) {
  const absolutePath = path.join(ROOT, imagePath);
  if (!fs.existsSync(absolutePath)) {
    result.errors.push(`Referenced image not found: ${imagePath}`);
    continue;
  }
  const sizeMb = fs.statSync(absolutePath).size / 1024 / 1024;
  if (sizeMb > 2) {
    result.warnings.push(`Large referenced image may slow GitHub Pages loading: ${imagePath} (${sizeMb.toFixed(1)} MB)`);
  }
}

printReport("Happy eBook site preflight", result);
console.log(`\nPublic HTML pages: ${publicHtmlPaths.length}`);
console.log(`Sitemap URLs: ${sitemapUrls.size}`);

if (result.errors.length) {
  process.exit(1);
}

console.log("\nPASS: site data, pages, assets, and sitemap checks completed.");
