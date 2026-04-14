# happyebook2

happyebook2 是一個電子書平台專案，目標是建立一個可快速上線、可逐步擴充的網站，用來展示與整理：

- EPUB 電子書
- PDF 電子書
- 網頁版電子書
- 免費與付費內容
- 作者投稿內容

## 專案目標

本專案分為三個階段：

1. Phase 1：快速上線版 MVP
2. Phase 2：平台功能版
3. Phase 3：正式商業版

## 專案結構

```text
happyebook2/
├─ README.md
├─ AGENTS.md
├─ .gitignore
├─ PROMPTS/
├─ docs/
├─ src/
└─ assets/
```

## Phase 1 內容

快速上線版包含：

- 首頁
- 書籍列表頁
- 單本作品頁
- 投稿頁
- 關於頁
- 聯絡頁

資料來源使用：

- `src/books.json`

技術使用：

- HTML
- CSS
- Vanilla JavaScript

## 開發原則

- 先求可上線
- 先求可維護
- 不使用前端框架
- 優先使用簡單、清楚、低維護成本的做法
- 可逐步擴充到會員與商業版

## 使用方式

本地可直接開啟：

- `src/index.html`

如果需要較完整的資料載入體驗，建議啟動簡單靜態伺服器：

- `python -m http.server`
- VS Code Live Server

## 提示詞位置

- `PROMPTS/phase1_mvp.md`
- `PROMPTS/phase2_platform.md`
- `PROMPTS/phase3_business.md`

## 給 Codex 的規則

請參考：

- `AGENTS.md`

## 後續規劃

- 串第三方付費連結
- 加入會員系統
- 作者上傳後台
- 金流與訂單
- 管理員審核
- 報表分析

## 授權

此專案可作為 happyebook2 平台開發基礎使用。
