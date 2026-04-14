一、建議的 GitHub 專案結構
Happy-eBook/
├─ README.md
├─ AGENTS.md
├─ .gitignore
├─ PROMPTS/
│  ├─ phase1_mvp.md
│  ├─ phase2_platform.md
│  └─ phase3_business.md
├─ docs/
│  ├─ site-map.md
│  ├─ content-model.md
│  └─ deployment-notes.md
├─ src/
│  ├─ index.html
│  ├─ books.html
│  ├─ book.html
│  ├─ submit.html
│  ├─ about.html
│  ├─ contact.html
│  ├─ styles.css
│  ├─ script.js
│  └─ books.json
└─ assets/
   ├─ images/
   └─ icons/
二、各檔案用途
檔案 / 資料夾	用途
README.md	專案總說明，給人看
AGENTS.md	給 Codex / AI agent 看的長期規則
.gitignore	忽略不需要提交的檔案
PROMPTS/	放各階段提示詞
docs/	放網站規劃與說明文件
src/	前端網站主程式
assets/	圖片、圖示等素材
三、README.md
# Happy eBook

Happy eBook 是一個電子書平台專案，目標是建立一個可快速上線、可逐步擴充的網站，用來展示與整理：

- EPUB 電子書
- PDF 電子書
- 網頁版電子書
- 免費與付費內容
- 作者投稿內容

---

## 專案目標

本專案分為三個階段：

1. Phase 1：快速上線版 MVP
2. Phase 2：平台功能版（會員 / 付費 / 作者後台）
3. Phase 3：正式商業版（完整後台 / 金流 / 報表）

---

## 專案結構

```text
Happy-eBook/
├─ README.md
├─ AGENTS.md
├─ .gitignore
├─ PROMPTS/
├─ docs/
├─ src/
└─ assets/
Phase 1 內容

快速上線版包含：

首頁
書籍列表頁
單本作品頁
投稿頁
關於頁
聯絡頁

資料來源使用：

src/books.json

技術使用：

HTML
CSS
Vanilla JavaScript
開發原則
先求可上線
先求可維護
不使用前端框架
優先使用簡單、清楚、低維護成本的做法
可逐步擴充到會員與商業版
使用方式
本地直接開啟

可直接打開：

src/index.html
若需本地伺服器

可使用簡單靜態伺服器，例如：

python -m http.server

或使用 VS Code Live Server。

提示詞位置
PROMPTS/phase1_mvp.md
PROMPTS/phase2_platform.md
PROMPTS/phase3_business.md
給 Codex 的規則

請參考：

AGENTS.md
後續規劃
串第三方付費連結
加入會員系統
作者上傳後台
金流與訂單
管理員審核
報表分析
授權

此專案可作為 Happy eBook 平台開發基礎使用。


---

# 四、AGENTS.md

```md
# AGENTS.md
# Happy eBook 專案長期規則

---

## 專案名稱

Happy eBook

---

## 專案定位

Happy eBook 是一個電子書平台，內容包括：

- EPUB / PDF 電子書
- 網頁版電子書
- 免費內容
- 付費內容
- 作者投稿作品

網站整體風格偏向：

- 教學平台
- 數位書櫃
- 簡潔內容導向
- 易讀、清楚、明亮

---

## 技術規則

請務必遵守以下限制：

- 使用 HTML5 / CSS3 / Vanilla JavaScript
- 不使用 React
- 不使用 Vue
- 不使用 Angular
- 不使用 Tailwind
- 不使用 Bootstrap
- 不使用 jQuery
- 不使用外部 UI framework

---

## 專案結構規範

主要前端檔案放在：

- `src/`

提示詞放在：

- `PROMPTS/`

文件放在：

- `docs/`

素材放在：

- `assets/`

---

## 樣式規範

- 所有樣式集中於 `styles.css`
- 不可將大量 CSS 寫在 HTML 中
- 命名需清楚一致
- 元件風格需統一
- 建議使用 CSS 變數管理色彩

---

## JavaScript 規範

- 所有互動放在 `script.js`
- 不可寫大量 inline JS
- 優先做必要功能：
  - 載入資料
  - 篩選
  - 手機選單
  - 小型互動
- 保持程式碼簡潔

---

## UI / UX 規範

整體風格應維持：

- 簡潔
- 明亮
- 易讀
- 專業
- 教學平台感
- 不要太像花俏商城

色彩建議：

- 主色：藍色
- 輔色：橘色
- 免費標籤：綠色
- 付費標籤：橘色
- 網頁版標籤：藍色

---

## 必須統一的元件

- 導覽列
- 按鈕
- 書籍卡片
- 標籤
- 表單欄位
- Footer

---

## 響應式要求

必須支援：

- 桌機
- 平板
- 手機

要求：

- 不爆版
- 字體可讀
- 按鈕可點
- 卡片可自動調整

---

## HTML 規範

請使用語意化標籤：

- header
- nav
- main
- section
- article
- footer

表單欄位需有：

- label

圖片若使用 `<img>`，需有：

- alt

---

## 文案規範

- 使用繁體中文
- 使用台灣用語
- 不使用 emoji
- 語氣清楚、專業、易懂
- 不使用中國大陸常見用語

---

## 可維護性規範

- class 命名清楚
- 元件可重複使用
- 避免重複樣式
- 檔案結構要讓其他工程師容易接手

---

## 禁止事項

- 不要只輸出片段
- 不要只做骨架不填內容
- 不要混雜大量 CSS / JS 到 HTML
- 不要引入外部大型框架
- 不要過度設計

---

## 成功標準

完成後應符合：

- 可直接瀏覽
- 可快速部署
- 視覺一致
- 結構清楚
- 易於擴充
五、.gitignore
# macOS
.DS_Store

# Windows
Thumbs.db

# VS Code
.vscode/

# Node
node_modules/

# Logs
*.log

# Build
dist/
build/

# Env
.env
.env.local
六、PROMPTS/phase1_mvp.md
# Phase 1 - Happy eBook 快速上線版

請依照 `AGENTS.md` 規則，完成 Happy eBook 的快速上線版網站。

---

## 目標

建立一個可快速部署的電子書平台前台。

---

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

---

## 技術限制

- HTML / CSS / Vanilla JavaScript
- 不使用前端框架
- 所有書籍資料來自 `books.json`

---

## 首頁需求

- Hero 主視覺
- 平台特色
- 最新上架作品
- 熱門作品
- 分類導覽
- 免費 / 付費導流
- 投稿 CTA
- Footer

---

## 書籍列表頁需求

- 顯示所有作品
- 支援類型篩選：
  - 全部
  - 免費
  - 付費
  - 網頁版
- 支援分類篩選

---

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

---

## 投稿頁需求

- 投稿說明
- 投稿規則
- 投稿流程
- Google 表單占位區
- 投稿按鈕

---

## 關於頁需求

- 平台介紹
- 平台理念
- 適合讀者與作者

---

## 聯絡頁需求

- 聯絡資訊
- Email 表單版型
- 社群連結

---

## JavaScript 功能

- 讀取 `books.json`
- 動態渲染書籍卡片
- 篩選功能
- 手機選單
- 平滑捲動

---

## 成功標準

- 可直接部署到 Vercel / Netlify
- 可正常開啟所有頁面
- 可從 `books.json` 載入資料
七、PROMPTS/phase2_platform.md
# Phase 2 - Happy eBook 平台功能版

請依照 `AGENTS.md` 規則，在 Phase 1 基礎上升級為平台功能版。

---

## 目標

加入：

- 會員系統
- 付費下載
- 作者後台
- 投稿審核流程

---

## 建議技術

- 前端：延續 HTML / CSS / JS
- 後端：Node.js + Express
- 資料庫：SQLite 或 PostgreSQL

---

## 新增功能

### 會員
- 註冊
- 登入
- 登出

### 作品
- 新增作品
- 編輯作品
- 刪除作品

### 購買
- 模擬購買
- 購買記錄

### 權限
- 免費書可直接下載
- 付費書限已購買者下載

### 作者後台
- 新增作品
- 查看我的作品
- 修改作品資料

---

## 建議新增檔案

- `login.html`
- `register.html`
- `dashboard.html`
- `my-books.html`

---

## 成功標準

- 可註冊 / 登入
- 可新增作品
- 可模擬購買
- 可控制下載權限
八、PROMPTS/phase3_business.md
# Phase 3 - Happy eBook 正式商業版

請依照 `AGENTS.md` 規則，在 Phase 2 基礎上升級成正式商業版平台。

---

## 目標

加入：

- 真實金流
- 完整後台
- 管理員審核
- 訂單系統
- 基本報表

---

## 建議技術

- 後端：Node.js + Express
- 資料庫：PostgreSQL
- 金流：Stripe Checkout
- 檔案儲存：S3 / Cloudflare R2

---

## 功能需求

### 金流
- 建立訂單
- 付款
- Webhook 更新訂單
- 開放下載權限

### 作者後台
- 作品管理
- 上傳封面
- 上傳 EPUB
- 查看銷售數
- 查看下載數

### 管理員後台
- 使用者管理
- 作品審核
- 訂單管理
- 報表查看

---

## 建議新增頁面

- `admin-dashboard.html`
- `admin-users.html`
- `admin-books.html`
- `admin-orders.html`
- `admin-reports.html`

---

## 成功標準

- 使用者可付款購買
- 作者可管理作品
- 管理員可審核與查看報表
九、docs/site-map.md
# Happy eBook 網站地圖

## 前台
- 首頁
- 書籍列表頁
- 單本作品頁
- 投稿頁
- 關於頁
- 聯絡頁

## 第二階段
- 登入頁
- 註冊頁
- 作者後台
- 我的作品

## 第三階段
- 管理員儀表板
- 使用者管理
- 作品管理
- 訂單管理
- 報表頁
十、docs/content-model.md
# Happy eBook 內容資料模型

## Book

- id
- title
- subtitle
- author
- category
- type
- format
- cover
- description
- downloadUrl
- buyUrl
- readUrl

## type 說明

- free：免費下載
- paid：付費購買
- web：網頁版閱讀
十一、docs/deployment-notes.md
# Happy eBook 部署筆記

## 快速上線建議

### 選項 1：Vercel
適合純前端靜態網站

### 選項 2：Netlify
適合純前端靜態網站

---

## 上線前檢查

- 所有頁面可正常連結
- books.json 可正常讀取
- 圖片路徑正確
- 手機版排版正常

---

## 自訂網域
建議上線後再綁定自訂網域。