/**
 * admin.js — Happy eBook 書籍管理後台 CRUD 邏輯
 * 版本：20260514
 */
(function initAdminModule() {

/* ══════════════════════════════════════
   1. 狀態與常數
══════════════════════════════════════ */
const adminState = {
  books: [],
  filter: "all",   // all | published | hidden | featured | paid | free
  search: ""
};

const STORAGE_KEY = "happyebook_admin_books_v2";

const emptyBook = () => ({
  id: "",
  title: "",
  subtitle: "",
  author: "Happy eBook 編輯部",
  category: "教學應用",
  type: "web",
  format: "網站閱讀",
  cover: "../assets/images/book-submission-placeholder.svg",
  description: "",
  downloadUrl: "",
  buyUrl: "",
  readUrl: "",
  featured: true,
  popular: false,
  priceLabel: "免費閱讀",
  published: true
});

const normalizeBook = (raw) => ({
  ...emptyBook(),
  ...raw,
  featured:  raw.featured  !== false && raw.featured  !== "false",
  popular:   raw.popular   === true  || raw.popular   === "true",
  published: raw.published !== false && raw.published !== "false"
});

/* ══════════════════════════════════════
   2. DOM 選取
══════════════════════════════════════ */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const elList       = $("[data-admin-list]");
const elEmpty      = $("[data-empty-state]");
const elOutput     = $("[data-json-output]");
const elOverlay    = $("[data-modal-overlay]");
const elModalTitle = $("[data-modal-title]");
const elForm       = $("[data-book-form]");
const elMessage    = $("[data-form-message]");
const elTopStats   = $("[data-admin-top-stats]");
const elFooterCnt  = $("[data-footer-count]");
const elBtnDelete  = $("[data-delete-book]");
const elSearch     = $("[data-admin-search]");

/* ══════════════════════════════════════
   3. 工具函式
══════════════════════════════════════ */
const esc = (v = "") => String(v)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const toSlug = (v = "") => v.trim().toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
  .replace(/^-+|-+$/g, "") || "book";

const uniqueId = (base) => {
  const ids = new Set(adminState.books.map((b) => b.id));
  const slug = toSlug(base);
  if (!ids.has(slug)) return slug;
  let i = 2;
  while (ids.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
};

const showMessage = (text, type = "success") => {
  elMessage.textContent = text;
  elMessage.className = `form-message ${type}`;
  setTimeout(() => { elMessage.textContent = ""; elMessage.className = "form-message"; }, 3000);
};

/* ══════════════════════════════════════
   4. 資料儲存（localStorage 暫存）
══════════════════════════════════════ */
const saveLocal = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminState.books));
  } catch (_) {}
};

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
};

/* ══════════════════════════════════════
   5. 篩選 / 搜尋邏輯
══════════════════════════════════════ */
const matchFilter = (book) => {
  const f = adminState.filter;
  if (f === "published") return book.published !== false;
  if (f === "hidden")    return book.published === false;
  if (f === "featured")  return book.featured === true;
  if (f === "paid")      return book.type === "paid";
  if (f === "free")      return book.type === "free";
  return true;
};

const matchSearch = (book) => {
  const q = adminState.search.toLowerCase().trim();
  if (!q) return true;
  return [book.title, book.author, book.category, book.id, book.subtitle]
    .some((v) => String(v || "").toLowerCase().includes(q));
};

/* ══════════════════════════════════════
   6. 統計列
══════════════════════════════════════ */
const renderStats = () => {
  const total     = adminState.books.length;
  const live      = adminState.books.filter((b) => b.published !== false).length;
  const hidden    = total - live;
  const paid      = adminState.books.filter((b) => b.type === "paid").length;
  const featured  = adminState.books.filter((b) => b.featured === true).length;

  elTopStats.innerHTML = `
    <span class="stat-pill"><span class="stat-num">${total}</span> 本書籍</span>
    <span class="stat-pill live"><span class="stat-num">${live}</span> 已上架</span>
    <span class="stat-pill hidden-pill"><span class="stat-num">${hidden}</span> 未上架</span>
    <span class="stat-pill paid-pill"><span class="stat-num">${paid}</span> 付費</span>
    <span class="stat-pill"><span class="stat-num">${featured}</span> 精選</span>
  `;
  if (elFooterCnt) {
    elFooterCnt.textContent = `共 ${total} 本書籍`;
  }
};

/* ══════════════════════════════════════
   7. 書籍清單渲染
══════════════════════════════════════ */
const typeBadge = (type) => {
  if (type === "paid")  return `<span class="badge type-paid">付費</span>`;
  if (type === "free")  return `<span class="badge type-free">免費</span>`;
  return `<span class="badge type-web">網頁版</span>`;
};

const coverHtml = (cover, title) => {
  if (cover && cover !== "../assets/images/book-submission-placeholder.svg") {
    return `<img src="${esc(cover)}" alt="${esc(title)}" loading="lazy" onerror="this.replaceWith(document.createTextNode(''))">`;
  }
  return `<svg class="admin-book-cover-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 11h6"/></svg>`;
};

const renderList = () => {
  const visible = adminState.books.filter((b) => matchFilter(b) && matchSearch(b));
  elEmpty.hidden = visible.length > 0;

  elList.innerHTML = adminState.books.map((book, idx) => {
    const show = matchFilter(book) && matchSearch(book);
    const hiddenClass = book.published === false ? "is-hidden" : "";
    const filterClass = show ? "" : "is-filtered-out";
    const statusBadge = book.published === false
      ? `<span class="badge draft">未上架</span>`
      : `<span class="badge live">已上架</span>`;
    const featBadge   = book.featured ? `<span class="badge featured">精選</span>` : "";
    const meta = [book.category, book.author].filter(Boolean).join(" · ");

    return `
      <div class="admin-book-card ${hiddenClass} ${filterClass}" data-book-id="${esc(book.id)}">
        <span class="admin-book-num">${idx + 1}</span>
        <div class="admin-book-cover">${coverHtml(book.cover, book.title)}</div>
        <div class="admin-book-info">
          <h3>${esc(book.title || "（未命名）")}</h3>
          <p class="admin-book-meta">${esc(meta || "未填資料")}</p>
        </div>
        <div class="admin-book-badges">
          ${statusBadge}
          ${typeBadge(book.type)}
          ${featBadge}
        </div>
        <div class="admin-book-actions">
          <button type="button" class="btn-up"    data-action="up"     data-id="${esc(book.id)}" ${idx === 0 ? "disabled" : ""} title="上移">↑</button>
          <button type="button" class="btn-down"  data-action="down"   data-id="${esc(book.id)}" ${idx === adminState.books.length - 1 ? "disabled" : ""} title="下移">↓</button>
          <button type="button" class="btn-toggle" data-action="toggle" data-id="${esc(book.id)}" title="${book.published === false ? "上架" : "下架"}">${book.published === false ? "上架" : "下架"}</button>
          <button type="button" class="btn-edit"  data-action="edit"   data-id="${esc(book.id)}">編輯</button>
          <button type="button" class="btn-delete" data-action="delete" data-id="${esc(book.id)}">刪除</button>
        </div>
      </div>
    `;
  }).join("");

  updateOutput();
  renderStats();
};

/* ══════════════════════════════════════
   8. JSON 輸出
══════════════════════════════════════ */
const bookForOutput = (b) => {
  const n = normalizeBook(b);
  return {
    id: n.id, title: n.title, subtitle: n.subtitle,
    author: n.author, category: n.category,
    type: n.type, format: n.format, cover: n.cover,
    description: n.description,
    downloadUrl: n.downloadUrl, buyUrl: n.buyUrl, readUrl: n.readUrl,
    featured: n.featured, popular: n.popular, priceLabel: n.priceLabel
  };
};

const updateOutput = () => {
  if (elOutput) {
    elOutput.value = JSON.stringify(adminState.books.map(bookForOutput), null, 4);
  }
};

/* ══════════════════════════════════════
   9. Modal 開關
══════════════════════════════════════ */
const openModal = (book = null) => {
  const isEdit = !!book;
  elModalTitle.textContent = isEdit ? `編輯：${book.title || "書籍"}` : "新增書籍";
  elBtnDelete.hidden = !isEdit;
  elMessage.textContent = "";

  const b = normalizeBook(book || emptyBook());
  const fields = elForm.elements;

  // 填入表單
  const setText = (name, val) => { if (fields[name]) fields[name].value = String(val ?? ""); };
  const setChk  = (name, val) => { if (fields[name]) fields[name].checked = val === true; };

  setText("editingId",   isEdit ? b.id : "");
  setText("id",          b.id);
  setText("title",       b.title);
  setText("subtitle",    b.subtitle);
  setText("author",      b.author);
  setText("category",    b.category);
  setText("type",        b.type);
  setText("format",      b.format);
  setText("priceLabel",  b.priceLabel);
  setText("cover",       b.cover);
  setText("readUrl",     b.readUrl);
  setText("buyUrl",      b.buyUrl);
  setText("downloadUrl", b.downloadUrl);
  setText("description", b.description);
  setChk("published", b.published);
  setChk("featured",  b.featured);
  setChk("popular",   b.popular);

  elOverlay.hidden = false;
  document.body.style.overflow = "hidden";

  // 自動產生 ID（新增時，書名輸入後）
  if (!isEdit) {
    fields.id.dataset.autoId = "true";
    fields.title.addEventListener("input", handleAutoId);
  } else {
    delete fields.id.dataset.autoId;
    fields.title.removeEventListener("input", handleAutoId);
  }

  setTimeout(() => fields.title.focus(), 100);
};

const handleAutoId = () => {
  const idField = elForm.elements.id;
  if (idField.dataset.autoId !== "true") return;
  idField.value = toSlug(elForm.elements.title.value);
};

const closeModal = () => {
  elOverlay.hidden = true;
  document.body.style.overflow = "";
  elForm.elements.title.removeEventListener("input", handleAutoId);
};

/* ══════════════════════════════════════
   10. CRUD 操作
══════════════════════════════════════ */
const validateForm = () => {
  const fields = elForm.elements;
  let ok = true;
  ["id", "title"].forEach((name) => {
    const el = fields[name];
    if (!el) return;
    el.classList.remove("is-error");
    if (!el.value.trim()) {
      el.classList.add("is-error");
      ok = false;
    }
  });
  return ok;
};

const readFormBook = () => {
  const fd = new FormData(elForm);
  const data = Object.fromEntries(fd.entries());
  return normalizeBook({
    ...data,
    id:         (data.id || "").trim() || toSlug(data.title || "book"),
    published:  elForm.elements.published.checked,
    featured:   elForm.elements.featured.checked,
    popular:    elForm.elements.popular.checked
  });
};

// CREATE / UPDATE
const saveBook = (e) => {
  e.preventDefault();
  if (!validateForm()) {
    showMessage("請填寫書籍 ID 與書名。", "error");
    return;
  }

  const next = readFormBook();
  const editingId = (elForm.elements.editingId.value || "").trim();
  const isDuplicate = adminState.books.some((b) => b.id === next.id && b.id !== editingId);

  if (isDuplicate) {
    showMessage(`ID「${next.id}」已存在，請改用其他 ID。`, "error");
    elForm.elements.id.classList.add("is-error");
    return;
  }

  if (editingId) {
    // UPDATE
    adminState.books = adminState.books.map((b) => b.id === editingId ? next : b);
    showMessage("書籍已更新。");
  } else {
    // CREATE
    adminState.books.unshift(next);
    showMessage("書籍已新增。");
  }

  saveLocal();
  renderList();
  setTimeout(closeModal, 800);
};

// READ — list 點擊事件
const handleListClick = (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id     = btn.dataset.id;
  const action = btn.dataset.action;
  const idx    = adminState.books.findIndex((b) => b.id === id);
  if (idx === -1) return;
  const book = adminState.books[idx];

  if (action === "up" || action === "down") {
    const target = idx + (action === "up" ? -1 : 1);
    if (target < 0 || target >= adminState.books.length) return;
    [adminState.books[idx], adminState.books[target]] = [adminState.books[target], adminState.books[idx]];
    saveLocal();
    renderList();
    return;
  }

  if (action === "toggle") {
    adminState.books[idx] = { ...book, published: !book.published };
    saveLocal();
    renderList();
    return;
  }

  if (action === "edit") {
    openModal(book);
    return;
  }

  if (action === "delete") {
    if (!confirm(`確定要刪除「${book.title}」嗎？\n\n此操作無法復原。`)) return;
    adminState.books.splice(idx, 1);
    saveLocal();
    renderList();
  }
};

// DELETE from modal
const deleteFromModal = () => {
  const editingId = (elForm.elements.editingId.value || "").trim();
  if (!editingId) return;
  const book = adminState.books.find((b) => b.id === editingId);
  if (!book) return;
  if (!confirm(`確定要刪除「${book.title}」嗎？\n\n此操作無法復原。`)) return;
  adminState.books = adminState.books.filter((b) => b.id !== editingId);
  saveLocal();
  renderList();
  closeModal();
};

/* ══════════════════════════════════════
   11. 匯出功能
══════════════════════════════════════ */
const downloadFile = (filename, content, type = "application/json;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadJson = () => downloadFile("books.json", elOutput.value);

const copyJson = async () => {
  const text = elOutput.value;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      elOutput.select();
      document.execCommand("copy");
    }
    alert("已複製 books.json 內容到剪貼簿。");
  } catch (_) {
    alert("複製失敗，請手動選取 JSON 輸出區後複製。");
  }
};

/* ══════════════════════════════════════
   12. 篩選 & 搜尋事件
══════════════════════════════════════ */
const applyFilter = (filter) => {
  adminState.filter = filter;
  $$("[data-filter]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === filter);
  });
  renderList();
};

/* ══════════════════════════════════════
   13. 初始化
══════════════════════════════════════ */
const initAdmin = async () => {
  // 1. 載入 books.json（直接 fetch，不依賴 script.js 的 loadBooks 以避免排序干擾）
  let books = [];
  try {
    const res = await fetch("books.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    books = await res.json();
  } catch (err) {
    console.warn("[admin] books.json 載入失敗：", err);
    books = [];
  }

  // 2. 若 localStorage 有暫存資料，優先使用（版主本次修改狀態）
  const local = loadLocal();
  adminState.books = (local || books).map(normalizeBook);

  // 3. 初次渲染
  renderList();

  // ── 事件綁定 ──

  // 書籍列表操作
  elList.addEventListener("click", handleListClick);

  // Modal 開關
  $("[data-new-book]").addEventListener("click", () => openModal());
  $("[data-modal-close]").addEventListener("click", closeModal);
  elOverlay.addEventListener("click", (e) => { if (e.target === elOverlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // 表單儲存 / 刪除
  elForm.addEventListener("submit", saveBook);
  elBtnDelete.addEventListener("click", deleteFromModal);

  // 匯出
  $("[data-download-json]").addEventListener("click", downloadJson);
  $("[data-copy-json]").addEventListener("click", copyJson);

  // 篩選
  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-filter]");
    if (chip) applyFilter(chip.dataset.filter);
  });

  // 搜尋（防抖）
  let searchTimer;
  elSearch.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      adminState.search = elSearch.value;
      renderList();
    }, 180);
  });

  // 重設 localStorage（開發用）
  const resetBtn = $("[data-reset-local]");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("確定清除暫存資料，重新從 books.json 載入？")) return;
      localStorage.removeItem(STORAGE_KEY);
      adminState.books = books.map(normalizeBook);
      saveLocal();
      renderList();
    });
  }
};

// 僅在 admin 頁執行
if (document.body.dataset.page === "admin") {
  initAdmin();
}

})(); // end initAdminModule
