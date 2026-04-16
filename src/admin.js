const adminState = {
  books: [],
  submissions: [],
  editingId: null
};

const adminSubmissionsKey = "happyebook_author_submissions";

const emptyBook = () => ({
  id: "",
  title: "",
  subtitle: "",
  author: "Happy eBook 編輯部",
  category: "教學應用",
  type: "web",
  format: "網頁閱讀",
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

const normalizeBook = (book) => ({
  ...emptyBook(),
  ...book,
  featured: book.featured === true,
  popular: book.popular === true,
  published: book.published !== false
});

const form = document.querySelector("[data-book-form]");
const list = document.querySelector("[data-admin-list]");
const summary = document.querySelector("[data-admin-summary]");
const output = document.querySelector("[data-json-output]");
const formTitle = document.querySelector("[data-admin-form-title]");
const submissionList = document.querySelector("[data-submission-list]");
const submissionSummary = document.querySelector("[data-submission-summary]");

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const toSlug = (value) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
  .replace(/^-+|-+$/g, "") || "book";

const uniqueBookId = (baseId) => {
  const base = toSlug(baseId);
  const ids = new Set(adminState.books.map((book) => book.id));
  if (!ids.has(base)) return base;
  let index = 2;
  while (ids.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
};

const readStoredSubmissions = () => {
  try {
    return JSON.parse(localStorage.getItem(adminSubmissionsKey) || "[]");
  } catch (error) {
    console.warn("待審投稿讀取失敗：", error);
    return [];
  }
};

const writeStoredSubmissions = () => {
  localStorage.setItem(adminSubmissionsKey, JSON.stringify(adminState.submissions));
};

const getSubmissionKey = (submission) => submission.submissionId || submission.id;

const formatSubmissionDate = (submittedAt) => {
  const parsed = new Date(submittedAt);
  return Number.isNaN(parsed.getTime()) ? "未提供" : parsed.toLocaleString("zh-TW");
};

const bookForOutput = (book) => {
  const normalized = normalizeBook(book);
  return {
    id: normalized.id,
    title: normalized.title,
    subtitle: normalized.subtitle,
    author: normalized.author,
    category: normalized.category,
    type: normalized.type,
    format: normalized.format,
    cover: normalized.cover,
    description: normalized.description,
    downloadUrl: normalized.downloadUrl,
    buyUrl: normalized.buyUrl,
    readUrl: normalized.readUrl,
    featured: normalized.featured,
    popular: normalized.popular,
    priceLabel: normalized.priceLabel,
    published: normalized.published
  };
};

const updateOutput = () => {
  output.value = JSON.stringify(adminState.books.map(bookForOutput), null, 2);
};

const updateSummary = () => {
  const total = adminState.books.length;
  const published = adminState.books.filter((book) => book.published !== false).length;
  const hidden = total - published;
  summary.innerHTML = `<span>全部 ${total} 本</span><span>已上架 ${published} 本</span><span>未上架 ${hidden} 本</span>`;
};

const updateSubmissionSummary = () => {
  const pending = adminState.submissions.filter((item) => item.status === "pending").length;
  const approved = adminState.submissions.filter((item) => item.status === "approved").length;
  const rejected = adminState.submissions.filter((item) => item.status === "rejected").length;
  submissionSummary.innerHTML = `<span>待審 ${pending} 件</span><span>已核准 ${approved} 件</span><span>已退回 ${rejected} 件</span>`;
};

const renderAdminList = () => {
  updateSummary();
  updateOutput();
  list.innerHTML = adminState.books.map((book, index) => {
    const status = book.published === false ? "未上架" : "已上架";
    const statusClass = book.published === false ? "is-hidden" : "is-live";
    return `
      <article class="admin-book-row ${statusClass}">
        <div class="admin-book-main">
          <span class="admin-order">#${index + 1}</span>
          <div>
            <h3>${escapeHtml(book.title || "未命名作品")}</h3>
            <p>${escapeHtml(book.category || "未分類")} ・ ${escapeHtml(book.author || "未填作者")}</p>
            <span class="admin-status">${status}</span>
          </div>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-action="up" data-id="${escapeHtml(book.id)}" ${index === 0 ? "disabled" : ""}>上移</button>
          <button type="button" data-action="down" data-id="${escapeHtml(book.id)}" ${index === adminState.books.length - 1 ? "disabled" : ""}>下移</button>
          <button type="button" data-action="toggle" data-id="${escapeHtml(book.id)}">${book.published === false ? "上架" : "下架"}</button>
          <button type="button" data-action="edit" data-id="${escapeHtml(book.id)}">編輯</button>
          <button type="button" data-action="delete" data-id="${escapeHtml(book.id)}">刪除</button>
        </div>
      </article>
    `;
  }).join("");
};

const submissionStatusLabel = (status) => ({ pending: "待審", approved: "已核准", rejected: "已退回" }[status] || "待審");

const renderSubmissionList = () => {
  updateSubmissionSummary();
  const submissions = adminState.submissions;
  if (!submissions.length) {
    submissionList.innerHTML = `<div class="empty-state"><h3>目前沒有待審投稿</h3><p>作者送出投稿後，會出現在這裡等待版主審核。</p></div>`;
    return;
  }

  submissionList.innerHTML = submissions.map((item) => `
    <article class="submission-review-card is-${escapeHtml(item.status || "pending")}">
      <div class="submission-review-main">
        <div>
          <span class="admin-status">${submissionStatusLabel(item.status)}</span>
          <h3>${escapeHtml(item.title || "未命名作品")}</h3>
          <p>${escapeHtml(item.author || "未填作者")} ・ ${escapeHtml(item.category || "未分類")} ・ ${escapeHtml(item.format || "未填格式")}</p>
        </div>
        <p>${escapeHtml(item.description || "尚未提供作品簡介")}</p>
        <dl class="submission-meta">
          <div><dt>Email</dt><dd>${escapeHtml(item.contactEmail || "未提供")}</dd></div>
          <div><dt>送出時間</dt><dd>${escapeHtml(formatSubmissionDate(item.submittedAt))}</dd></div>
          <div><dt>取得方式</dt><dd>${escapeHtml(item.priceLabel || "未填")}</dd></div>
          <div><dt>備註</dt><dd>${escapeHtml(item.note || "無")}</dd></div>
        </dl>
      </div>
      <div class="admin-row-actions">
        <button type="button" data-submission-action="approve" data-id="${escapeHtml(getSubmissionKey(item))}" ${item.status === "approved" ? "disabled" : ""}>核准上架</button>
        <button type="button" data-submission-action="edit" data-id="${escapeHtml(getSubmissionKey(item))}">載入編輯</button>
        <button type="button" data-submission-action="reject" data-id="${escapeHtml(getSubmissionKey(item))}" ${item.status === "rejected" ? "disabled" : ""}>退回</button>
        <button type="button" data-submission-action="remove" data-id="${escapeHtml(getSubmissionKey(item))}">移除</button>
      </div>
    </article>
  `).join("");
};

const submissionToBook = (submission, options = {}) => normalizeBook({
  id: options.keepId ? submission.id : uniqueBookId(submission.title || submission.id || "book"),
  title: submission.title,
  subtitle: submission.subtitle,
  author: submission.author,
  category: submission.category,
  type: submission.type,
  format: submission.format,
  cover: submission.cover || "../assets/images/book-submission-placeholder.svg",
  description: submission.description,
  downloadUrl: submission.downloadUrl,
  buyUrl: submission.buyUrl,
  readUrl: submission.readUrl,
  featured: false,
  popular: false,
  priceLabel: submission.priceLabel,
  published: true
});

const setFormBook = (book = emptyBook()) => {
  const normalized = normalizeBook(book);
  formTitle.textContent = adminState.editingId ? "編輯書籍" : "新增書籍";
  Object.entries(normalized).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") {
      field.checked = value === true;
    } else {
      field.value = String(value ?? "");
    }
  });
};

const readFormBook = () => {
  const data = Object.fromEntries(new FormData(form).entries());
  return normalizeBook({
    ...data,
    id: data.id.trim() || toSlug(data.title || "book"),
    featured: form.elements.featured.checked,
    popular: form.elements.popular.checked,
    published: data.published === "true"
  });
};

const resetEditor = () => {
  adminState.editingId = null;
  form.reset();
  setFormBook(emptyBook());
};

const moveBook = (id, direction) => {
  const index = adminState.books.findIndex((book) => book.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= adminState.books.length) return;
  const [book] = adminState.books.splice(index, 1);
  adminState.books.splice(target, 0, book);
  renderAdminList();
};

const handleListAction = (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  const book = adminState.books.find((item) => item.id === id);
  if (!book) return;

  if (action === "up") moveBook(id, -1);
  if (action === "down") moveBook(id, 1);
  if (action === "toggle") {
    book.published = book.published === false;
    renderAdminList();
  }
  if (action === "edit") {
    adminState.editingId = id;
    setFormBook(book);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "delete" && confirm(`確定要刪除「${book.title}」嗎？`)) {
    adminState.books = adminState.books.filter((item) => item.id !== id);
    resetEditor();
    renderAdminList();
  }
};

const handleSubmissionAction = (event) => {
  const button = event.target.closest("button[data-submission-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.submissionAction;
  const submission = adminState.submissions.find((item) => getSubmissionKey(item) === id);
  if (!submission) return;

  if (action === "approve") {
    adminState.books.unshift(submissionToBook(submission));
    submission.status = "approved";
    submission.reviewedAt = new Date().toISOString();
    writeStoredSubmissions();
    renderAdminList();
    renderSubmissionList();
  }
  if (action === "edit") {
    adminState.editingId = null;
    setFormBook(submissionToBook(submission));
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "reject") {
    submission.status = "rejected";
    submission.reviewedAt = new Date().toISOString();
    writeStoredSubmissions();
    renderSubmissionList();
  }
  if (action === "remove" && confirm("確定要移除此投稿資料嗎？")) {
    adminState.submissions = adminState.submissions.filter((item) => getSubmissionKey(item) !== id);
    writeStoredSubmissions();
    renderSubmissionList();
  }
};

const saveBook = (event) => {
  event.preventDefault();
  const nextBook = readFormBook();
  const duplicate = adminState.books.some((book) => book.id === nextBook.id && book.id !== adminState.editingId);
  if (duplicate) {
    alert("這個 ID 已經存在，請改用其他 ID。");
    return;
  }

  if (adminState.editingId) {
    adminState.books = adminState.books.map((book) => book.id === adminState.editingId ? nextBook : book);
  } else {
    adminState.books.unshift(nextBook);
  }

  resetEditor();
  renderAdminList();
};

const downloadTextFile = (filename, content, type = "application/json;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadJson = () => downloadTextFile("books.json", output.value);

const copyJson = async () => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(output.value);
  } else {
    output.select();
    document.execCommand("copy");
  }
  alert("已複製 books.json 內容。");
};

const exportSubmissions = () => {
  downloadTextFile("author-submissions.json", JSON.stringify(adminState.submissions, null, 2));
};

const clearReviewed = () => {
  adminState.submissions = adminState.submissions.filter((item) => item.status === "pending");
  writeStoredSubmissions();
  renderSubmissionList();
};

const initAdmin = async () => {
  const books = await loadBooks();
  adminState.books = books.map(normalizeBook);
  adminState.submissions = readStoredSubmissions();
  setFormBook(emptyBook());
  renderAdminList();
  renderSubmissionList();

  form.addEventListener("submit", saveBook);
  list.addEventListener("click", handleListAction);
  submissionList.addEventListener("click", handleSubmissionAction);
  document.querySelector("[data-new-book]").addEventListener("click", resetEditor);
  document.querySelector("[data-reset-form]").addEventListener("click", resetEditor);
  document.querySelector("[data-download-json]").addEventListener("click", downloadJson);
  document.querySelector("[data-copy-json]").addEventListener("click", copyJson);
  document.querySelector("[data-export-submissions]").addEventListener("click", exportSubmissions);
  document.querySelector("[data-clear-reviewed]").addEventListener("click", clearReviewed);
};

if (document.body.dataset.page === "admin") {
  initAdmin();
}
