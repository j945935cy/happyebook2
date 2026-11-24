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
