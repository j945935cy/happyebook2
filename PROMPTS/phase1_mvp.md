# Phase 1 - happyebook2 快速上線版

請依照 `AGENTS.md` 規則，完成 happyebook2 的快速上線版網站。

## 目標

建立一個可快速部署的電子書平台前台。

## 請建立以下檔案

- `src/index.html`
- `src/books.html`
- `src/book.html`
- `src/submit.html`
- `src/about.html`
- `src/contact.html`
- `src/styles.css`
- `src/script.js`
- `src/books.json`

## 技術限制

- HTML / CSS / Vanilla JavaScript
- 不使用前端框架
- 所有書籍資料來自 `books.json`

## 首頁需求

- Hero 主視覺
- 平台特色
- 最新上架作品
- 熱門作品
- 分類導覽
- 免費 / 付費導流
- 投稿 CTA
- Footer

## 書籍列表頁需求

- 顯示所有作品
- 支援類型篩選：
- 全部
- 免費
- 付費
- 網頁版
- 支援分類篩選

## 書籍頁需求

顯示：

- 書封
- 書名
- 副標
- 作者
- 分類
- 標籤
- 簡介
- 格式
- 操作按鈕

條件顯示：

- 免費書：下載
- 付費書：購買
- 網頁版：前往閱讀

## 投稿頁需求

- 投稿說明
- 投稿規則
- 投稿流程
- Google 表單占位區
- 投稿按鈕

## 關於頁需求

- 平台介紹
- 平台理念
- 適合讀者與作者

## 聯絡頁需求

- 聯絡資訊
- Email 表單版型
- 社群連結

## JavaScript 功能

- 讀取 `books.json`
- 動態渲染書籍卡片
- 篩選功能
- 手機選單
- 平滑捲動

## 成功標準

- 可直接部署到 Vercel / Netlify
- 可正常開啟所有頁面
- 可從 `books.json` 載入資料
