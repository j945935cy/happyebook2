const sampleBooks = [
  { id: "sample-web-book", title: "Happy eBook 範例作品", subtitle: "books.json 載入失敗時的備援資料", author: "Happy eBook 編輯部", category: "平台說明", type: "web", format: "網站閱讀", cover: "../assets/images/book-linux-beginner.svg", description: "這是離線或資料載入失敗時顯示的最小範例，正式書籍資料請以 books.json 為準。", downloadUrl: "", buyUrl: "", readUrl: "books.html", featured: true, popular: false, priceLabel: "免費閱讀" },
  { id: "sample-submit-guide", title: "作者投稿說明", subtitle: "了解如何提交作品給 Happy eBook", author: "Happy eBook 編輯部", category: "平台說明", type: "free", format: "投稿說明", cover: "../assets/images/book-git-github-start.svg", description: "提供投稿流程、作品資料準備與人工審核方向，方便作者快速理解平台收件方式。", downloadUrl: "", buyUrl: "", readUrl: "submit.html", featured: false, popular: false, priceLabel: "免費閱讀" }
];
const typeLabel = { free: "免費", paid: "付費", web: "網頁版" };
const fallbackCoverDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900"><rect width="640" height="900" fill="#dbeafe"/><rect x="52" y="52" width="536" height="796" rx="24" fill="#eff6ff"/><text x="320" y="420" text-anchor="middle" fill="#1e3a5f" font-size="34" font-family="Noto Sans TC, sans-serif">封面載入中</text><text x="320" y="468" text-anchor="middle" fill="#4b6b8d" font-size="24" font-family="Noto Sans TC, sans-serif">已改用預設封面</text></svg>')}`;
const getCoverSources = (cover) => {
  const primary = String(cover || "").trim();
  if (!primary) return [];
  const candidates = [primary];
  if (primary.startsWith("../")) candidates.push(primary.slice(3));
  return [...new Set(candidates)];
};
let coverObserver;
let coverLoadSuccessCount = 0;
let coverLoadFailureCount = 0;
let disableCoverRequests = false;
const scriptBase = new URL(".", document.currentScript?.src || window.location.href);
const pagePath = window.location.pathname || "";
if (!pagePath.includes("/src/")) {
  // When server root is src/, ../assets paths are unreachable and cause repeated 404.
  disableCoverRequests = true;
}
const siteConfig = {
  contactEmail: "t945935@gmail.com",
  contactFormEndpoint: "https://formsubmit.co/ajax/t945935@gmail.com",
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfA4WUicLs82uVOzCBuAwa1AOUrKbloS0bRK_jepfrGULliag/viewform",
  googleResponsesUrl: "https://docs.google.com/spreadsheets/d/REPLACE_WITH_YOUR_RESPONSE_SHEET/edit",
  homeVisitsBadgeUrl: "https://views-counter.vercel.app/badge?pageId=happyebook2.home&label=%E8%A8%AA%E5%AE%A2%E4%BA%BA%E6%95%B8&leftColor=2563eb&rightColor=f28c28&type=total&style=none"
};
const isPublished = (book) => book.published !== false;
const isGoogleBooksUrl = (value) => String(value || "").includes("play.google.com/store/books");
const formatNumber = (value) => new Intl.NumberFormat("zh-TW").format(Number(value || 0));
const getEffectiveType = (book) => {
  if (book.type === "paid" || book.buyUrl) return "paid";
  if (isGoogleBooksUrl(book.readUrl)) return "web";
  if (book.type === "free" || book.downloadUrl || book.readUrl || book.priceLabel?.includes("免費")) return "free";
  return book.type || "web";
};
const isFreeWebBook = (book) => getEffectiveType(book) === "free" && !!book.readUrl;
const sortBooksForDisplay = (books) => books
  .slice()
  .reverse()
  .sort((left, right) => Number(isFreeWebBook(right)) - Number(isFreeWebBook(left)));
const loadBooks = async () => {
  try {
    const response = await fetch(new URL("books.json", scriptBase));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return sortBooksForDisplay(await response.json());
  } catch (error) {
    console.warn("books.json 載入失敗，改用內建資料：", error);
    return sortBooksForDisplay(sampleBooks);
  }
};
const isFreeBook = (book) => getEffectiveType(book) === "free";
const hasPreview = (book) => book.priceLabel?.includes("試閱") || isGoogleBooksUrl(book.readUrl);
const hasExternalUrl = (value) => /^https?:\/\//.test(String(value || "").trim());
const createTags = (book) => [
  getEffectiveType(book) === "free" ? "" : `<span class="tag ${getEffectiveType(book)}">${typeLabel[getEffectiveType(book)] || getEffectiveType(book)}</span>`,
  isFreeBook(book) ? `<span class="tag free">免費閱讀</span>` : "",
  hasPreview(book) ? `<span class="tag preview">提供試閱版</span>` : "",
  `<span class="tag category">${getCategories(book).join(' / ')}</span>`
].filter(Boolean).join("");
const primaryAction = (book) => {
  const detailUrl = `book.html?id=${book.id}`;
  const effectiveType = getEffectiveType(book);
  if (effectiveType === "free") {
    const href = book.downloadUrl || book.readUrl || detailUrl;
    const label = book.downloadUrl ? "下載閱讀" : book.readUrl ? "線上閱讀" : "查看詳情";
    const attrs = hasExternalUrl(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a class="button primary" href="${href}"${attrs}>${label}</a>`;
  }
  if (effectiveType === "paid") {
    const href = book.buyUrl || book.readUrl || detailUrl;
    const label = book.buyUrl ? "立即購買" : book.readUrl ? "查看試閱" : "查看詳情";
    const attrs = hasExternalUrl(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a class="button primary" href="${href}"${attrs}>${label}</a>`;
  }
  const href = book.readUrl || detailUrl;
  const attrs = hasExternalUrl(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
  return `<a class="button primary" href="${href}"${attrs}>前往閱讀</a>`;
};
const loadCoverIntoImage = (image) => {
  if (image.dataset.coverHydrated === "true") return;
  if (disableCoverRequests) return;
  image.dataset.coverHydrated = "true";
  const candidates = [image.dataset.coverSrc, image.dataset.coverSrc2].filter(Boolean);
  if (!candidates.length) return;

  let index = 0;
  const tryNext = () => {
    if (index >= candidates.length) return;
    const candidate = candidates[index++];
    const probe = new Image();
    probe.loading = "eager";
    probe.decoding = "async";
    probe.addEventListener("load", () => {
      coverLoadSuccessCount += 1;
      image.src = candidate;
      image.alt = image.dataset.coverAlt || image.alt;
    });
    probe.addEventListener("error", () => {
      coverLoadFailureCount += 1;
      if (coverLoadSuccessCount === 0 && coverLoadFailureCount >= 6) {
        disableCoverRequests = true;
        return;
      }
      tryNext();
    });
    probe.src = candidate;
  };
  tryNext();
};
const ensureCoverObserver = () => {
  if (coverObserver) return coverObserver;
  if (!("IntersectionObserver" in window)) return null;
  coverObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      loadCoverIntoImage(image);
      coverObserver.unobserve(image);
    });
  }, { rootMargin: "240px 0px" });
  return coverObserver;
};
const hydrateCoverImages = (container = document) => {
  const observer = ensureCoverObserver();
  container.querySelectorAll("img[data-cover-image]").forEach((image) => {
    if (observer) {
      observer.observe(image);
      return;
    }
    loadCoverIntoImage(image);
  });
};
const createBookCard = (book) => {
  const readHref = book.readUrl || `book.html?id=${book.id}`;
  const readAttrs = hasExternalUrl(readHref) ? ` target="_blank" rel="noopener noreferrer"` : "";
  const [coverSrc = "", coverSrc2 = ""] = getCoverSources(book.cover);
  return `<article class="book-card"><div class="book-card-media"><a href="${readHref}"${readAttrs} class="book-cover-link" aria-label="${book.title} 前往閱讀"><img data-cover-image src="${fallbackCoverDataUrl}" data-cover-src="${coverSrc}" data-cover-src-2="${coverSrc2}" data-cover-alt="${book.title} 書封" alt="${book.title} 書封（載入中）" loading="lazy" decoding="async"></a></div><div class="book-card-body"><div class="book-card-content"><h3>${book.title}</h3><p class="book-subtitle">${book.subtitle || ""}</p><p class="book-meta">${book.author} ・ ${book.format}</p><div class="tag-row">${createTags(book)}</div><p class="book-description">${book.description}</p></div><div class="card-actions">${primaryAction(book)}<a class="card-link" href="book.html?id=${book.id}">更多資訊</a></div></div></article>`;
};
const renderList = (selector, books) => { const target = document.querySelector(selector); if (!target) return; target.innerHTML = books.map(createBookCard).join(""); hydrateCoverImages(target); };
const setText = (selector, value) => { const target = document.querySelector(selector); if (target) target.textContent = value; };
const renderHomeVisits = () => {
  const target = document.querySelector("[data-stat-visits]");
  if (!target) return;
  target.classList.remove("is-unavailable");
  target.textContent = "讀取中";
  const image = new Image();
  image.src = siteConfig.homeVisitsBadgeUrl;
  image.alt = "首頁訪問人數";
  image.className = "visit-badge";
  image.loading = "eager";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("load", () => {
    target.classList.add("has-visit-badge");
    target.replaceChildren(image);
  });
  image.addEventListener("error", () => {
    target.classList.remove("has-visit-badge");
    target.classList.add("is-unavailable");
    target.textContent = "統計維護中";
  });
};
const populateStats = async (books) => {
  const categories = uniqueCategories(books);
  setText("[data-stat-total]", formatNumber(books.length));
  setText("[data-stat-categories]", formatNumber(categories.length));
  setText("[data-stat-web]", formatNumber(books.filter((book) => getEffectiveType(book) === "web").length));
  renderHomeVisits();
  return categories;
};
const getCategories = (book) => Array.isArray(book.category) ? book.category : [book.category];
const uniqueCategories = (books) => [...new Set(books.flatMap(getCategories))];
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
  const submitButton = form?.querySelector('button[type="submit"]');
  if (!form) return;

  form.addEventListener("submit", async (event) => {
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

    const payload = {
      name,
      email,
      message: content,
      _subject: subject,
      _template: "table",
      _captcha: "false"
    };

    if (submitButton) submitButton.disabled = true;
    if (message) message.textContent = "訊息送出中，請稍候...";

    try {
      const response = await fetch(siteConfig.contactFormEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (message) message.textContent = "已送出聯絡訊息，我們會盡快回覆你。";
      form.reset();
      return;
    } catch (error) {
      console.warn("聯絡表單送出失敗，改用 mailto 備援：", error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }

    const mailtoUrl = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (message) message.textContent = `系統送件失敗，已改為開啟寄信內容，收件人是 ${siteConfig.contactEmail}。`;
    window.location.href = mailtoUrl;
  });
};
const initHome = async () => {
  const books = (await loadBooks()).filter(isPublished);
  await populateStats(books);
};
const renderCategoryFilters = (books) => {
  document.querySelectorAll("[data-category-filter-list]").forEach((list) => {
    const baseButton = list.querySelector('[data-category-filter="all"]')?.outerHTML || '<button class="filter-chip is-active" data-category-filter="all" type="button">全部分類</button>';
    const buttons = uniqueCategories(books)
      .sort((left, right) => left.localeCompare(right, "zh-Hant"))
      .map((category) => `<button class="filter-chip" data-category-filter="${category}" type="button">${category}</button>`);
    list.innerHTML = [baseButton, ...buttons].join("");
  });
};
const initBooksPage = async () => {
  const books = (await loadBooks()).filter(isPublished);
  const grid = document.querySelector("[data-books-grid]");
  await populateStats(books);
  renderCategoryFilters(books);
  if (!grid) return;
  const typeFilters = [...document.querySelectorAll("[data-type-filter]")];
  const categoryFilters = [...document.querySelectorAll("[data-category-filter]")];
  let activeType = "all";
  let activeCategory = "all";
  const render = () => {
    const filtered = books.filter((book) => (activeType === "all" || getEffectiveType(book) === activeType) && (activeCategory === "all" || getCategories(book).includes(activeCategory)));
    grid.innerHTML = filtered.length ? filtered.map(createBookCard).join("") : `<div class="empty-state"><h3>目前沒有符合條件的作品</h3><p>你可以切換篩選條件，或之後再回來看看。</p></div>`;
    hydrateCoverImages(grid);
  };
  typeFilters.forEach((button) => button.addEventListener("click", () => {
    activeType = button.dataset.typeFilter;
    typeFilters.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  }));
  categoryFilters.forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.categoryFilter;
    categoryFilters.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  }));
  render();
};
const initBookPage = async () => { const books = (await loadBooks()).filter(isPublished); const id = new URLSearchParams(window.location.search).get("id"); const book = books.find((item) => item.id === id) || books[0]; const target = document.querySelector("[data-book-detail]"); const heroCopy = document.querySelector("[data-book-hero-copy]"); if (!target || !book) return; document.title = `${book.title} | Happy eBook`; const ldJson = document.createElement("script"); ldJson.type = "application/ld+json"; const categories = getCategories(book); const bookSchema = { "@context": "https://schema.org", "@type": "Book", "name": book.title, "description": book.description, "author": { "@type": "Person", "name": book.author }, "inLanguage": "zh-TW", "genre": categories[0] || "", "url": `https://happyebook.com/src/book.html?id=${book.id}`, "isPartOf": { "@type": "WebSite", "name": "Happy eBook", "url": "https://happyebook.com/" } }; if (book.buyUrl) bookSchema["offers"] = { "@type": "Offer", "url": book.buyUrl, "priceCurrency": "TWD" }; ldJson.textContent = JSON.stringify(bookSchema); document.head.appendChild(ldJson); if (heroCopy) heroCopy.textContent = book.heroCopy || "這裡會顯示書封、書名、副標、作者、分類、標籤、簡介、格式與操作按鈕。"; const [coverSrc = "", coverSrc2 = ""] = getCoverSources(book.cover); target.innerHTML = `<div class="book-cover-panel"><div class="book-cover-stage"><img data-cover-image src="${fallbackCoverDataUrl}" data-cover-src="${coverSrc}" data-cover-src-2="${coverSrc2}" data-cover-alt="${book.title} 書封" alt="${book.title} 書封（載入中）"></div></div><div class="book-content-panel"><div class="tag-row">${createTags(book)}</div><h1>${book.title}</h1><p class="book-summary">${book.subtitle}</p><p>${book.description}</p><div class="meta-list"><div class="meta-item"><span>作者</span><strong>${book.author}</strong></div><div class="meta-item"><span>分類</span><strong>${getCategories(book).join(' / ')}</strong></div><div class="meta-item"><span>格式</span><strong>${book.format}</strong></div><div class="meta-item"><span>取得方式</span><strong>${book.priceLabel}</strong></div></div><div class="cta-row">${primaryAction(book)}<a class="button secondary" href="books.html">返回列表</a></div></div>`; hydrateCoverImages(target); };
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

