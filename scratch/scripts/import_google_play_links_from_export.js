const fs = require("fs");

const exportPath = "C:/tmp/googlebooks-list.tsv";
const booksJsonPath = "src/books.json";

const targetIds = [
  "from-automate-this-to-ai-agents",
  "agent-age-autonomous-ai-employees",
  "drawing-with-text-mermaid-ai-era",
  "text-drawing-mermaid-ai-era",
  "python-0-to-functions",
  "ai-automation-toolbook",
  "codex-learning-by-doing",
  "agentic-web-development",
  "sqlite-zero-beginner-guide",
  "classic-english-writing-second-edition",
  "ipas-ai-high-score-2026-05",
  "speak-clearly-bilingual-google-play",
  "ai-agent-development-workflows"
];

const parseLine = (line) => {
  const fields = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (quoted && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "\t" && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
};

const normalizeTitle = (value) => String(value || "")
  .replace(/[\u300a\u300b]/g, "")
  .replace(/[\uff1a:]/g, ":")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const raw = fs.readFileSync(exportPath).toString("utf16le").replace(/^\uFEFF/, "");
const rows = raw.split(/\r?\n/).filter(Boolean).slice(1).map(parseLine);
const books = JSON.parse(fs.readFileSync(booksJsonPath, "utf8"));

const updates = [];
const misses = [];

for (const id of targetIds) {
  const book = books.find((item) => item.id === id);
  if (!book) continue;

  const targetTitle = normalizeTitle(book.title);
  const row = rows.find((item) => normalizeTitle(item[5]) === targetTitle)
    || rows.find((item) => {
      const rowTitle = normalizeTitle(item[5]);
      return rowTitle && (rowTitle.includes(targetTitle) || targetTitle.includes(rowTitle));
    });

  if (!row || !row[3]) {
    misses.push(id);
    continue;
  }

  const price = String(row[51] || "").trim();
  const priceLabel = price ? `NT$${Number(price).toLocaleString("zh-TW")}，提供試閱版` : "Google Play Books，提供試閱版";
  book.buyUrl = row[3];
  book.readUrl = row[3];
  book.priceLabel = priceLabel;
  book.googleBooksKey = row[0];
  updates.push({ id, title: book.title, link: row[3], priceLabel });

  const pagePath = `books/${id}.html`;
  if (fs.existsSync(pagePath)) {
    let html = fs.readFileSync(pagePath, "utf8");
    html = html.replace(/Google Play Books 書籍 ID 與定價待確認/g, priceLabel);
    html = html.replace(/<span class="button primary is-disabled" aria-disabled="true">Google Play Books 資訊待確認<\/span>/g, `<a class="button primary" href="${row[3]}" target="_blank" rel="noopener noreferrer">前往 Google Play Books</a>`);
    fs.writeFileSync(pagePath, html, "utf8");
  }
}

fs.writeFileSync(booksJsonPath, `${JSON.stringify(books, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ updated: updates.length, misses, updates }, null, 2));
