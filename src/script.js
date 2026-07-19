const sampleBooks = [];

const typeLabel = { free: "免費閱讀", paid: "付費購買", web: "網站教材" };

const fallbackCoverDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900"><rect width="640" height="900" fill="#dbeafe"/><rect x="52" y="52" width="536" height="796" rx="24" fill="#eff6ff"/><text x="320" y="420" text-anchor="middle" fill="#1e3a5f" font-size="34" font-family="Noto Sans TC, sans-serif">封面載入中</text><text x="320" y="468" text-anchor="middle" fill="#4b6b8d" font-size="24" font-family="Noto Sans TC, sans-serif">已改用預設封面</text></svg>')}`;

const googleBookCovers = {

  "ai-publishing-book": ["ai-publishing-book-cover.jpg"],

  "codex-mini-projects-book": ["codex-mini-projects-book-imagegen-cover.png"],

  "codex-mini-projects-book-2": ["codex-mini-projects-book-2-screenshot-cover.jpg", "codex-mini-projects-book-2-cover.jpg"],

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

const booksDataVersion = "20260531-3";

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
    url: "resources/free-resources.html#ai-roadmap",
    bookIds: ["ai-publishing-book", "smart-ai-evolution", "hermes-learning-by-doing", "hermes-agent-guide", "harness-engineering", "codex-coding", "antigravity-coding"]
  },
  {
    id: "ipas-review",
    title: "考前使用 iPAS AI 7 日複習表",
    copy: "把考綱、題庫、錯題與模擬考拆成一週可執行的複習任務。",
    url: "resources/ipas-ai-7-day-review.html",
    bookIds: ["ipas-ai-應用規劃師初級題庫完全攻略", "ipas-ai-high-score-2026-03-exam", "ipas-ai-high-score-play-book", "ipas-mid-ai-guide", "ipas-ai-mid-learning-handbook-2026-06", "ipas-ai-application-planner-basic-exam-guide", "happy-ipas-site", "ipas-ai-planner-play-book"]
  },
  {
    id: "codex-prompts",
    title: "免費下載 Codex / Python 學程式 Prompt 範本",
    copy: "提供初學者可套用的 Prompt，練習請 Codex 解釋程式、修正錯誤與整理筆記。",
    url: "resources/free-resources.html#codex-prompts",
    bookIds: ["codex-mini-projects-book", "codex-mini-projects-book-2", "codex-python", "codex-javascript-18h", "html-css-18h-codex-ai", "python-for-beginners-book", "codex-coding", "ai-python-automation", "windows-aicoding", "vibe-coding-html-css-js"]
  }
];

const getResourcePromoForBook = (bookId) => resourcePromos.find((promo) => promo.bookIds.includes(bookId));

const addResourcePromo = (bookId, target = document) => {
  const promo = getResourcePromoForBook(bookId);
  const panel = target.querySelector?.(".book-content-panel") || document.querySelector(".book-content-panel");
  if (!promo || !panel || panel.querySelector("[data-resource-promo]")) return;
  const prefix = window.location.pathname.includes("/books/") ? "../" : "";
  const promoUrl = promo.url || "resources/free-resources.html#" + promo.id;
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
        window.location.assign(form.dataset.resourceRedirect || "resources/ipas-ai-7-day-review.html");
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

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatNewsDate = (value) => {
  if (!value) return "尚待更新";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long", day: "numeric" }).format(date);
};

let newsDataPromise;
const loadNewsData = () => {
  if (!newsDataPromise) {
    const newsUrl = new URL("news.json", scriptBase);
    newsDataPromise = fetch(newsUrl, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
  }
  return newsDataPromise;
};

const initNewsTv = async () => {
  const tv = document.querySelector("[data-news-tv]");
  if (!tv) return;
  try {
    if (sessionStorage.getItem("happyebook-news-tv-closed") === "1") return;
  } catch (_error) {
    // The widget still works when sessionStorage is unavailable.
  }

  const screen = tv.querySelector("[data-news-tv-screen]");
  const groupLabel = tv.querySelector("[data-news-tv-group]");
  const position = tv.querySelector("[data-news-tv-position]");
  const previous = tv.querySelector("[data-news-tv-prev]");
  const next = tv.querySelector("[data-news-tv-next]");
  const toggle = tv.querySelector("[data-news-tv-toggle]");
  const close = tv.querySelector("[data-news-tv-close]");
  let entries = [];
  let index = 0;
  let timer = null;
  let isPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopTimer = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const startTimer = () => {
    stopTimer();
    if (isPaused || document.hidden || entries.length < 2) return;
    timer = window.setInterval(() => {
      index = (index + 1) % entries.length;
      render();
    }, 8000);
  };
  const render = () => {
    const entry = entries[index];
    if (!entry) return;
    const { group, item } = entry;
    const url = /^https?:\/\//.test(String(item.url || "")) ? item.url : "";
    groupLabel.textContent = group.id === "ai" ? "AI 重大消息" : group.label;
    position.textContent = `${index + 1} / ${entries.length}`;
    const title = url ? `<a class="news-tv-title-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>` : escapeHtml(item.title);
    screen.innerHTML = `<div class="news-tv-meta">${escapeHtml(item.source || group.label)} · ${formatNewsDate(item.date || group.updatedAt)}</div>
      <h2>${title}</h2>
      <p>${escapeHtml(item.summary || "")}</p>
      ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">查看來源 →</a>` : ""}`;
    startTimer();
  };

  try {
    const data = await loadNewsData();
    entries = (data.groups || []).flatMap((group) => (group.items || []).map((item) => ({ group, item })));
    if (!entries.length) return;
  } catch (error) {
    console.warn("右上角 News 載入失敗：", error);
    return;
  }

  previous.addEventListener("click", () => {
    index = (index - 1 + entries.length) % entries.length;
    render();
  });
  next.addEventListener("click", () => {
    index = (index + 1) % entries.length;
    render();
  });
  toggle.addEventListener("click", () => {
    isPaused = !isPaused;
    toggle.textContent = isPaused ? "播放" : "暫停";
    toggle.setAttribute("aria-label", isPaused ? "開始輪播" : "暫停輪播");
    toggle.setAttribute("aria-pressed", String(isPaused));
    startTimer();
  });
  close.addEventListener("click", () => {
    stopTimer();
    tv.hidden = true;
    try {
      sessionStorage.setItem("happyebook-news-tv-closed", "1");
    } catch (_error) {
      // Closing the widget must not depend on storage permission.
    }
  });
  tv.addEventListener("mouseenter", stopTimer);
  tv.addEventListener("mouseleave", startTimer);
  tv.addEventListener("focusin", stopTimer);
  tv.addEventListener("focusout", () => window.setTimeout(startTimer, 0));
  document.addEventListener("visibilitychange", startTimer);

  if (isPaused) {
    toggle.textContent = "播放";
    toggle.setAttribute("aria-label", "開始輪播");
    toggle.setAttribute("aria-pressed", "true");
  }
  tv.hidden = false;
  render();
};

const initNewsWindow = async () => {
  const root = document.querySelector("[data-news-window]");
  if (!root) return;

  const tabs = root.querySelector("[data-news-tabs]");
  const slide = root.querySelector("[data-news-slide]");
  const dots = root.querySelector("[data-news-dots]");
  const updated = root.querySelector("[data-news-updated]");
  const note = root.querySelector("[data-news-note]");
  const previous = root.querySelector("[data-news-prev]");
  const next = root.querySelector("[data-news-next]");
  const toggle = root.querySelector("[data-news-toggle]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let groups = [];
  let groupIndex = 0;
  let itemIndex = 0;
  let timer = null;
  let isPaused = prefersReducedMotion;

  const activeGroup = () => groups[groupIndex] || { items: [], note: "" };
  const stopTimer = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const startTimer = () => {
    stopTimer();
    if (isPaused || document.hidden || activeGroup().items.length < 2) return;
    timer = window.setInterval(() => {
      itemIndex = (itemIndex + 1) % activeGroup().items.length;
      renderSlide();
    }, 7000);
  };
  const renderTabs = () => {
    tabs.innerHTML = groups.map((group, index) => `<button class="news-tab" type="button" role="tab" id="news-tab-${escapeHtml(group.id)}" aria-controls="news-panel" aria-selected="${index === groupIndex}" tabindex="${index === groupIndex ? "0" : "-1"}" data-news-group="${index}">${escapeHtml(group.label)}</button>`).join("");
  };
  const renderSlide = () => {
    const group = activeGroup();
    const items = Array.isArray(group.items) ? group.items : [];
    updated.textContent = `${group.period ? `${group.period} · ` : ""}資料更新：${formatNewsDate(group.updatedAt)}`;
    note.textContent = group.note || "";
    previous.disabled = items.length < 2;
    next.disabled = items.length < 2;
    if (!items.length) {
      slide.innerHTML = '<div class="news-empty" id="news-panel" role="tabpanel">目前尚無經過核對的榜單資料，完成更新後會在這裡顯示。</div>';
      dots.innerHTML = "";
      startTimer();
      return;
    }
    itemIndex = Math.min(itemIndex, items.length - 1);
    const item = items[itemIndex];
    const url = /^https?:\/\//.test(String(item.url || "")) ? item.url : "";
    const sequenceLabel = group.id === "ai" ? `第 ${itemIndex + 1} 則` : `第 ${itemIndex + 1} 名`;
    slide.innerHTML = `<article class="news-item" id="news-panel" role="tabpanel" aria-labelledby="news-tab-${escapeHtml(group.id)}">
      <span class="news-rank" aria-label="${sequenceLabel}">${String(item.rank || itemIndex + 1).padStart(2, "0")}</span>
      <div class="news-item-copy">
        <div class="news-item-meta"><span>${escapeHtml(item.source || group.label)}</span><time datetime="${escapeHtml(item.date || group.updatedAt || "")}">${formatNewsDate(item.date || group.updatedAt)}</time></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || "")}</p>
        ${url ? `<a class="news-item-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">查看來源</a>` : ""}
      </div>
    </article>`;
    dots.innerHTML = items.map((_, index) => `<button class="news-dot" type="button" aria-label="顯示第 ${index + 1} 則" aria-current="${index === itemIndex}" data-news-item="${index}"></button>`).join("");
    startTimer();
  };
  const selectGroup = (index, moveFocus = false) => {
    groupIndex = (index + groups.length) % groups.length;
    itemIndex = 0;
    renderTabs();
    renderSlide();
    if (moveFocus) tabs.querySelector(`[data-news-group="${groupIndex}"]`)?.focus();
  };

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-news-group]");
    if (button) selectGroup(Number(button.dataset.newsGroup));
  });
  tabs.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === "Home" ? 0 : event.key === "End" ? groups.length - 1 : groupIndex + (event.key === "ArrowRight" ? 1 : -1);
    selectGroup(target, true);
  });
  dots.addEventListener("click", (event) => {
    const button = event.target.closest("[data-news-item]");
    if (!button) return;
    itemIndex = Number(button.dataset.newsItem);
    renderSlide();
  });
  previous.addEventListener("click", () => {
    itemIndex = (itemIndex - 1 + activeGroup().items.length) % activeGroup().items.length;
    renderSlide();
  });
  next.addEventListener("click", () => {
    itemIndex = (itemIndex + 1) % activeGroup().items.length;
    renderSlide();
  });
  toggle.addEventListener("click", () => {
    isPaused = !isPaused;
    toggle.textContent = isPaused ? "播放" : "暫停";
    toggle.setAttribute("aria-label", isPaused ? "開始自動輪播" : "暫停自動輪播");
    toggle.setAttribute("aria-pressed", String(isPaused));
    startTimer();
  });
  root.addEventListener("mouseenter", stopTimer);
  root.addEventListener("mouseleave", startTimer);
  root.addEventListener("focusin", stopTimer);
  root.addEventListener("focusout", () => window.setTimeout(startTimer, 0));
  document.addEventListener("visibilitychange", startTimer);

  try {
    const data = await loadNewsData();
    groups = Array.isArray(data.groups) ? data.groups : [];
    if (!groups.length) throw new Error("找不到消息分類");
    if (isPaused) {
      toggle.textContent = "播放";
      toggle.setAttribute("aria-label", "開始自動輪播");
      toggle.setAttribute("aria-pressed", "true");
    }
    selectGroup(0);
  } catch (error) {
    console.warn("news.json 載入失敗：", error);
    updated.textContent = "最新消息暫時無法載入";
    slide.innerHTML = '<div class="news-empty" role="status">資料連線暫時異常，請稍後再試。</div>';
    previous.disabled = true;
    next.disabled = true;
    toggle.disabled = true;
  }
};

const initHome = async () => {

  initNewsTv();

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

const initResourceEmailForms = () => {
  document.querySelectorAll("[data-resource-form][data-resource-mailto]").forEach((form) => {
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

      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) {
          status.textContent = "請填寫 Name 與正確的 email。";
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

      const leads = getStoredResourceLeads();
      leads.push(lead);
      window.localStorage.setItem(resourceLeadStorageKey, JSON.stringify(leads));

      if (submitButton) submitButton.disabled = true;
      if (status) {
        status.textContent = "正在送出申請信...";
        status.classList.remove("is-error");
      }

      const mailTo = form.dataset.resourceMailto || siteConfig.contactEmail;
      const subject = form.dataset.resourceMailSubject || "索取7日考前復習，email 留存";
      const body = [
        "您好，我想索取7日考前復習資料。",
        "",
        `name: ${name}`,
        `email: ${email}`,
        "",
        `姓名：${name}`,
        `電子郵件：${email}`,
        `申請資源：${lead.resource}`,
        `來源頁面：${window.location.href}`,
        `送出時間：${lead.createdAt}`
      ].join("\n");

      let openMailClient = true;
      const submitEndpoint = form.dataset.resourceSubmitEndpoint;
      const endpoint = form.dataset.resourceEndpoint;
      if (submitEndpoint && !website) {
        try {
          const response = await fetch(submitEndpoint, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              _subject: subject,
              _template: "table",
              _replyto: email,
              name,
              email,
              "姓名": name,
              "電子郵件": email,
              "申請資源": lead.resource,
              "來源頁面": window.location.href,
              "送出時間": lead.createdAt,
              "訊息內容": body
            })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || String(data.success).toLowerCase() === "false") {
            throw new Error(data.message || "Email 寄送服務回應失敗。");
          }
          openMailClient = false;
          if (status) status.textContent = "申請信已送出，email 已留存。";
        } catch (error) {
          console.warn("Resource email service failed.", error);
          if (status) status.textContent = "自動寄信未完成，正在開啟信箱草稿。";
        }
      } else if (endpoint && !website) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...lead, website })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.ok === false) {
            throw new Error(data.error || "Email 留存 API 回應失敗。");
          }
        } catch (error) {
          console.warn("Resource lead API failed.", error);
          if (status) status.textContent = "已先保留在此瀏覽器，並開啟信箱讓你寄出申請信。";
        }
      }

      if (openMailClient) {
        window.location.href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      window.setTimeout(() => {
        window.location.assign(form.dataset.resourceRedirect || "resources/ipas-ai-7-day-review.html");
      }, 1800);
    });
  });
};

const initHermesAgentPage = () => {
  const form = document.querySelector("[data-hermes-agent-form]");
  const output = document.querySelector("[data-hermes-output]");
  const copyButton = document.querySelector("[data-hermes-copy]");
  if (!form || !output) return;

  const roleLabels = {
    "learning-coach": "學習教練",
    "coding-agent": "程式協作代理",
    "publishing-agent": "電子書出版助手",
    "exam-coach": "考照複習教練"
  };

  const roleFocus = {
    "learning-coach": "用白話拆解觀念，安排循序練習，讓初學者知道下一步要做什麼。",
    "coding-agent": "先理解需求與檔案範圍，再規劃修改、檢查風險與列出驗證方式。",
    "publishing-agent": "協助整理書籍定位、章節架構、讀者需求、SEO 文案與上架檢查。",
    "exam-coach": "把考點拆成複習順序、題型判斷、錯題檢討與考前檢查。"
  };

  const formatLabels = {
    plan: "任務計畫",
    checklist: "檢查清單",
    prompt: "可複製 Prompt",
    lesson: "教學大綱"
  };

  const scopeGuide = {
    small: "控制在 3 到 5 個步驟，先完成最小可用成果。",
    medium: "分成準備、執行、檢查、修正四個階段。",
    large: "先切成里程碑，每個里程碑都要有可交付成果與回顧點。"
  };

  const guardrailGuide = {
    "ask-first": "遇到需求不明、資料不足或會影響範圍時，先提出 1 到 3 個關鍵問題。",
    "draft-only": "先輸出草稿與建議，不直接做不可逆的修改或承諾。",
    checkpoint: "每完成一個階段，都列出檢查點、風險與下一步。"
  };

  const buildOutput = (data) => {
    const goal = String(data.get("goal") || "").trim();
    const role = String(data.get("role") || "learning-coach");
    const format = String(data.get("format") || "plan");
    const scope = String(data.get("scope") || "small");
    const guardrail = String(data.get("guardrail") || "ask-first");
    const constraints = String(data.get("constraints") || "").trim() || "使用繁體中文，語氣清楚，適合初學者。";

    const roleName = roleLabels[role] || roleLabels["learning-coach"];
    const outputName = formatLabels[format] || formatLabels.plan;

    return [
      `# Hermes Agent 任務設定`,
      ``,
      `## 角色`,
      `你是「${roleName}」。${roleFocus[role]}`,
      ``,
      `## 任務目標`,
      goal,
      ``,
      `## 輸出格式`,
      `請輸出「${outputName}」，內容要能讓使用者直接照著執行。`,
      ``,
      `## 任務範圍`,
      scopeGuide[scope],
      ``,
      `## 限制與偏好`,
      constraints,
      ``,
      `## 安全與檢查規則`,
      guardrailGuide[guardrail],
      `不要誇大能力。遇到不確定的資訊，要明確標示假設。`,
      ``,
      `## 工作流程`,
      `1. 先用 3 句話確認你理解的任務。`,
      `2. 列出目前缺少的資訊。如果資訊足夠，就直接說明「可先開始」。`,
      `3. 把任務拆成可檢查的小步驟。`,
      `4. 對每一步列出輸入、動作、輸出與檢查方法。`,
      `5. 最後整理下一步建議，讓使用者知道要先做哪一件事。`,
      ``,
      `## 請直接開始`,
      `請依照上面的角色、限制與流程，協助我完成這個任務。`
    ].join("\n");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = buildOutput(new FormData(form));
    output.textContent = result;
    output.classList.add("is-ready");
    if (copyButton) copyButton.disabled = false;
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      output.textContent = "先輸入任務目標，再按「產生 Hermes 任務」。";
      output.classList.remove("is-ready");
      if (copyButton) copyButton.disabled = true;
    }, 0);
  });

  copyButton?.addEventListener("click", async () => {
    const text = output.textContent || "";
    if (!text || copyButton.disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "已複製";
      window.setTimeout(() => { copyButton.textContent = "複製"; }, 1400);
    } catch (error) {
      console.warn("Clipboard copy failed.", error);
      copyButton.textContent = "請手動複製";
    }
  });
};

const initEnglishCaiPage = () => {
  const practiceWords = [
    {
      word: "practice",
      meaning: "練習；實作",
      usage: "可作名詞或動詞，表示反覆做一件事，讓自己更熟。",
      example: "Daily practice helps you remember new words."
    },
    {
      word: "explain",
      meaning: "解釋；說明",
      usage: "常用來表示把事情講清楚，後面可以接概念、原因或方法。",
      example: "Can you explain this sentence in simple English?"
    },
    {
      word: "example",
      meaning: "例子；範例",
      usage: "學英文時，example 可以幫你知道單字在句子裡怎麼使用。",
      example: "This book gives one example for each new word."
    },
    {
      word: "useful",
      meaning: "有用的；實用的",
      usage: "用來形容工具、方法或資訊對你有幫助。",
      example: "This is a useful app for English learners."
    },
    {
      word: "review",
      meaning: "複習；回顧",
      usage: "學過新單字後，可以用 review 表示再次看過並加深記憶。",
      example: "I review five words before I go to bed."
    },
    {
      word: "sentence",
      meaning: "句子",
      usage: "sentence 是英文學習的基本單位，可以用來練文法與表達。",
      example: "Please write one sentence with this word."
    },
    {
      word: "meaning",
      meaning: "意思；含義",
      usage: "常用來詢問或說明一個字、句子或文章的意思。",
      example: "What is the meaning of this word?"
    },
    {
      word: "improve",
      meaning: "進步；改善",
      usage: "用來描述能力、成績或狀況變得更好。",
      example: "You can improve your English by reading every day."
    }
  ];

  const wordTitle = document.querySelector("[data-cai-word]");
  const noteTitle = document.querySelector("[data-cai-note-title]");
  const meaning = document.querySelector("[data-cai-meaning]");
  const usage = document.querySelector("[data-cai-usage]");
  const example = document.querySelector("[data-cai-example]");
  const preview = document.querySelector("[data-cai-letter-preview]");
  const input = document.querySelector("[data-cai-input]");
  const feedback = document.querySelector("[data-cai-feedback]");
  const progress = document.querySelector("[data-cai-progress]");
  const correctCount = document.querySelector("[data-cai-correct]");
  const accuracy = document.querySelector("[data-cai-accuracy]");
  const prevButton = document.querySelector("[data-cai-prev]");
  const nextButton = document.querySelector("[data-cai-next]");
  const resetButton = document.querySelector("[data-cai-reset]");

  if (!wordTitle || !preview || !input) return;

  let currentIndex = 0;
  const answered = new Array(practiceWords.length).fill(false);
  const attempts = new Array(practiceWords.length).fill(0);

  const updateStats = () => {
    const correct = answered.filter(Boolean).length;
    const tried = attempts.filter((count) => count > 0).length;
    if (correctCount) correctCount.textContent = String(correct);
    if (accuracy) accuracy.textContent = tried ? `${Math.round((correct / tried) * 100)}%` : "0%";
  };

  const renderLetters = (typedValue = "") => {
    const word = practiceWords[currentIndex].word;
    preview.innerHTML = word.split("").map((letter, index) => {
      const typed = typedValue[index] || "";
      const state = typed ? (typed.toLowerCase() === letter ? " is-correct" : " is-wrong") : "";
      return `<span class="cai-letter${state}">${letter}</span>`;
    }).join("");
  };

  const renderWord = () => {
    const item = practiceWords[currentIndex];
    wordTitle.textContent = item.word;
    if (noteTitle) noteTitle.textContent = item.word;
    if (meaning) meaning.textContent = item.meaning;
    if (usage) usage.textContent = item.usage;
    if (example) example.textContent = item.example;
    if (progress) progress.textContent = `${currentIndex + 1} / ${practiceWords.length}`;
    input.value = "";
    input.maxLength = item.word.length;
    input.placeholder = `請輸入 ${item.word}`;
    renderLetters("");
    if (feedback) {
      feedback.textContent = answered[currentIndex] ? "這題已完成，可以繼續下一題。" : "準備好後，請輸入上方單字。";
      feedback.className = "cai-feedback";
    }
    if (prevButton) prevButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.textContent = currentIndex === practiceWords.length - 1 ? "完成" : "下一題";
    updateStats();
    input.focus();
  };

  const checkInput = () => {
    const word = practiceWords[currentIndex].word;
    const typed = input.value.trim().toLowerCase();
    renderLetters(typed);
    if (!typed) {
      if (feedback) {
        feedback.textContent = "準備好後，請輸入上方單字。";
        feedback.className = "cai-feedback";
      }
      return;
    }

    attempts[currentIndex] += 1;
    if (typed === word) {
      answered[currentIndex] = true;
      if (feedback) {
        feedback.textContent = "正確。請讀一次例句，再進入下一題。";
        feedback.className = "cai-feedback is-correct";
      }
      updateStats();
      return;
    }

    if (feedback) {
      feedback.textContent = "還差一點，請檢查紅色字母。";
      feedback.className = "cai-feedback is-wrong";
    }
    updateStats();
  };

  input.addEventListener("input", checkInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (currentIndex < practiceWords.length - 1) {
        currentIndex += 1;
        renderWord();
      }
    }
  });

  prevButton?.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    renderWord();
  });

  nextButton?.addEventListener("click", () => {
    if (currentIndex < practiceWords.length - 1) {
      currentIndex += 1;
      renderWord();
      return;
    }
    if (feedback) {
      feedback.textContent = "本輪練習完成。可以按「重新開始」再練一次。";
      feedback.className = "cai-feedback is-correct";
    }
  });

  resetButton?.addEventListener("click", () => {
    currentIndex = 0;
    answered.fill(false);
    attempts.fill(0);
    renderWord();
  });

  renderWord();
};

const projectStatusLabels = {
  planning: "規劃中",
  writing: "寫作中",
  reviewing: "校稿中",
  packaging: "製作上架檔",
  submitted: "已送審",
  published: "已出版",
  paused: "暫停"
};

const projectDataVersion = "20260530-1";

const loadBookProjects = async () => {
  const projectsUrl = new URL("book-projects.json", scriptBase);
  projectsUrl.searchParams.set("v", projectDataVersion);
  const response = await fetch(projectsUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

const formatProjectDate = (value) => {
  if (!value) return "未設定";
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
};

const isProjectOverdue = (project) => {
  if (!project.targetDate || ["published", "paused"].includes(project.status)) return false;
  const target = new Date(`${project.targetDate}T23:59:59+08:00`);
  return !Number.isNaN(target.getTime()) && target.getTime() < Date.now();
};

const createProgressSummary = (projects) => {
  const activeCount = projects.filter((project) => !["published", "paused"].includes(project.status)).length;
  const average = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.percent || 0), 0) / projects.length)
    : 0;
  const dueCount = projects.filter(isProjectOverdue).length;
  const publishedCount = projects.filter((project) => project.status === "published").length;

  return [
    ["新書總數", projects.length],
    ["進行中", activeCount],
    ["平均完成度", `${average}%`],
    ["已出版", publishedCount],
    ["逾期提醒", dueCount]
  ].map(([label, value]) => `<article class="progress-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join("");
};

const createProjectCard = (project) => {
  const percent = Math.max(0, Math.min(100, Number(project.percent || 0)));
  const status = project.status || "planning";
  const stages = Array.isArray(project.stages) ? project.stages : [];
  const links = project.links || {};
  const linkEntries = [
    ["書稿", links.manuscript],
    ["Metadata", links.metadata],
    ["狀態文件", links.status],
    ["書籍頁", links.bookPage]
  ].filter(([, href]) => href);

  return `<article class="progress-project-card">
    <div class="progress-project-head">
      <div>
        <h2>${project.title || project.id}</h2>
        <p class="progress-project-meta">${project.category || "未分類"} · 更新：${formatProjectDate(project.updatedAt)} · 期限：${formatProjectDate(project.targetDate)}</p>
      </div>
      <span class="status-badge status-${status}">${projectStatusLabels[status] || status}</span>
    </div>
    <div class="progress-meter" aria-label="${project.title || project.id} 完成度 ${percent}%">
      <div class="progress-meter-row"><span>完成度</span><strong>${percent}%</strong></div>
      <div class="progress-track"><span class="progress-fill" style="width: ${percent}%"></span></div>
    </div>
    ${isProjectOverdue(project) ? '<p class="progress-alert">已超過目標日期，建議先確認卡住的階段。</p>' : ""}
    <ul class="progress-stage-list">
      ${stages.map((stage) => `<li class="${stage.done ? "is-done" : ""}">${stage.name}</li>`).join("")}
    </ul>
    <p class="progress-next-step"><strong>下一步：</strong>${project.nextStep || "尚未設定下一步。"}</p>
    ${project.notes ? `<p class="progress-project-meta">${project.notes}</p>` : ""}
    <div class="progress-link-row">
      ${linkEntries.map(([label, href]) => `<a class="progress-link" href="${href}">${label}</a>`).join("")}
    </div>
  </article>`;
};

const initBookProgressDashboard = async () => {
  const dashboard = document.querySelector("[data-book-progress-dashboard]");
  if (!dashboard) return;

  const summary = dashboard.querySelector("[data-progress-summary]");
  const grid = dashboard.querySelector("[data-project-grid]");
  const searchInput = dashboard.querySelector("[data-project-search]");
  const filterButtons = [...dashboard.querySelectorAll("[data-project-status]")];
  let activeStatus = "all";
  let projects = [];

  const render = () => {
    const query = String(searchInput?.value || "").trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const statusMatches = activeStatus === "all" || project.status === activeStatus;
      const haystack = [project.title, project.category, project.nextStep, project.notes, project.owner].join(" ").toLowerCase();
      return statusMatches && (!query || haystack.includes(query));
    });

    if (summary) summary.innerHTML = createProgressSummary(projects);
    if (grid) {
      grid.innerHTML = filtered.length
        ? filtered.map(createProjectCard).join("")
        : '<div class="progress-empty">目前沒有符合條件的新書專案。</div>';
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.projectStatus || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  searchInput?.addEventListener("input", render);

  try {
    projects = await loadBookProjects();
  } catch (error) {
    console.warn("book-projects.json load failed.", error);
    if (grid) grid.innerHTML = '<div class="progress-empty">目前無法讀取新書進度資料，請檢查 src/book-projects.json。</div>';
    return;
  }

  render();
};

const boot = () => {

  initNav();

  bindExternalLinks();

  initResourceEmailForms();

  initResourceForms();

  const page = document.body.dataset.page;

  if (page === "home") initHome();

  if (page === "books") initBooksPage();

  if (page === "book") initBookPage();

  if (page === "static-book") initStaticBookResourcePromo();

  if (page === "submit") initSubmitPage();

  if (page === "contact") initContactPage();

  if (page === "admin") initAdminPageLinks();

  if (page === "hermes-agent") initHermesAgentPage();

  if (page === "english-cai") initEnglishCaiPage();

  if (page === "book-progress") initBookProgressDashboard();

};

boot();
