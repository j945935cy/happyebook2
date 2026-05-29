# 出版狀態與待決事項

書名：用 Codex 做出 10 個小作品

副標：2 本故事書與 8 個網頁遊戲實作入門

出版目標：Google Books / Google Play Books EPUB

## 目前完成狀態

- 已完成書稿來源：`manuscript.md`
- 已完成 Google Books 上架文案：`google_books_copy.md`
- 已完成 Google Books metadata 草表：`google_books_metadata.md`
- 已完成 Google Books metadata CSV：`google_books_metadata.csv`
- 已完成 12 章書稿骨架
- 已完成 2 本故事書章節
- 已完成 8 個小遊戲章節
- 已完成封面、EPUB 與 Google Books 上傳資料夾
- 已完成 Google Books 上架
- 已加入 Happy eBook 網站書籍列表與單本介紹頁
- 已加入 `.gitignore`，避免 EPUB、PDF、上傳包被推到 GitHub

## 本機輸出成品

以下輸出成品已產生，但保留在本機，不推到 GitHub：

- Google Books 上傳包
- EPUB
- 高解析封面 PNG / JPG
- Threads 文案與文宣圖

## Google Books 待決欄位

| 欄位 | 目前狀態 | 建議處理 |
| --- | --- | --- |
| Author | Happy eBook | 已決定 |
| ISBN or identifier | Google Books ID: UK3eEQAAQBAJ | 已上架 |
| Suggested price | Google Books 顯示 NT$158 | 已上架 |
| Sales territories | 依 Google Play Books 後台設定 | 後台確認 |
| DRM | 依 Google Play Books 後台設定 | 後台確認 |
| Preview percentage | 依 Google Play Books 後台設定 | 後台確認 |

## 建議的 Google Books 設定草案

以下不是最終設定，只是方便後續決策：

```text
Author: Happy eBook
Publisher: Happy eBook
Language: zh-Hant
Book type: EPUB ebook
Identifier: Google-generated GGKEY
Primary category: Computers / Programming / General
Secondary category: Education / Computers & Technology
Preview percentage: 20% 或 30%
DRM: TBD
Sales territories: Worldwide
```

## 正式輸出前檢查

更新 EPUB 或封面前，請確認：

```text
作者名稱已決定：Happy eBook。
封面標題、副標、作者名稱一致。
書稿沒有 TODO、draft、internal、QA、測試、草稿、未完成、開發中等不適合公開上架的字樣。
metadata 不再有非必要的 TBD。
章節標題從第 1 章到第 12 章完整。
每個小作品的線上連結正確。
Google Books copy 沒有誇大承諾。
```

## EPUB 不推 GitHub 規則

已在 `.gitignore` 設定：

```text
publication/**/output/
publication/**/google_books_upload/
*.epub
*.pdf
```

後續若產生以下檔案，請保留在本機：

```text
publication/codex-mini-projects-book/output/
publication/codex-mini-projects-book/google_books_upload/
```

## 下一步

1. 若 Google Books 後台顯示封面或 EPUB 錯誤，先在本機修正輸出包。
2. 若書籍資訊有變動，同步更新 `src/books.json` 與單本介紹頁。
3. 推 GitHub 時只推網站與書稿來源，不推 `google_books_upload/`。
