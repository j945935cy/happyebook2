# Phase 3 - happyebook2 正式商業版

請依照 `AGENTS.md` 規則，在 Phase 2 基礎上升級成正式商業版平台。

## 目標

加入：

- 真實金流
- 完整後台
- 管理員審核
- 訂單系統
- 基本報表

## 建議技術

- 後端：Node.js + Express
- 資料庫：PostgreSQL
- 金流：Stripe Checkout
- 檔案儲存：S3 / Cloudflare R2

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

## 建議新增頁面

- `admin-dashboard.html`
- `admin-users.html`
- `admin-books.html`
- `admin-orders.html`
- `admin-reports.html`

## 成功標準

- 使用者可付款購買
- 作者可管理作品
- 管理員可審核與查看報表
