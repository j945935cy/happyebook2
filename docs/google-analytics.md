# Google Analytics 4

Happy eBook 使用 GA4 評估 ID：

```text
G-YQTPYTCR01
```

## 載入方式

所有 sitemap 公開頁面及 `404.html` 都會載入 `src/analytics.js`。追蹤程式只在以下正式網域啟用：

- `happyebook.com`
- `www.happyebook.com`

localhost、`file://` 與其他預覽網域不會送出資料，避免污染正式報表。

## 自訂事件

| 事件 | 用途 |
|---|---|
| `view_book` | 開啟單本書籍頁 |
| `route_click` | 點擊首頁或路線頁的主要學習入口 |
| `outbound_store_click` | 前往 Google Books、Google Play 或博客來 |
| `resource_open` | 開啟 iPAS AI 考前複習表 |
| `lead_submit` | 送出免費資源申請表 |
| `contact_submit` | 送出聯絡表單 |

自訂事件不傳送訪客輸入的姓名、email 或訊息內容。

## GA4 後台設定建議

部署完成並收到事件後，可在 GA4 將下列事件標記為重要事件：

- `outbound_store_click`
- `lead_submit`
- `contact_submit`

## 驗證

1. 部署正式網站。
2. 使用 Google Tag Assistant 連線 `https://happyebook.com/`。
3. 確認偵測到 `G-YQTPYTCR01`。
4. 在 GA4 即時報表檢查 `page_view` 與自訂事件。
5. 執行 `node scripts/check-site.js`，確認所有公開頁面都有 GA4 loader。
