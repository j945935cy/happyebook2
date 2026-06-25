const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const booksJsonPath = path.join(root, "src", "books.json");
const booksDir = path.join(root, "books");
const sitemapPath = path.join(root, "sitemap.xml");
const today = "2026-06-25";

const pendingNote = "Google Play Books 書籍 ID 與定價待確認";

const booksToAdd = [
  {
    id: "from-automate-this-to-ai-agents",
    title: "From Automate This to AI Agents",
    subtitle: "A practical map from workflow automation to AI agents",
    author: "Happy eBook",
    category: ["AI 學習", "AI Agent", "AI 工具應用"],
    cover: "assets/images/google-book-cover-images/GGKEY_SB1BS8Z5F3S_frontcover.png",
    description: "An English-language guide for readers who want to understand how traditional automation has evolved into AI-assisted workflows and agent-based systems. The book introduces practical concepts in plain language, helping readers connect scripts, tools, prompts, and autonomous task execution.",
    priceLabel: pendingNote
  },
  {
    id: "agent-age-autonomous-ai-employees",
    title: "The Agent Age: From Task Automation to Autonomous AI Employees",
    subtitle: "Understanding how AI agents change everyday work",
    author: "Happy eBook",
    category: ["AI 學習", "AI Agent", "AI 工具應用"],
    cover: "assets/images/google-book-cover-images/GGKEY_5HAXEPC68U3_frontcover.png",
    description: "This English book explains the shift from simple task automation to autonomous AI employees. It is written for readers who want a clear, non-technical overview of AI agents, workflow design, delegation, review points, and the new habits needed in agent-assisted work.",
    priceLabel: pendingNote
  },
  {
    id: "drawing-with-text-mermaid-ai-era",
    title: "Drawing with Text: Mermaid Diagramming in the AI Era",
    subtitle: "Create structured diagrams with Mermaid and AI tools",
    author: "Happy eBook",
    category: ["AI 學習", "Prompt Engineering", "數位出版"],
    cover: "assets/images/google-book-cover-images/GGKEY_P8490ZN22YL_frontcover.png",
    description: "A practical English introduction to Mermaid diagramming for the AI era. The book shows how text-based diagrams can help readers plan systems, explain workflows, document decisions, and collaborate with AI tools through clear structured prompts.",
    priceLabel: pendingNote
  },
  {
    id: "text-drawing-mermaid-ai-era",
    title: "用文字畫圖：AI 時代的 Mermaid 結構化圖表術",
    subtitle: "用 Mermaid 把流程、系統與想法畫清楚",
    author: "Happy eBook",
    category: ["AI 學習", "Prompt Engineering", "數位出版"],
    cover: "assets/images/google-book-cover-images/GGKEY_H0WYUBWUQP2_frontcover.png",
    description: "《用文字畫圖》介紹如何用 Mermaid 這種文字式圖表語法，把流程圖、架構圖、時序圖與學習筆記整理成清楚可維護的圖。內容適合想用 AI 協助整理概念、撰寫文件、規劃專案與製作教材的讀者。",
    priceLabel: pendingNote
  },
  {
    id: "python-0-to-functions",
    title: "Python 程式設計入門：從 0 到函式",
    subtitle: "從零開始建立 Python 語法與函式觀念",
    author: "Happy eBook",
    category: ["程式設計", "Python", "自學"],
    cover: "assets/images/google-book-cover-images/Python-for-Beginners-Book_output_google-books_cover.png",
    description: "這是一本給初學者的 Python 入門書，從安裝環境、變數、輸入輸出、條件判斷、迴圈、串列到函式逐步建立基礎。重點不是背語法，而是用小練習理解程式如何拆解問題。",
    priceLabel: pendingNote
  },
  {
    id: "ai-automation-toolbook",
    title: "AI 自動化工具書",
    subtitle: "用 AI 與自動化工具整理日常工作流程",
    author: "Happy eBook",
    category: ["AI 學習", "AI 工具應用", "自學"],
    cover: "assets/images/google-book-cover-images/ai-python-automation_epub_cover1.png",
    description: "《AI 自動化工具書》整理 AI 工具、自動化腳本與工作流程設計的入門觀念，適合想把重複任務變簡單的學生、教師與自學者。內容以實際情境出發，強調先理解流程，再選擇合適工具。",
    priceLabel: pendingNote
  },
  {
    id: "codex-learning-by-doing",
    title: "Codex 程式設計做中學",
    subtitle: "用實作任務學會與 Codex 協作寫程式",
    author: "Happy eBook",
    category: ["AI 學習", "Codex", "Vibe Coding", "程式設計"],
    cover: "assets/images/google-book-cover-images/codex-learning-by-doing-cover-1400x2100.png",
    description: "這本書用做中學的方式介紹 Codex 程式設計。讀者會從小任務開始，練習描述需求、閱讀修改結果、驗證頁面與整理錯誤，逐步建立與 AI coding 工具協作的基本能力。",
    priceLabel: pendingNote
  },
  {
    id: "agentic-web-development",
    title: "Agentic Web 開發實戰：AI 代理時代的網頁開發新標準",
    subtitle: "從靜態頁面到 AI 協作開發流程",
    author: "Happy eBook",
    category: ["AI 學習", "AI Agent", "Vibe Coding", "網頁開發"],
    cover: "assets/images/google-book-cover-images/GGKEY_522CB56QK81_frontcover.png",
    description: "《Agentic Web 開發實戰》討論 AI 代理時代的網頁開發工作流，包含需求拆解、頁面規劃、AI 協作修改、檢查清單與上線前驗證。內容聚焦初學者能理解的實作流程，而不是堆疊複雜框架。",
    priceLabel: pendingNote
  },
  {
    id: "sqlite-zero-beginner-guide",
    title: "SQLite 從零開始：初學者完整學習指南",
    subtitle: "用 SQLite 建立資料庫與 SQL 查詢基礎",
    author: "Happy eBook",
    category: ["程式設計", "資料庫", "自學"],
    cover: "assets/images/google-book-cover-images/SQL2026_cover1.png",
    description: "這是一本專注 SQLite 的初學者指南，從資料表、欄位、查詢、排序、篩選、關聯到實用資料整理逐步說明。它與網站上的《2026 現代 SQL 全書》定位不同，更適合作為 Google Play Books 的獨立入門書。",
    priceLabel: pendingNote
  },
  {
    id: "classic-english-writing-second-edition",
    title: "經典英文寫作：用名著句型訓練清楚表達（第二版）",
    subtitle: "用名著句型練習清楚、有層次的英文表達",
    author: "Happy eBook",
    category: ["英語/文學習", "寫作訓練"],
    cover: "assets/images/google-book-cover-images/GGKEY_U96JEDW85S4_frontcover.png",
    description: "第二版延續《經典英文寫作》的核心方向，透過名著句型練習清楚表達。內容適合想改善英文作文、段落展開與句型掌握的讀者，也適合作為教師設計寫作練習時的參考教材。",
    priceLabel: pendingNote
  },
  {
    id: "ipas-ai-high-score-2026-05",
    title: "不死背，也能高分的 iPAS AI 2026-5月版",
    subtitle: "以理解取代死背的 iPAS AI 應考學習書",
    author: "證照達人研究室 AI 組",
    category: ["iPAS AI", "AI 學習", "證照學習"],
    cover: "assets/images/google-book-cover-images/ipas-ai-basic-question-bank-2026-500-cover.jpg",
    description: "2026 年 5 月版聚焦 iPAS AI 應用規劃師考試準備，以白話整理重點觀念、常見題型與複習節奏。它適合不想只靠死背，而希望理解 AI、資料、模型與應用情境的考生。",
    priceLabel: pendingNote
  },
  {
    id: "speak-clearly-bilingual-google-play",
    title: "學會講清楚：從混亂表達到精準溝通的實戰練習（中英雙語對照版）",
    subtitle: "中英雙語對照的清楚表達練習書",
    author: "Speak Clearly Book 專案",
    category: ["英語/文學習", "溝通技巧", "自學"],
    cover: "assets/images/google-book-cover-images/speak-clearly-book_google_cover.png",
    description: "這是《學會講清楚》的 Google Play Books 付費版，加入中英雙語對照定位，幫助讀者練習把混亂想法整理成清楚句子、段落與說明。適合想提升表達、簡報、教學說明與雙語溝通的讀者。",
    priceLabel: pendingNote
  },
  {
    id: "ai-agent-development-workflows",
    title: "AI Agent Development Workflows",
    subtitle: "Practical patterns for building and reviewing agentic workflows",
    author: "Happy eBook",
    category: ["AI 學習", "AI Agent", "Prompt Engineering"],
    cover: "assets/images/google-book-cover-images/GGKEY_NUXU947DBBW_frontcover.png",
    description: "An English companion to the AI Agent workflow materials. The book explains how to describe goals, break work into tasks, connect tools, review outputs, and keep agentic workflows understandable for teams and individual learners.",
    priceLabel: pendingNote
  }
].map((book, index) => ({
  type: "paid",
  format: "Google Play Books 電子書",
  downloadUrl: "",
  buyUrl: "",
  readUrl: "",
  featured: true,
  popular: false,
  launchRank: 10 + index,
  ...book
}));

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const escapeAttr = escapeHtml;

const absoluteImage = (cover) => {
  const clean = String(cover || "").replace(/^\.\.\//, "");
  if (/^https?:\/\//.test(clean)) return clean;
  return `https://happyebook.com/${clean}`;
};

const shortTitle = (title) => title
  .replace(/^《/, "")
  .replace(/》.*/, "")
  .split("：")[0]
  .split(":")[0]
  .trim();

const createDetailPage = (book) => {
  const categories = Array.isArray(book.category) ? book.category : [book.category];
  const categoriesText = categories.filter(Boolean).join(" / ");
  const desc = book.description;
  const title = book.title;
  const pageUrl = `https://happyebook.com/books/${book.id}.html`;
  const imageUrl = absoluteImage(book.cover);
  const coverSrc = book.cover.startsWith("../") ? book.cover : `../${book.cover}`;
  const cta = book.buyUrl
    ? `<a class="button primary" href="${escapeAttr(book.buyUrl)}" target="_blank" rel="noopener noreferrer">前往 Google Play Books</a>`
    : `<span class="button primary is-disabled" aria-disabled="true">Google Play Books 資訊待確認</span>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: title,
    description: desc,
    author: { "@type": "Person", name: book.author },
    publisher: { "@type": "Organization", name: "Happy eBook" },
    inLanguage: /[A-Za-z]/.test(title) && !/[一-龥]/.test(title) ? "en" : "zh-TW",
    genre: categories[0] || "電子書",
    url: pageUrl,
    image: imageUrl,
    isPartOf: { "@type": "WebSite", name: "Happy eBook", url: "https://happyebook.com/" }
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Happy eBook", item: "https://happyebook.com/" },
      { "@type": "ListItem", position: 2, name: "書籍列表", item: "https://happyebook.com/books.html" },
      { "@type": "ListItem", position: 3, name: shortTitle(title), item: pageUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Happy eBook</title>
  <meta name="description" content="${escapeAttr(desc)}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
  <meta property="og:type" content="book">
  <meta property="og:title" content="${escapeAttr(title)} | Happy eBook">
  <meta property="og:description" content="${escapeAttr(desc)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${escapeAttr(title)} 書封">
  <meta property="og:site_name" content="Happy eBook">
  <meta property="og:locale" content="zh_TW">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)} | Happy eBook">
  <meta name="twitter:description" content="${escapeAttr(desc)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeAttr(title)} 書封">
  <link rel="stylesheet" href="../src/styles.css?v=20260615-1">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>
</head>
<body data-page="static-book">
  <div class="site-shell">
    <header class="site-header"><div class="container header-row"><a class="brand" href="../index.html"><span class="brand-mark">Happy eBook</span><span class="brand-sub">單本作品介紹</span></a><button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-label="開啟主選單"><span class="nav-toggle-bars" aria-hidden="true"></span><span>選單</span></button><nav class="site-nav" data-site-nav><a href="../index.html">首頁</a><a href="../books.html">書籍列表</a><a href="../learning/ipas-ai.html">iPAS AI</a><a href="https://english-daily-sentence.vercel.app/" target="_blank" rel="noopener noreferrer">每日英文學習</a><a href="../about.html">關於</a><a href="../contact.html">聯絡</a></nav></div></header>
    <main>
      <section class="page-hero"><div class="container"><span class="eyebrow">Google Play Books</span><h1>${escapeHtml(shortTitle(title))}</h1><p>${escapeHtml(book.subtitle)}</p></div></section>
      <section class="section"><div class="container book-detail"><div class="book-cover-panel"><div class="book-cover-stage"><img src="${escapeAttr(coverSrc)}" alt="${escapeAttr(title)} 書封" loading="lazy" decoding="async"></div></div><div class="book-content-panel"><div class="tag-row"><span class="tag paid">付費購買</span><span class="tag preview">上架資訊待確認</span><span class="tag category">${escapeHtml(categoriesText)}</span></div><h1>${escapeHtml(title)}</h1><p class="book-summary">${escapeHtml(book.subtitle)}</p><p>${escapeHtml(desc)}</p><div class="meta-list"><div class="meta-item"><span>作者</span><strong>${escapeHtml(book.author)}</strong></div><div class="meta-item"><span>分類</span><strong>${escapeHtml(categoriesText)}</strong></div><div class="meta-item"><span>格式</span><strong>${escapeHtml(book.format)}</strong></div><div class="meta-item"><span>取得方式</span><strong>${escapeHtml(book.priceLabel)}</strong></div></div><div class="cta-row">${cta}<a class="button secondary" href="../books.html">返回列表</a></div></div></div></section>
    </main>
    <footer class="footer"><div class="container footer-bar"><span>Happy eBook</span><nav class="footer-nav" aria-label="頁尾導覽"><a href="../books.html">書籍列表</a><a href="../learning/ipas-ai.html">iPAS AI</a><a href="https://english-daily-sentence.vercel.app/" target="_blank" rel="noopener noreferrer">每日英文學習</a><a href="../about.html">關於</a><a href="../contact.html">聯絡</a></nav></div></footer>
  </div>
  <script src="../src/script.js?v=20260615-1"></script>
</body>
</html>
`;
};

const books = JSON.parse(fs.readFileSync(booksJsonPath, "utf8"));
for (const book of booksToAdd) {
  const existingIndex = books.findIndex((item) => item.id === book.id);
  if (existingIndex === -1) {
    books.unshift(book);
  } else {
    books[existingIndex] = { ...books[existingIndex], ...book };
  }
  fs.writeFileSync(path.join(booksDir, `${book.id}.html`), createDetailPage(book), "utf8");
}
fs.writeFileSync(booksJsonPath, `${JSON.stringify(books, null, 2)}\n`, "utf8");

let sitemap = fs.readFileSync(sitemapPath, "utf8");
for (const book of booksToAdd) {
  const loc = `https://happyebook.com/books/${book.id}.html`;
  if (sitemap.includes(loc)) continue;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
  sitemap = sitemap.replace("</urlset>", `${entry}</urlset>`);
}
fs.writeFileSync(sitemapPath, sitemap, "utf8");

console.log(`Added or updated ${booksToAdd.length} Google Play Books entries.`);

