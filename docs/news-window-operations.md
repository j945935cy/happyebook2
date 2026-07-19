# 首頁 News 視窗維護

首頁從 `src/news.json` 讀取四類消息。所有外部排行必須保留來源及更新日期；沒有可核對資料時保持空白，不以猜測資料補位。

## Happy eBook 近 30 天排行

Google Play 圖書合作夥伴中心需要私人帳戶登入，登入 Cookie、完整交易資料與營收不得提交到 Git。

1. 登入 [Google Play 圖書合作夥伴中心](https://play.google.com/books/publish/a/2794518778470444475#analytics)。
2. 前往「報表」的「自訂報表」。
3. 選擇「Google Play 銷售摘要報表」，日期設為最近 30 天。
4. 匯出定位字元分隔的 CSV，存到 `reports/google-play/`。
5. 執行：

   ```bash
   python3 tools/update_google_play_ranking.py reports/google-play/report.csv --start 2026-06-19 --end 2026-07-19
   ```

工具按 `Net Units Sold` 加總並更新 `src/news.json`，不會輸出銷售數量、營收或國家明細。報表目錄已加入 `.gitignore`。

Google 官方目前提供登入後匯出報表，未提供適合 GitHub Pages 直接讀取的公開端點。為避免把 Google 登入 Cookie 放入自動化服務，目前只自動處理下載後的報表；報表下載仍由帳戶持有人在後台確認。

## 其他分類

- 今日 AI 消息：優先使用模型公司、研究機構或產品官方公告。
- 博客來與天瓏：只填入來源頁面當下可核對的電腦書前五名。
- 每次更新同步修改分類的 `updatedAt`；連結使用來源或商品原頁。
