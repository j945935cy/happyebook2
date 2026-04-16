const sampleBooks = [
  { id: "happy-ipas-site", title: "快樂學習 iPAS 一次就過！", subtitle: "iPAS AI 應用規劃師的講義、考綱與備考資源網站", author: "Happy iPAS", category: "證照學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-happy-ipas.svg", description: "整理 iPAS AI 應用規劃師的講義、考古題解析、考試攻略與備考資源。", downloadUrl: "", buyUrl: "", readUrl: "https://happyipasai.blogspot.com/", featured: true, popular: true, priceLabel: "免費閱讀" },
  { id: "ipas-ai-planner-play-book", title: "iPAS AI 規劃師一次考過", subtitle: "Google Play Books 上的 iPAS AI 規劃師書籍頁", author: "Google Play Books", category: "證照學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-ipas-play.svg", description: "直接連到 Google Play Books 的 iPAS AI 規劃師作品頁，方便查看書籍資訊與閱讀入口。", downloadUrl: "", buyUrl: "", readUrl: "https://play.google.com/store/books/details/iPAS_AI_%E8%A6%8F%E5%8A%83%E5%B8%AB%E4%B8%80%E6%AC%A1%E8%80%83%E9%81%8E?id=Q3itEQAAQBAJ&hl=en_US", featured: true, popular: true, priceLabel: "提供試閱版" },
  { id: "ipas-ai-high-score-play-book", title: "不死背，也能高分的 iPAS AI", subtitle: "以理解取代死背的 iPAS AI 應考學習書", author: "證照達人研究室 AI 組", category: "證照學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-ipas-ai-high-score.svg", description: "聚焦 iPAS AI 重點觀念、理解式記憶與高分準備節奏，直接連到 Google Play Books 書籍頁。", downloadUrl: "", buyUrl: "", readUrl: "https://play.google.com/store/books/details/%E8%AD%89%E7%85%A7%E9%81%94%E4%BA%BA%E7%A0%94%E7%A9%B6%E5%AE%A4AI_%E7%B5%84_%E4%B8%8D%E6%AD%BB%E8%83%8C_%E4%B9%9F%E8%83%BD%E9%AB%98%E5%88%86%E7%9A%84_iPAS_AI?id=gB2zEQAAQBAJ&hl=zh_TW", featured: true, popular: true, priceLabel: "提供試閱版" },
  { id: "english-speaking-play", title: "漸進式英語會話訓練", subtitle: "100 句入門，400 句輕鬆開口", author: "證照達人研究室英文組", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-english-speaking.svg", description: "用漸進式句型練習英文會話，從入門到自然開口。", downloadUrl: "", buyUrl: "", readUrl: "https://play.google.com/store/books/details/Jack_%E6%BC%B8%E9%80%B2%E5%BC%8F%E8%8B%B1%E8%AA%9E%E6%9C%83%E8%A9%B1%E8%A8%93%E7%B7%B4?id=t8iwEQAAQBAJ", featured: true, popular: true, priceLabel: "提供試閱版" },
  { id: "english-grammar-play-2", title: "英文語法入門教學書", subtitle: "用句型理解，不靠死背", author: "證照達人研究室英文組", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-english-grammar-play.svg", description: "給學生與自學者的英文句子感建立指南，適合從句型理解打基礎。", downloadUrl: "", buyUrl: "", readUrl: "https://play.google.com/store/books/details/%E8%AD%89%E7%85%A7%E9%81%94%E4%BA%BA%E7%A0%94%E7%A9%B6%E5%AE%A4%E8%8B%B1%E6%96%87%E7%B5%84_%E8%8B%B1%E6%96%87%E8%AA%9E%E6%B3%95%E5%85%A5%E9%96%80%E6%95%99%E5%AD%B8%E6%9B%B8_%E7%94%A8%E5%8F%A5%E5%9E%8B%E7%90%86%E8%A7%A3_%E4%B8%8D%E9%9D%A0%E6%AD%BB%E8%83%8C?id=c8GxEQAAQBAJ", featured: true, popular: true, priceLabel: "提供試閱版" },
  { id: "speech-english-play", title: "用演說學英文", subtitle: "用演說文本建立英語表達力", author: "證照達人研究室英文組", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-speech-english-play.svg", description: "透過演說與表達情境學英文，兼顧句型、語感與口語表達。", downloadUrl: "", buyUrl: "", readUrl: "https://play.google.com/store/books/details/%E8%AD%89%E7%85%A7%E9%81%94%E4%BA%BA%E7%A0%94%E7%A9%B6%E5%AE%A4%E8%8B%B1%E6%96%87%E7%B5%84_%E7%94%A8%E6%BC%94%E8%AA%AA%E5%AD%B8%E8%8B%B1%E6%96%87?id=IN2uEQAAQBAJ", featured: true, popular: true, priceLabel: "提供試閱版" },
  { id: "author-works-google-search", title: "證照達人研究室作品總覽", subtitle: "用 Google 搜尋快速瀏覽作者公開書籍與作品入口", author: "證照達人研究室", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/author-directory-thumb.svg", description: "整理作者相關作品入口，方便從搜尋結果快速查看已公開的英文與證照類書籍。", downloadUrl: "", buyUrl: "", readUrl: "https://www.google.com.tw/search?q=inauthor%3A%22%E8%AD%89%E7%85%A7%E9%81%94%E4%BA%BA%E7%A0%94%E7%A9%B6%E5%AE%A4%22&sca_esv=829b6725c1213f11&hl=zh-TW&udm=36&biw=1870&bih=927&sxsrf=ANbL-n65RJZjyeEfEOxeAdRtsc7fHdFPtQ%3A1776161409058&ei=gRLeadqhA8Xg2roP_-aX4As&ved=0ahUKEwia5ubujO2TAxVFsFYBHX_zBbwQ4dUDCBM&uact=5&oq=inauthor%3A%22%E8%AD%89%E7%85%A7%E9%81%94%E4%BA%BA%E7%A0%94%E7%A9%B6%E5%AE%A4%22&gs_lp=EhBnd3Mtd2l6LW1vZGVsZXNzIiBpbmF1dGhvcjoi6K2J54Wn6YGU5Lq656CU56m25a6kIkiUFlDmDVjGEnABeACQAQCYATOgAY8BqgEBM7gBA8gBAPgBAZgCAKACAJgDAIgGAZIHAKAHmQGyBwC4BwDCBwDIBwCACAA&sclient=gws-wiz-modeless", featured: true, popular: false, priceLabel: "瀏覽作品" },
  { id: "data-structure-life", title: "資料怎麼排，事情就怎麼順", subtitle: "一本用生活與工作案例理解資料結構的靜態網頁書", author: "Happy eBook 編輯部", category: "資料結構", type: "web", format: "網站閱讀", cover: "../assets/images/book-data-structure-life.svg", description: "把資料結構放回整理、查找、分類、排程與協作場景，讓一般讀者也能看懂。", downloadUrl: "", buyUrl: "", readUrl: "https://j945935cy.github.io/datastruct-in-life-work-book/", featured: true, popular: true, priceLabel: "免費閱讀" },
  { id: "algorithm-life-work", title: "日常與職場的演算法應用", subtitle: "用日常與職場情境帶讀者理解資料結構與演算法", author: "Happy eBook 編輯部", category: "演算法", type: "web", format: "網站閱讀", cover: "../assets/images/book-algorithm-life.svg", description: "從排序、搜尋、排程到配對與指派，整理成可直接閱讀的章節式網頁書。", downloadUrl: "", buyUrl: "", readUrl: "https://j945935cy.github.io/algo-in-life-work-book/", featured: true, popular: true, priceLabel: "免費閱讀" },
  { id: "grammar-beginners-v2", title: "國中英文文法入門", subtitle: "42 章完整國中文法教材", author: "Happy eBook 編輯部", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-grammar-beginners.svg", description: "完整收錄國中三年英文文法，適合學生循序學習與教師教學使用。", downloadUrl: "", buyUrl: "", readUrl: "https://j945935cy.github.io/Grammar-for-Beginners-V2/", featured: true, popular: true, priceLabel: "免費閱讀" },
  { id: "ebook-wsl2-online", title: "從 Windows 開始學 Linux", subtitle: "用 WSL2 從安裝一路走到實作、工具鏈與學習節奏", author: "Happy eBook 編輯部", category: "Linux 入門", type: "web", format: "網站閱讀", cover: "../assets/images/book-wsl2-linux.svg", description: "以多頁式閱讀與實作導向設計整理 WSL2、Linux 指令、工具鏈與學習路線。", downloadUrl: "", buyUrl: "", readUrl: "https://j945935cy.github.io/ebook-wsl2/", featured: true, popular: true, priceLabel: "免費閱讀" },
  { id: "word-builder-1200", title: "Word Builder 1200", subtitle: "1200 個核心英文單字的互動式網頁版閱讀教材", author: "Happy eBook 編輯部", category: "英語學習", type: "web", format: "網站閱讀", cover: "../assets/images/book-word-builder-1200.svg", description: "適合在瀏覽器直接閱讀的英文單字書，整理常用字彙並支援長時間閱讀。", downloadUrl: "", buyUrl: "", readUrl: "https://j945935cy.github.io/text2speech/word-builder-1200-single-file.html", featured: true, popular: true, priceLabel: "免費閱讀" }
];
const typeLabel = { free: "免費", paid: "付費", web: "網頁版" };
const scriptBase = new URL(".", document.currentScript?.src || window.location.href);
const siteConfig = {
  contactEmail: "t945935@gmail.com",
  googleFormUrl: "https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM/viewform",
  googleResponsesUrl: "https://docs.google.com/spreadsheets/d/REPLACE_WITH_YOUR_RESPONSE_SHEET/edit"
};
const loadBooks = async () => { try { const response = await fetch(new URL("books.json", scriptBase)); if (!response.ok) throw new Error(`HTTP ${response.status}`); return await response.json(); } catch (error) { console.warn("books.json 載入失敗，改用內建資料：", error); return sampleBooks; } };
const isPublished = (book) => book.published !== false;
const isFreeBook = (book) => book.type === "free" || book.priceLabel?.includes("免費");
const hasPreview = (book) => book.priceLabel?.includes("試閱") || book.readUrl?.includes("play.google.com/store/books");
const createTags = (book) => [
  book.type === "free" ? "" : `<span class="tag ${book.type}">${typeLabel[book.type] || book.type}</span>`,
  isFreeBook(book) ? `<span class="tag free">Free</span>` : "",
  hasPreview(book) ? `<span class="tag preview">提供試閱版</span>` : "",
  `<span class="tag category">${book.category}</span>`
].filter(Boolean).join("");
const primaryAction = (book) => book.type === "free" ? `<a class="button primary" href="${book.downloadUrl || "#"}" target="_blank" rel="noopener noreferrer">下載閱讀</a>` : book.type === "paid" ? `<a class="button primary" href="${book.buyUrl || "#"}" target="_blank" rel="noopener noreferrer">立即購買</a>` : `<a class="button primary" href="${book.readUrl || `book.html?id=${book.id}`}" target="_blank" rel="noopener noreferrer">前往閱讀</a>`;
const createBookCard = (book) => `<article class="book-card"><div class="book-card-media"><img src="${book.cover}" alt="${book.title} 書封"></div><div class="book-card-body"><h3>${book.title}</h3><p class="book-meta">${book.author} ・ ${book.format}</p><div class="tag-row">${createTags(book)}</div><p>${book.description}</p><div class="card-actions">${primaryAction(book)}<a class="card-link" href="book.html?id=${book.id}">更多資訊</a></div></div></article>`;
const renderList = (selector, books) => { const target = document.querySelector(selector); if (target) target.innerHTML = books.map(createBookCard).join(""); };
const setText = (selector, value) => { const target = document.querySelector(selector); if (target) target.textContent = value; };
const uniqueCategories = (books) => [...new Set(books.map((book) => book.category))];
const isPlaceholderUrl = (value) => !value || value.includes("REPLACE_WITH_YOUR");
const bindExternalLinks = () => {
  document.querySelectorAll("[data-google-form-link]").forEach((link) => {
    link.href = siteConfig.googleFormUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
  });
  document.querySelectorAll("[data-google-form-responses-link]").forEach((link) => {
    link.href = siteConfig.googleResponsesUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
  });
};
const initSubmitPage = () => {
  const status = document.querySelector("[data-google-form-status]");
  if (!status) return;
  const configured = !isPlaceholderUrl(siteConfig.googleFormUrl);
  status.textContent = configured
    ? "已設定 Google 表單收件連結，作者可直接前往表單投稿。"
    : "尚未填入正式 Google 表單網址，請先在 script.js 更新 googleFormUrl。";
  status.classList.toggle("is-warning", !configured);
};
const initAdminPageLinks = () => {
  const status = document.querySelector("[data-google-responses-status]");
  if (!status) return;
  const formConfigured = !isPlaceholderUrl(siteConfig.googleFormUrl);
  const responsesConfigured = !isPlaceholderUrl(siteConfig.googleResponsesUrl);
  if (formConfigured && responsesConfigured) {
    status.textContent = "已設定 Google 表單與回應試算表連結，可直接查看投稿回應並手動上架作品。";
    return;
  }
  status.textContent = "請先在 script.js 更新 googleFormUrl 與 googleResponsesUrl，才能開始正式收件。";
  status.classList.add("is-warning");
};
const initContactPage = () => {
  const form = document.querySelector("[data-contact-form]");
  const message = document.querySelector("[data-contact-message]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const content = String(data.message || "").trim();
    if (!name || !email || !content) {
      if (message) message.textContent = "請先完整填寫姓名、Email 與訊息內容。";
      return;
    }

    const subject = `Happy eBook 聯絡表單｜${name}`;
    const body = [
      `姓名：${name}`,
      `Email：${email}`,
      "",
      "訊息內容：",
      content
    ].join("\n");
    const mailtoUrl = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (message) message.textContent = `已為你開啟寄信內容，收件人是 ${siteConfig.contactEmail}。`;
    window.location.href = mailtoUrl;
  });
};
const initHome = async () => {
  const books = (await loadBooks()).filter(isPublished);
  const featuredBooks = books.filter((book) => book.featured);
  const categories = uniqueCategories(books);
  const filterWrap = document.querySelector("[data-home-category-filters]");
  const tagWrap = document.querySelector("[data-home-category-tags]");
  const summary = document.querySelector("[data-home-filter-summary]");
  const grid = document.querySelector("[data-home-books]");
  let activeCategory = "all";

  setText("[data-stat-total]", books.length);
  setText("[data-stat-categories]", categories.length);
  setText("[data-stat-web]", books.filter((book) => book.type === "web").length);

  if (tagWrap) tagWrap.innerHTML = categories.map((category) => `<span class="tag category">${category}</span>`).join("");
  if (!filterWrap || !grid) return;

  filterWrap.innerHTML = [
    `<button class="filter-chip is-active" data-home-category="all" type="button">全部</button>`,
    ...categories.map((category) => `<button class="filter-chip" data-home-category="${category}" type="button">${category}</button>`)
  ].join("");

  const render = () => {
    const filtered = featuredBooks.filter((book) => activeCategory === "all" || book.category === activeCategory).slice(0, 8);
    grid.innerHTML = filtered.length ? filtered.map(createBookCard).join("") : `<div class="empty-state"><h3>目前沒有符合條件的作品</h3><p>你可以切換分類，或前往書籍列表查看全部內容。</p></div>`;
    if (summary) summary.textContent = activeCategory === "all" ? `顯示 ${filtered.length} 本精選作品` : `${activeCategory}：${filtered.length} 本作品`;
  };

  filterWrap.querySelectorAll("[data-home-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.homeCategory;
      filterWrap.querySelectorAll("[data-home-category]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });
  render();
};
const initBooksPage = async () => { const books = (await loadBooks()).filter(isPublished); const grid = document.querySelector("[data-books-grid]"); const typeFilters = [...document.querySelectorAll("[data-type-filter]")]; const categoryFilters = [...document.querySelectorAll("[data-category-filter]")]; if (!grid) return; let activeType = "all"; let activeCategory = "all"; const render = () => { const filtered = books.filter((book) => (activeType === "all" || book.type === activeType) && (activeCategory === "all" || book.category === activeCategory)); grid.innerHTML = filtered.length ? filtered.map(createBookCard).join("") : `<div class="empty-state"><h3>目前沒有符合條件的作品</h3><p>你可以切換篩選條件，或之後再回來看看。</p></div>`; }; typeFilters.forEach((button) => button.addEventListener("click", () => { activeType = button.dataset.typeFilter; typeFilters.forEach((item) => item.classList.toggle("is-active", item === button)); render(); })); categoryFilters.forEach((button) => button.addEventListener("click", () => { activeCategory = button.dataset.categoryFilter; categoryFilters.forEach((item) => item.classList.toggle("is-active", item === button)); render(); })); render(); };
const initBookPage = async () => { const books = (await loadBooks()).filter(isPublished); const id = new URLSearchParams(window.location.search).get("id"); const book = books.find((item) => item.id === id) || books[0]; const target = document.querySelector("[data-book-detail]"); if (!target || !book) return; document.title = `${book.title} | Happy eBook`; target.innerHTML = `<div class="book-cover-panel"><div class="book-cover-stage"><img src="${book.cover}" alt="${book.title} 書封"></div></div><div class="book-content-panel"><div class="tag-row">${createTags(book)}</div><h1>${book.title}</h1><p class="book-summary">${book.subtitle}</p><p>${book.description}</p><div class="meta-list"><div class="meta-item"><span>作者</span><strong>${book.author}</strong></div><div class="meta-item"><span>分類</span><strong>${book.category}</strong></div><div class="meta-item"><span>格式</span><strong>${book.format}</strong></div><div class="meta-item"><span>取得方式</span><strong>${book.priceLabel}</strong></div></div><div class="cta-row">${primaryAction(book)}<a class="button secondary" href="books.html">返回列表</a></div></div>`; };
const initNav = () => {
  const nav = document.querySelector("[data-site-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const closeNav = () => {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "開啟主選單");
  };
  toggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") || false;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "關閉主選單" : "開啟主選單");
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  window.addEventListener("resize", () => { if (window.innerWidth > 760) closeNav(); });
};
const boot = () => {
  initNav();
  bindExternalLinks();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "books") initBooksPage();
  if (page === "book") initBookPage();
  if (page === "submit") initSubmitPage();
  if (page === "contact") initContactPage();
  if (page === "admin") initAdminPageLinks();
};
boot();
