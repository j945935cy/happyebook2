const adminState = {
  books: [],
  editingId: null
};

const emptyBook = () => ({
  id: "",
  title: "",
  subtitle: "",
  author: "Happy eBook 編輯部",
  category: "英語學習",
  type: "web",
  format: "網站閱讀",
  cover: "../assets/images/book-cover.svg",
  description: "",
  downloadUrl: "",
  buyUrl: "",
  readUrl: "",
  featured: true,
  popular: true,
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

const toSlug = (value) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
  .replace(/^-+|-+$/g, "");

const updateOutput = () => {
  output.value = JSON.stringify(adminState.books.map(normalizeBook), null, 2);
};

const updateSummary = () => {
  const total = adminState.books.length;
  const published = adminState.books.filter((book) => book.published !== false).length;
  const hidden = total - published;
  summary.innerHTML = `<span>全部 ${total} 本</span><span>上架 ${published} 本</span><span>下架 ${hidden} 本</span>`;
};

const renderAdminList = () => {
  updateSummary();
  updateOutput();
  list.innerHTML = adminState.books.map((book, index) => {
    const status = book.published === false ? "下架" : "上架";
    const statusClass = book.published === false ? "is-hidden" : "is-live";
    return `
      <article class="admin-book-row ${statusClass}">
        <div class="admin-book-main">
          <span class="admin-order">#${index + 1}</span>
          <div>
            <h3>${book.title || "未命名書籍"}</h3>
            <p>${book.category || "未分類"} ・ ${book.author || "未填作者"}</p>
            <span class="admin-status">${status}</span>
          </div>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-action="up" data-id="${book.id}" ${index === 0 ? "disabled" : ""}>上移</button>
          <button type="button" data-action="down" data-id="${book.id}" ${index === adminState.books.length - 1 ? "disabled" : ""}>下移</button>
          <button type="button" data-action="toggle" data-id="${book.id}">${book.published === false ? "上架" : "下架"}</button>
          <button type="button" data-action="edit" data-id="${book.id}">編輯</button>
          <button type="button" data-action="delete" data-id="${book.id}">移除</button>
        </div>
      </article>
    `;
  }).join("");
};

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
  const titleSlug = toSlug(data.title || "book");
  return normalizeBook({
    ...data,
    id: data.id.trim() || titleSlug,
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
  if (action === "delete" && confirm(`確定移除「${book.title}」？`)) {
    adminState.books = adminState.books.filter((item) => item.id !== id);
    resetEditor();
    renderAdminList();
  }
};

const saveBook = (event) => {
  event.preventDefault();
  const nextBook = readFormBook();
  const duplicate = adminState.books.some((book) => book.id === nextBook.id && book.id !== adminState.editingId);
  if (duplicate) {
    alert("這個 ID 已經存在，請改成唯一 ID。");
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

const downloadJson = () => {
  const blob = new Blob([output.value], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "books.json";
  link.click();
  URL.revokeObjectURL(url);
};

const copyJson = async () => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(output.value);
  } else {
    output.select();
    document.execCommand("copy");
  }
  alert("已複製 books.json 內容。");
};

const initAdmin = async () => {
  const books = await loadBooks();
  adminState.books = books.map(normalizeBook);
  setFormBook(emptyBook());
  renderAdminList();

  form.addEventListener("submit", saveBook);
  list.addEventListener("click", handleListAction);
  document.querySelector("[data-new-book]").addEventListener("click", resetEditor);
  document.querySelector("[data-reset-form]").addEventListener("click", resetEditor);
  document.querySelector("[data-download-json]").addEventListener("click", downloadJson);
  document.querySelector("[data-copy-json]").addEventListener("click", copyJson);
};

if (document.body.dataset.page === "admin") {
  initAdmin();
}
