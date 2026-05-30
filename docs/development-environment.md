# 開發環境檢查

這份文件整理 Happy eBook 在本機開發時需要的工具與目前建議做法。專案以 GitHub Pages 相容的純靜態網站為主，不需要 build step。

## 必要工具

- Git：版本控管與推送 GitHub。
- Python 3：啟動本機靜態伺服器。
- Node.js：檢查 JavaScript 語法。
- npm：保留給需要使用 `npx` 或前端小工具時使用。

## 建議工具

- GitHub CLI：推送、檢查登入狀態與處理 GitHub 工作。
- Vercel CLI：若要使用 Vercel 預覽或部署時使用。
- VS Code Live Server：可作為本機預覽替代方案。

## 本機預覽

在專案根目錄執行：

```bash
python3 -m http.server 8090 --bind 127.0.0.1
```

開啟：

```text
http://127.0.0.1:8090/
http://127.0.0.1:8090/books.html
http://127.0.0.1:8090/about.html
http://127.0.0.1:8090/contact.html
```

## 常用檢查

```bash
git status --short --branch
node --check src/script.js
node --check src/admin.js
python3 -m json.tool src/books.json
python3 -m json.tool src/book-projects.json
```

## 環境變數

若只開發公開靜態頁面，不需要 `.env`。

若要測試 Google Sheets 或 `api/resource-leads.js` 相關功能，請先建立 `.env`，欄位可參考 `.env.example`：

```text
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
GOOGLE_SHEET_NAME=resource_leads
```

`.env` 已列入 `.gitignore`，不要提交真實金鑰。

## GitHub CLI 登入

如果 `gh auth status` 顯示 token invalid，重新登入：

```bash
gh auth login -h github.com
```

## Python 虛擬環境

目前專案主要使用標準函式庫腳本，通常不需要 Python 虛擬環境。若未來需要重建 Linux/WSL 可用的 venv，可先確認沒有要保留的舊環境，再執行：

```bash
python3 -m venv .venv
```
