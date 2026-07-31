const fs = require("fs");
const path = require("path");
const {
  ROOT,
  changefreqForPath,
  collectPublicHtmlPaths,
  lastModifiedForPath,
  pathToPublicUrl,
  priorityForPath,
  xmlEscape,
} = require("./site-utils");

const paths = collectPublicHtmlPaths();
const urls = paths.map((relativePath) => ({
  loc: pathToPublicUrl(relativePath),
  lastmod: lastModifiedForPath(relativePath),
  changefreq: changefreqForPath(relativePath),
  priority: priorityForPath(relativePath),
}));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.flatMap((url) => [
    "  <url>",
    `    <loc>${xmlEscape(url.loc)}</loc>`,
    `    <lastmod>${url.lastmod}</lastmod>`,
    `    <changefreq>${url.changefreq}</changefreq>`,
    `    <priority>${url.priority}</priority>`,
    "  </url>",
  ]),
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");

const bookUrlCount = urls.filter((url) => url.loc.includes("/books/")).length;
console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
console.log(`Book URLs: ${bookUrlCount}`);
