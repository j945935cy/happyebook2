# 2026-11-27 網站內容更新

- 撤除 Google 圖書購買、試閱、下載及搜尋入口。平台價格與販售狀態不沿用到其他商店。
- 無其他入口的作品保留介紹，使用 catalog 型態；保留既有 Kobo 與自有閱讀資源。
- 原始資料、舊目錄及匯入腳本備份於專案之外的 archives/happyebook-google-books-20261127-123519。禁止加入發布檔案。
- Google 匯入命令現在直接結束，不會重新寫入入口。
- 更新作者頁、首頁、聯絡頁、推薦與聯盟揭露，擴充四篇教學與六本代表作導讀。
- 出版經歷採可查證的至少 2006 年紀錄，未使用未確認的總出版量。

## 可供複審閱讀的頁面

- /about.html：吳進北／Jack Wu／Happy eBook、出版紀錄與公開來源。
- /articles/：四篇原創教學與新增練習。
- /books/codex-cli-0bgsegaaqbaj.html：代表作介紹與延伸學習建議。
- /affiliate-disclosure.html：自有出版收入、商店連結與未來聯盟標示方式。
- /contact.html：作者聯絡方式。

## 驗證與限制

前次網站更新執行 validate-books、check-site、catalog-access 與同步資料測試，並解析本地連結；保留當時既有大型書封警告，未變更封面。
前次更新當時因環境限制未完成桌面與手機視覺驗收；本次 Kobo 匯入已以正式站瀏覽器驗收書目列表及單本頁購買連結。

## Kobo 書籍新增

- 依使用者核准的 128 本目標，排除 5 本已在站上的書，不重複新增；另有 8 本商品頁或版本尚待確認，未上架，也未判定下架。
- 新增 115 本，網站目錄共 121 本。每本使用本機封面、單本介紹頁與 Kobo 商品頁購買按鈕；Google Play Books 仍停用。
- 產生 115 個單本頁與網站地圖項目。GitHub Pages `main` 部署提交：`0250d73`。
- 驗證：`node scripts/check-site.js` 通過（121 本、0 errors、16 張大型圖片警告）；`node --test tests/catalog-access.test.js` 7/7 通過。
- 正式站 `books.html` 顯示 121 本；《Agent Skills 實戰手冊》單本頁的 Kobo 按鈕連到已確認的商品頁，封面成功載入。8 本待確認項目未上架。
