# happyebook2 部署筆記

## 快速上線建議

### 選項 1：Vercel

適合純前端靜態網站

### 選項 2：Netlify

適合純前端靜態網站

## 上線前檢查

- 所有頁面可正常連結
- `books.json` 可正常讀取
- 圖片路徑正確
- 手機版排版正常

## 自訂網域

建議上線後再綁定自訂網域。

## Google Play Books 書籍同步

- 用 `scripts/publish-google-account-books.js <manifest.json>` 匯入已開始販售或預購、且有 Google Books ID 的書籍。
- Google Play Publisher 標示「需要處理」的書籍不會匯入；確認狀態解除後再更新來源 manifest。
- 未確認幣別時不填網站定價，避免把 Google Play 的區域價格誤標成新台幣。
- 同步後執行 `node scripts/validate-books.js`、`node scripts/generate-sitemap.js` 及 `node scripts/check-site.js`。

## Kobo 購書連結

- `src/books.json` 的 `koboUrl` 應指向已驗證的 Kobo 商品頁；勿填入 Kobo Writing Life 後台網址。
- 新增 Kobo 連結時，同步更新該書 `books/<book-id>.html` 的 `src/script.js` 查詢版本，並在 `scripts/check-site.js` 設定對應覆寫，確保靜態詳情頁載入支援 Kobo 按鈕的版本。
- 執行 `node scripts/validate-books.js`、`node scripts/check-site.js`，並抽查正式站的購買連結。
