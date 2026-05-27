const sampleBooks = [];

const typeLabel = { free: "免費閱讀", paid: "付費購買", web: "網站教材" };

const fallbackCoverDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900"><rect width="640" height="900" fill="#dbeafe"/><rect x="52" y="52" width="536" height="796" rx="24" fill="#eff6ff"/><text x="320" y="420" text-anchor="middle" fill="#1e3a5f" font-size="34" font-family="Noto Sans TC, sans-serif">封面載入中</text><text x="320" y="468" text-anchor="middle" fill="#4b6b8d" font-size="24" font-family="Noto Sans TC, sans-serif">已改用預設封面</text></svg>')}`;

const googleBookCovers = {

  "ai-publishing-book": ["ai-publishing-book-cover.jpg"],

  "hermes-learning-by-doing": ["hermes-learning-by-doing-cover-1400x2100.png"],

  "codex-python": ["python-codex-exercises-cover-1400x2100.png"],

  "codex-coding": ["codex-coding-exercises-cover-1400x2100.png", "codex-learning-by-doing-cover-1400x2100.png"],

  "antigravity-coding": ["antigravity-coding-exercises-cover-1400x2100.png"],

  "classic-english-writing": ["happyebook2_assets_images_classic-english-writing-cover.png"],

  "codex-javascript-18h": ["codex-javascript-18hr-course-cover-1400x2100.png"],

  "ai-python-automation": ["ai-python-automation_epub_cover1.png", "ai-python-automation_epub_OEBPS_Images_cover.svg"],

  "ebook-wsl2-online": [],

  "python-for-beginners-book": [

    "Python-for-Beginners-Book_output_google-books_cover.png",

    "Python-for-Beginners-Book_assets_images_cover.png",

    "Python-for-Beginners-Book_docs_assets_images_cover.png",

    "Python-for-Beginners-Book_meta_cover.png"

  ],

  "linux-beginner-2026": ["happyebook2_assets_images_linux-beginner-cover.png", "ebook2026linux_social-cover.svg"],

  "speak-clearly-book": [],

  "sql2026": ["SQL2026_cover1.png", "SQL2026_build_epub_cover1.png"],

  "2026-cloud-security": ["2026-Cloud-Security_docs_assets_images_cover-2026-cloud-security.svg"],

  "word-vba-examples": ["happyebook2_assets_images_word-vba-examples-cover.png"],
  "ipas-ai-high-score-2026-03-exam": ["ipas-ai-basic-question-bank-2026-500-cover.jpg"],
  "windows-aicoding": ["Windows-AICoding_google ebook cover.png"]

};

const getCoverSources = (cover, bookId) => {

  const primary = String(cover || "").trim();

  if (!primary) return [];

  const candidates = [];

  

  if (bookId && googleBookCovers[bookId]) {

    const pathPrefix = window.location.pathname.includes("/src/") ? "../" : "";

    googleBookCovers[bookId].forEach(filename => {

      candidates.push(`${pathPrefix}assets/images/google-book-cover-images/${filename}`);

    });

  }

  

  candidates.push(primary);

  if (primary.startsWith("../")) candidates.push(primary.slice(3));
  if (primary.startsWith("assets/")) candidates.push(`../${primary}`);

  return [...new Set(candidates)];

};

const isGoogleBookCover = (cover) => String(cover || "").includes("books.google.com.tw/books/publisher/content");

let coverObserver;

let coverLoadSuccessCount = 0;

let coverLoadFailureCount = 0;

let disableCoverRequests = false;

const scriptBase = new URL(".", document.currentScript?.src || window.location.href);

const booksDataVersion = "20260527-11";

const siteConfig = {

  contactEmail: "t945935@gmail.com",

  googleFormUrl: "https://forms.gle/prhWVZwyqho8atpa6",

  googleResponsesUrl: "https://docs.google.com/spreadsheets/d/REPLACE_WITH_YOUR_RESPONSE_SHEET/edit"

};

const isPublished = (book) => book.published !== false;

const getBookDetailUrl = (book) => {

  const id = encodeURIComponent(book.id);

  return window.location.pathname.includes("/src/") ? `../books/${id}.html` : `books/${id}.html`;

};

const isGoogleBooksUrl = (value) => {

  const url = String(value || "");

  return url.includes("play.google.com/store/books") || url.includes("books.google.com");

};

const formatNumber = (value) => new Intl.NumberFormat("zh-TW").format(Number(value || 0));

const isWebsiteBook = (book) => book.type === "web" || String(book.format || "").includes("網站");

const isPreviewBook = (book) => book.priceLabel?.includes("試閱") || isGoogleBooksUrl(book.readUrl);

const isPaidBook = (book) => book.type === "paid" || !!book.buyUrl;

const isFreeAccessBook = (book) => book.type === "free" || book.priceLabel?.includes("免費") || (!!book.downloadUrl && !book.buyUrl);

const getEffectiveType = (book) => {

  if (isPaidBook(book)) return "paid";

  if (isGoogleBooksUrl(book.readUrl)) return "web";

  if (isFreeAccessBook(book)) return "free";

  return book.type || "web";

};

const isFreeWebBook = (book) => getEffectiveType(book) === "free" && !!book.readUrl;

const sortBooksForDisplay = (books) => books

  .slice()

  .reverse()
  .sort((left, right) => {
    const leftLaunchRank = Number(left.launchRank || 0);
    const rightLaunchRank = Number(right.launchRank || 0);
    if (leftLaunchRank || rightLaunchRank) {
      if (!leftLaunchRank) return 1;
      if (!rightLaunchRank) return -1;
      return leftLaunchRank - rightLaunchRank;
    }
    return Number(isFreeWebBook(right)) - Number(isFreeWebBook(left));
  });
const loadBooks = async () => {

  try {

    const booksUrl = new URL("books.json", scriptBase);

    booksUrl.searchParams.set("v", booksDataVersion);

    const response = await fetch(booksUrl, { cache: "no-store" });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return sortBooksForDisplay(await response.json());

  } catch (error) {

    console.warn("books.json 載入失敗，暫不渲染書籍資料：", error);

    return sortBooksForDisplay(sampleBooks);

  }

};

const isFreeBook = (book) => getEffectiveType(book) === "free";

const hasPreview = isPreviewBook;

const hasExternalUrl = (value) => /^https?:\/\//.test(String(value || "").trim());

const matchesTypeFilter = (book, filter) => {

  if (filter === "all") return true;

  if (filter === "free") return isFreeAccessBook(book);

  if (filter === "preview") return isPreviewBook(book);

  if (filter === "paid") return isPaidBook(book);

  if (filter === "web") return isWebsiteBook(book);

  return getEffectiveType(book) === filter;

};

const routeFilters = {
  ai: ["AI 學習", "AI 工具應用", "AI Agent", "Prompt Engineering", "Vibe Coding", "Hermes"],
  ipas: ["iPAS AI", "考試準備"],
  "python-codex": ["Python", "Codex", "程式設計", "Vibe Coding"]
};

const resourcePromos = [
  {
    id: "ai-roadmap",
    title: "免費下載 AI 學習新手路線圖",
    copy: "整理從 AI 基礎、Prompt、Codex、AI Agent 到 AI 出版的學習順序。",
    url: "free-resources.html#ai-roadmap",
    bookIds: ["ai-publishing-book", "smart-ai-evolution", "hermes-learning-by-doing", "hermes-agent-guide", "codex-coding", "antigravity-coding"]
  },
  {
    id: "ipas-review",
    title: "考前使用 iPAS AI 7 日複習表",
    copy: "把考綱、題庫、錯題與模擬考拆成一週可執行的複習任務。",
    url: "ipas-ai-7-day-review.html",
    bookIds: ["ipas-ai-應用規劃師初級題庫完全攻略", "ipas-ai-high-score-2026-03-exam", "ipas-ai-high-score-play-book", "ipas-mid-ai-guide", "ipas-ai-application-planner-basic-exam-guide", "happy-ipas-site", "ipas-ai-planner-play-book"]
  },
  {
    id: "codex-prompts",
    title: "免費下載 Codex / Python 學程式 Prompt 範本",
    copy: "提供初學者可套用的 Prompt，練習請 Codex 解釋程式、修正錯誤與整理筆記。",
    url: "free-resources.html#codex-prompts",
    bookIds: ["codex-python", "codex-javascript-18h", "html-css-18h-codex-ai", "python-for-beginners-book", "codex-coding", "ai-python-automation", "windows-aicoding", "vibe-coding-html-css-js"]
  }
];

const getResourcePromoForBook = (bookId) => resourcePromos.find((promo) => promo.bookIds.includes(bookId));

const addResourcePromo = (bookId, target = document) => {
  const promo = getResourcePromoForBook(bookId);
  const panel = target.querySelector?.(".book-content-panel") || document.querySelector(".book-content-panel");
  if (!promo || !panel || panel.querySelector("[data-resource-promo]")) return;
  const prefix = window.location.pathname.includes("/books/") ? "../" : "";
  const promoUrl = promo.url || "free-resources.html#" + promo.id;
  const promoElement = document.createElement("aside");
  promoElement.className = "resource-promo";
  promoElement.dataset.resourcePromo = promo.id;
  promoElement.innerHTML = '<h2>' + promo.title + '</h2><p>' + promo.copy + '</p><a class="button secondary compact" href="' + prefix + promoUrl + '">查看免費資源</a>';
  const ctaRow = panel.querySelector(".cta-row");
  if (ctaRow) {
    ctaRow.insertAdjacentElement("afterend", promoElement);
    return;
  }
  panel.appendChild(promoElement);
};

const matchesRouteFilter = (book, route) => {

  if (!route) return true;

  const routeCategories = routeFilters[route];

  if (!routeCategories) return true;

  const categories = getCategories(book);

  return routeCategories.some((category) => categories.includes(category));

};

const createTags = (book) => [

  getEffectiveType(book) === "free" ? "" : `<span class="tag ${getEffectiveType(book)}">${typeLabel[getEffectiveType(book)] || getEffectiveType(book)}</span>`,

  isFreeBook(book) ? `<span class="tag free">分享閱讀</span>` : "",

  hasPreview(book) ? `<span class="tag preview">提供試閱版</span>` : "",

  `<span class="tag category">${getCategories(book).join(' / ')}</span>`

].filter(Boolean).join("");

const primaryAction = (book) => {

  const detailUrl = getBookDetailUrl(book);

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

  const candidates = JSON.parse(image.dataset.coverSources || "[]");

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

  const readHref = book.readUrl || getBookDetailUrl(book);

  const readAttrs = hasExternalUrl(readHref) ? ` target="_blank" rel="noopener noreferrer"` : "";

  const coverSources = getCoverSources(book.cover, book.id);

  const coverSourcesJson = JSON.stringify(coverSources);

  const coverClass = isGoogleBookCover(book.cover) ? " google-book-cover" : "";

  return `<article class="book-card"><div class="book-card-media"><a href="${readHref}"${readAttrs} class="book-cover-link" aria-label="${book.title} 前往閱讀"><img class="${coverClass.trim()}" data-cover-image src="${fallbackCoverDataUrl}" data-cover-sources='${coverSourcesJson}' data-cover-alt="${book.title} 書封" alt="${book.title} 書封（載入中）" loading="lazy" decoding="async"></a></div><div class="book-card-body"><div class="book-card-content"><h3>${book.title}</h3><p class="book-subtitle">${book.subtitle || ""}</p><p class="book-meta">${book.author} ・ ${book.format}</p><div class="tag-row">${createTags(book)}</div><p class="book-description">${book.description}</p></div><div class="card-actions">${primaryAction(book)}<a class="card-link" href="${getBookDetailUrl(book)}">更多資訊</a></div></div></article>`;

};

const renderList = (selector, books) => { const target = document.querySelector(selector); if (!target) return; target.innerHTML = books.map(createBookCard).join(""); hydrateCoverImages(target); };

const setText = (selector, value) => { const target = document.querySelector(selector); if (target) target.textContent = value; };

const populateStats = async (books) => {

  const categories = uniqueCategories(books);

  setText("[data-stat-total]", formatNumber(books.length));

  setText("[data-stat-categories]", formatNumber(categories.length));

  setText("[data-stat-web]", formatNumber(books.filter(isWebsiteBook).length));

  return categories;

};

const getCategories = (book) => Array.isArray(book.category) ? book.category : [book.category];

const uniqueCategories = (books) => [...new Set(books.flatMap(getCategories))];

const normalizeSearchValue = (value) => String(value || "").trim().toLowerCase();

const matchesSearchQuery = (book, query) => {

  if (!query) return true;

  const searchableText = [

    book.title,

    book.subtitle,

    book.author,

    book.description,

    book.format,

    book.priceLabel,

    ...getCategories(book)

  ].filter(Boolean).join(" ").toLowerCase();

  return searchableText.includes(query);

};

const isPlaceholderUrl = (value) => !value || value.includes("REPLACE_WITH_YOUR");

const resourceLeadStorageKey = "happyebookResourceLeads";

const getStoredResourceLeads = () => {
  try {
    const leads = JSON.parse(window.localStorage.getItem(resourceLeadStorageKey) || "[]");
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
};

const initResourceForms = () => {
  document.querySelectorAll("[data-resource-form]").forEach((form) => {
    if (form.dataset.resourceFormBound) return;
    form.dataset.resourceFormBound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-resource-form-status]");
      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const website = String(formData.get("website") || "").trim();
      if (!name || !email) {
        if (status) {
          status.textContent = "請填寫 Name 與 email。";
          status.classList.add("is-error");
        }
        return;
      }
      const lead = {
        name,
        email,
        resource: form.dataset.resourceName || "網站資源",
        page: window.location.pathname,
        createdAt: new Date().toISOString()
      };
      if (status) {
        status.textContent = "正在送出資料。";
        status.classList.remove("is-error");
      }
      if (submitButton) submitButton.disabled = true;
      try {
        const endpoint = form.dataset.resourceEndpoint;
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...lead, website })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.ok === false) {
            throw new Error(data.error || "名單保存失敗，請稍後再試。");
          }
        } else {
          const leads = getStoredResourceLeads();
          leads.push(lead);
          window.localStorage.setItem(resourceLeadStorageKey, JSON.stringify(leads));
        }
      } catch (error) {
        if (submitButton) submitButton.disabled = false;
        if (status) {
          status.textContent = error.message || "名單保存失敗，請稍後再試。";
          status.classList.add("is-error");
        }
        return;
      }
      if (status) {
        status.textContent = "已保存，正在前往複習表。";
        status.classList.remove("is-error");
      }
      window.setTimeout(() => {
        window.location.assign(form.dataset.resourceRedirect || "ipas-ai-7-day-review.html");
      }, 300);
    });
  });
};

const bindExternalLinks = () => {

  document.querySelectorAll("[data-google-form-link]").forEach((link) => {

    const nextUrl = link.dataset.googleFormNext;
    if (nextUrl && !link.dataset.googleFormNextBound) {
      link.href = siteConfig.googleFormUrl;
      link.removeAttribute("target");
      link.rel = "noreferrer";
      link.dataset.googleFormNextBound = "true";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(siteConfig.googleFormUrl, "_blank", "noopener,noreferrer");
        window.location.assign(nextUrl);
      });
      return;
    }

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

    if (message) message.textContent = `即將開啟你的信箱，收件人是 ${siteConfig.contactEmail}。`;

    window.location.href = mailtoUrl;

  });

};

const createMiniBookCard = (book, isPrimary = false) => {

  const href = book.readUrl || getBookDetailUrl(book);

  const attrs = hasExternalUrl(href) ? ` target="_blank" rel="noopener noreferrer"` : "";

  const effectiveType = getEffectiveType(book);

  const tagClass = effectiveType === "free" ? "free" : effectiveType === "paid" ? "paid" : "web";

  const coverSources = getCoverSources(book.cover, book.id);

  const coverSourcesJson = JSON.stringify(coverSources);

  return `<a class="hero-mini-book${isPrimary ? " hero-mini-book-primary" : ""}" href="${href}"${attrs}><span class="tag ${tagClass}">${typeLabel[effectiveType] || effectiveType}</span><div class="hero-mini-cover"><img data-cover-image src="${fallbackCoverDataUrl}" data-cover-sources='${coverSourcesJson}' data-cover-alt="${book.title} 書封" alt="${book.title} 書封（載入中）" loading="lazy" decoding="async"></div><h3>${book.title}</h3><p>${book.subtitle || ""}</p></a>`;

};

const initHome = async () => {

  const books = (await loadBooks()).filter(isPublished);

  if (books.length) await populateStats(books);

  const shelf = document.querySelector("[data-home-shelf]");

  if (shelf && books.length) {

    const shelfBooks = books.filter((b) => b.featured).slice(0, 3);

    shelf.innerHTML = shelfBooks.map((book, i) => createMiniBookCard(book, i === 0)).join("");

    hydrateCoverImages(shelf);

  }

  const featuredGrid = document.querySelector("[data-featured-grid]");

  if (featuredGrid && books.length) {

    const featuredBooks = books.filter((b) => b.featured).slice(0, 8);

    featuredGrid.innerHTML = featuredBooks.map(createBookCard).join("");

    hydrateCoverImages(featuredGrid);

  }

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

  const params = new URLSearchParams(window.location.search);

  const searchInput = document.querySelector("[data-search-input]");

  const typeFilters = [...document.querySelectorAll("[data-type-filter]")];

  const categoryFilters = [...document.querySelectorAll("[data-category-filter]")];

  let activeType = params.get("type") || "all";

  let activeCategory = params.get("category") || "all";

  let activeSearch = params.get("q") || "";

  let activeRoute = params.get("route") || "";

  if (searchInput && activeSearch) searchInput.value = activeSearch;

  typeFilters.forEach((item) => item.classList.toggle("is-active", item.dataset.typeFilter === activeType));

  categoryFilters.forEach((item) => item.classList.toggle("is-active", item.dataset.categoryFilter === activeCategory));

  const render = () => {

    const query = normalizeSearchValue(activeSearch);

    const filtered = books.filter((book) =>

      matchesRouteFilter(book, activeRoute) &&

      matchesTypeFilter(book, activeType) &&

      (activeCategory === "all" || getCategories(book).includes(activeCategory)) &&

      matchesSearchQuery(book, query)

    );

    const noResultsTitle = query ? `沒有符合「${activeSearch}」的作品` : "目前沒有符合條件的作品";

    const noResultsCopy = query ? "請調整關鍵字或篩選條件後再試一次。" : "你可以切換篩選條件，或之後再回來看看。";

    grid.innerHTML = filtered.length ? filtered.map(createBookCard).join("") : `<div class="empty-state"><h3>${noResultsTitle}</h3><p>${noResultsCopy}</p></div>`;

    hydrateCoverImages(grid);

  };

  searchInput?.addEventListener("input", (event) => {

    activeSearch = String(event.target.value || "");

    activeRoute = "";

    render();

  });

  typeFilters.forEach((button) => button.addEventListener("click", () => {

    activeType = button.dataset.typeFilter;

    activeRoute = "";

    typeFilters.forEach((item) => item.classList.toggle("is-active", item === button));

    render();

  }));

  categoryFilters.forEach((button) => button.addEventListener("click", () => {

    activeCategory = button.dataset.categoryFilter;

    activeRoute = "";

    categoryFilters.forEach((item) => item.classList.toggle("is-active", item === button));

    render();

  }));

  render();

};

const initBookPage = async () => { const books = (await loadBooks()).filter(isPublished); const id = new URLSearchParams(window.location.search).get("id"); const book = books.find((item) => item.id === id) || books[0]; const target = document.querySelector("[data-book-detail]"); const heroCopy = document.querySelector("[data-book-hero-copy]"); if (!target || !book) return; document.title = `${book.title} | Happy eBook`; const bookUrl = `https://happyebook.com/books/${encodeURIComponent(book.id)}.html`; const bookDesc = book.description || book.subtitle || "查看作品詳細資料、格式、作者與閱讀或購買方式。"; const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute("content", val); }; setMeta('meta[property="og:title"]', `${book.title} | Happy eBook`); setMeta('meta[property="og:description"]', bookDesc); setMeta('meta[property="og:url"]', bookUrl); setMeta('meta[name="twitter:title"]', `${book.title} | Happy eBook`); setMeta('meta[name="twitter:description"]', bookDesc); setMeta('meta[name="description"]', bookDesc); let canon = document.querySelector('link[rel="canonical"]'); if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); } canon.href = bookUrl; const breadcrumbJson = document.createElement("script"); breadcrumbJson.type = "application/ld+json"; breadcrumbJson.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Happy eBook", "item": "https://happyebook.com/" }, { "@type": "ListItem", "position": 2, "name": "書籍列表", "item": "https://happyebook.com/books.html" }, { "@type": "ListItem", "position": 3, "name": book.title, "item": bookUrl } ] }); document.head.appendChild(breadcrumbJson); const ldJson = document.createElement("script"); ldJson.type = "application/ld+json"; const categories = getCategories(book); const bookSchema = { "@context": "https://schema.org", "@type": "Book", "name": book.title, "description": book.description, "author": { "@type": "Person", "name": book.author }, "inLanguage": "zh-TW", "genre": categories[0] || "", "url": bookUrl, "isPartOf": { "@type": "WebSite", "name": "Happy eBook", "url": "https://happyebook.com/" } }; if (book.buyUrl) bookSchema["offers"] = { "@type": "Offer", "url": book.buyUrl, "priceCurrency": "TWD" }; ldJson.textContent = JSON.stringify(bookSchema); document.head.appendChild(ldJson); if (heroCopy) heroCopy.textContent = book.heroCopy || "這裡會顯示書封、書名、副標、作者、分類、標籤、簡介、格式與操作按鈕。"; const coverSources = getCoverSources(book.cover, book.id); const coverSourcesJson = JSON.stringify(coverSources); target.innerHTML = `<div class="book-cover-panel"><div class="book-cover-stage"><img data-cover-image src="${fallbackCoverDataUrl}" data-cover-sources='${coverSourcesJson}' data-cover-alt="${book.title} 書封" alt="${book.title} 書封（載入中）"></div></div><div class="book-content-panel"><div class="tag-row">${createTags(book)}</div><h1>${book.title}</h1><p class="book-summary">${book.subtitle}</p><p>${book.description}</p><div class="meta-list"><div class="meta-item"><span>作者</span><strong>${book.author}</strong></div><div class="meta-item"><span>分類</span><strong>${getCategories(book).join(' / ')}</strong></div><div class="meta-item"><span>格式</span><strong>${book.format}</strong></div><div class="meta-item"><span>取得方式</span><strong>${book.priceLabel}</strong></div></div><div class="cta-row">${primaryAction(book)}<a class="button secondary" href="books.html">返回列表</a></div></div>`; hydrateCoverImages(target); addResourcePromo(book.id, target); };

const initStaticBookResourcePromo = () => {

  const match = window.location.pathname.match(/\/books\/([^/]+)\.html$/);

  if (!match) return;

  addResourcePromo(decodeURIComponent(match[1]));

};

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

  initResourceForms();

  const page = document.body.dataset.page;

  if (page === "home") initHome();

  if (page === "books") initBooksPage();

  if (page === "book") initBookPage();

  if (page === "static-book") initStaticBookResourcePromo();

  if (page === "submit") initSubmitPage();

  if (page === "contact") initContactPage();

  if (page === "admin") initAdminPageLinks();

};

boot();
