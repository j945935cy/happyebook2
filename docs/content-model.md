# happyebook2 內容資料模型

## Book

- `id`
- `title`
- `subtitle`
- `author`
- `category`
- `type`
- `format`
- `cover`
- `description`
- `downloadUrl`
- `buyUrl`
- `readUrl`

## type 說明

- `web`：站內或自家網頁作品，前台顯示為「免費版」
- `google-books`：Google Play Books 或 Google 圖書頁，前台顯示為「提供試讀」
- `other`：其他外部來源或整理入口，前台不顯示型態標籤

## 顯示規則

- `type=web`：卡片顯示「免費版」，主要按鈕通常連到 `readUrl`
- `type=google-books`：卡片顯示「提供試讀」，主要按鈕顯示「查看試讀」
- `type=other`：卡片不顯示型態標籤，主要按鈕依連結欄位決定

## 備註

- `priceLabel` 用來表示取得方式或補充說明，例如「免費閱讀」、「提供試讀」、「NT$84，提供試讀」
- `type` 現在代表來源分類，不再用來表示免費或付費狀態
