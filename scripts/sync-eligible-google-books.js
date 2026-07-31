#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.resolve(__dirname, "..");
const partnerPath = process.argv[2];
if (!partnerPath) throw new Error("Usage: node scripts/sync-eligible-google-books.js <partner-json>");

const booksPath = path.join(root, "src", "books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
const rows = JSON.parse(fs.readFileSync(partnerPath, "utf8"));
const eligible = rows.filter((row) => row.status === "在 Google Play 開始販售" && row.googleBooksId);

function googleId(book) {
  return String(book.buyUrl || book.readUrl || "").match(/[?&]id=([^&]+)/)?.[1] || "";
}

function aboutUrl(id) {
  return `https://books.google.com.tw/books/about?id=${id}&redir_esc=y`;
}

function coverUrl(id) {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife`;
}

function html(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(title, key) {
  const vol = title.match(/Vol\.(\d+)/i)?.[1];
  const ascii = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 64);
  const suffix = key.replace("GGKEY:", "").toLowerCase();
  return `${ascii || "google-play-book"}${vol && !ascii.includes(`vol-${vol}`) ? `-vol-${vol}` : ""}-${suffix}`;
}

function uniqueId(base) {
  const ids = new Set(books.map((book) => book.id));
  let candidate = base;
  let n = 2;
  while (ids.has(candidate)) candidate = `${base}-${n++}`;
  return candidate;
}

function splitTitle(fullTitle) {
  const volumeSplit = fullTitle.match(/^(.*?（Vol\.\d+）)：(.+)$/);
  if (volumeSplit) return { title: volumeSplit[1], subtitle: volumeSplit[2] };
  const index = fullTitle.indexOf("：");
  if (index < 0) return { title: fullTitle, subtitle: "Google Play Books 電子書" };
  return { title: fullTitle.slice(0, index), subtitle: fullTitle.slice(index + 1) };
}

function categories(title) {
  const result = [];
  if (/iPAS/i.test(title)) result.push("iPAS AI", "證照考試");
  if (/資安|安全|Security/i.test(title)) result.push("資安");
  if (/英文|English|Romeo|Shrew|文法|伊索/i.test(title)) result.push("英文學習");
  if (/AI|LLM|RAG|MCP|Codex|Agent|ChatGPT/i.test(title)) result.push("AI 學習");
  if (/Codex|Coding|SQL|RAG|MCP|Agent/i.test(title)) result.push("AI Coding");
  return [...new Set(result)].slice(0, 4).length ? [...new Set(result)].slice(0, 4) : ["電子書"];
}

function priceLabel(price) {
  return `NT$${price}，Google Play Books，提供試閱版`;
}

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const type = String(res.headers["content-type"] || "");
        if (res.statusCode !== 200 || !type.startsWith("image/")) {
          reject(new Error(`Cover download failed: ${res.statusCode} ${type} ${url}`));
          return;
        }
        resolve({ body: Buffer.concat(chunks), extension: type.includes("png") ? "png" : "jpg" });
      });
    }).on("error", reject);
  });
}

function staticPage(book) {
  const pageUrl = `https://happyebook.com/books/${book.id}.html`;
  const imageUrl = `https://happyebook.com/${book.cover}`;
  const category = Array.isArray(book.category) ? book.category.join(" / ") : book.category;
  const title = html(book.title);
  const subtitle = html(book.subtitle || "Google Play Books 電子書");
  const description = html(book.description);
  const author = html(book.author);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    author: { "@type": "Person", name: book.author },
    publisher: { "@type": "Organization", name: "Happy eBook" },
    inLanguage: "zh-TW",
    genre: category,
    url: pageUrl,
    image: imageUrl,
    identifier: book.googleBooksKey,
  }).replace(/</g, "\\u003c");
  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Happy eBook", item: "https://happyebook.com/" },
      { "@type": "ListItem", position: 2, name: "書籍列表", item: "https://happyebook.com/books.html" },
      { "@type": "ListItem", position: 3, name: book.title, item: pageUrl },
    ],
  }).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Happy eBook</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
  <meta property="og:type" content="book">
  <meta property="og:title" content="${title} | Happy eBook">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${title} 書封">
  <meta property="og:site_name" content="Happy eBook">
  <meta property="og:locale" content="zh_TW">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} | Happy eBook">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="stylesheet" href="../src/styles.css?v=20260627-3">
  <script type="application/ld+json">${jsonLd}</script>
  <script type="application/ld+json">${breadcrumb}</script>
  <script defer src="../src/analytics.js"></script>
</head>
<body data-page="static-book">
  <div class="site-shell">
    <header class="site-header"><div class="container header-row"><a class="brand" href="../index.html"><span class="brand-mark">Happy eBook</span><span class="brand-sub">單本作品介紹</span></a><button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-label="開啟主選單"><span class="nav-toggle-bars" aria-hidden="true"></span><span>選單</span></button><nav class="site-nav" data-site-nav><a href="../index.html">首頁</a><a href="../books.html">書籍列表</a><a href="../learning/ipas-ai.html">iPAS AI</a><a href="https://english-daily-sentence.vercel.app/" target="_blank" rel="noopener noreferrer">每日英文學習</a><a href="../about.html">關於</a><a href="../contact.html">聯絡</a></nav></div></header>
    <main>
      <section class="page-hero"><div class="container"><span class="eyebrow">Google Play Books</span><h1>${title}</h1><p>${subtitle}</p></div></section>
      <section class="section"><div class="container book-detail"><div class="book-cover-panel"><div class="book-cover-stage"><img src="../${html(book.cover)}" alt="${title} 書封" loading="lazy" decoding="async"></div></div><div class="book-content-panel"><div class="tag-row"><span class="tag paid">付費購買</span><span class="tag preview">提供試閱版</span><span class="tag category">${html(category)}</span></div><h1>${title}</h1><p class="book-summary">${subtitle}</p><p>${description}</p><div class="meta-list"><div class="meta-item"><span>作者</span><strong>${author}</strong></div><div class="meta-item"><span>分類</span><strong>${html(category)}</strong></div><div class="meta-item"><span>格式</span><strong>Google Play Books 電子書</strong></div><div class="meta-item"><span>取得方式</span><strong>${html(book.priceLabel)}</strong></div></div><div class="cta-row"><a class="button primary" href="${html(book.buyUrl)}" target="_blank" rel="noopener noreferrer">立即購買</a><a class="button secondary" href="../books.html">返回列表</a></div></div></div></section>
    </main>
    <footer class="footer"><div class="container footer-bar"><span>Happy eBook</span><nav class="footer-nav" aria-label="頁尾導覽"><a href="../books.html">書籍列表</a><a href="../learning/ipas-ai.html">iPAS AI</a><a href="https://english-daily-sentence.vercel.app/" target="_blank" rel="noopener noreferrer">每日英文學習</a><a href="../about.html">關於</a><a href="../contact.html">聯絡</a></nav></div></footer>
  </div>
  <script src="../src/script.js?v=20260703-2"></script>
</body>
</html>
`;
}

async function main() {
  const byKey = new Map(books.filter((book) => book.googleBooksKey).map((book) => [book.googleBooksKey, book]));
  const byGoogleId = new Map(books.map((book) => [googleId(book), book]).filter(([id]) => id));
  const coverDirectory = path.join(root, "assets", "images", "google-book-cover-images");
  fs.mkdirSync(coverDirectory, { recursive: true });
  const added = [];
  const updated = [];
  let rank = Math.max(0, ...books.map((book) => Number(book.launchRank) || 0));

  for (const row of eligible) {
    let book = byKey.get(row.googleBooksKey) || byGoogleId.get(row.googleBooksId);
    if (!book) {
      const split = splitTitle(row.title);
      const id = uniqueId(slugify(split.title, row.googleBooksKey));
      book = {
        type: "paid",
        format: "Google Play Books 電子書",
        downloadUrl: "",
        buyUrl: aboutUrl(row.googleBooksId),
        readUrl: aboutUrl(row.googleBooksId),
        featured: false,
        popular: false,
        launchRank: ++rank,
        id,
        title: split.title,
        subtitle: split.subtitle,
        author: row.author || "Happy eBook Authors",
        category: categories(row.title),
        cover: "",
        description: row.description || `《${split.title}》是 ${row.author || "Happy eBook Authors"} 發布於 Google Play Books 的電子書。本頁提供作品介紹、分類、定價，以及 Google Play Books 試閱與購買入口。`,
        priceLabel: priceLabel(row.price),
        googleBooksKey: row.googleBooksKey,
      };
      books.unshift(book);
      added.push({ id: book.id, key: row.googleBooksKey, title: book.title });
    } else {
      book.googleBooksKey = row.googleBooksKey;
      book.buyUrl = aboutUrl(row.googleBooksId);
      book.readUrl = aboutUrl(row.googleBooksId);
      book.priceLabel = priceLabel(row.price);
      updated.push({ id: book.id, key: row.googleBooksKey });
    }

    const cover = await fetchImage(row.coverUrl || coverUrl(row.googleBooksId));
    const relativeCover = `assets/images/google-book-cover-images/GGKEY_${row.googleBooksKey.replace("GGKEY:", "")}_partner-cover.${cover.extension}`;
    fs.writeFileSync(path.join(root, relativeCover), cover.body);
    book.cover = relativeCover;
    fs.writeFileSync(path.join(root, "books", `${book.id}.html`), staticPage(book), "utf8");
  }

  fs.writeFileSync(booksPath, `${JSON.stringify(books, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ eligible: eligible.length, added: added.length, updated: updated.length, addedItems: added }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
