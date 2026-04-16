# happyebook2 作者投稿 Apps Script 操作指南

## 可直接貼上的完整程式

完整穩定版程式請使用：

- [author-submission-form.gs](/c:/happyebook2/docs/author-submission-form.gs)

這個版本已修正：

- `setShowProgressBar()` 改為 `setProgressBar()`
- 移除 Google Forms Apps Script 不支援的 `addFileUploadItem()`
- 附件欄位改為雲端分享連結，避免建立表單時報錯

## 建立流程

1. 打開 `https://script.google.com/`
2. 建立新專案
3. 將 [author-submission-form.gs](/c:/happyebook2/docs/author-submission-form.gs) 全部貼上
4. 儲存專案
5. 在函式下拉選單選 `createHappyebookAuthorSubmissionForm`
6. 按「執行」
7. 完成授權後再次執行
8. 到「執行記錄」查看：
   - 表單編輯網址
   - 表單填寫網址
   - 回覆試算表網址

## 測試流程

1. 用表單填寫網址送出一筆測試資料
2. 打開回覆試算表，確認 `表單回覆` 有新增原始資料
3. 確認 `投稿管理` 有新增一筆資料，欄位應包含：
   - 投稿編號，例如 `HB-20260416-001`
   - 審核狀態：`待審核`
   - 最近通知類型：`投稿確認信`
4. 確認作者信箱有收到投稿確認信
5. 確認管理者信箱有收到新投稿通知

## 常用管理函式

先到 Apps Script 編輯器，在上方函式名稱改成你要執行的函式，再按「執行」。

### 設定管理通知信箱

```javascript
setAdminNotificationEmails("you@example.com,editor@example.com")
```

### 重建表單送出觸發器

```javascript
reinstallAuthorSubmissionTrigger()
```

### 將投稿標記為審核中

```javascript
markSubmissionUnderReview(
  "HB-20260416-001",
  "王小明",
  "已開始初步審核，確認作品定位與附件內容。"
)
```

### 發送補件通知

```javascript
requestSubmissionRevision(
  "HB-20260416-001",
  "請補上作品目錄、作者介紹，並確認樣章連結已開啟檢視權限。",
  "2026/04/30",
  "王小明"
)
```

### 發送通過通知

```javascript
approveSubmission(
  "HB-20260416-001",
  "內容方向符合平台規劃，將由編輯團隊與您聯繫後續上架細節。",
  "王小明"
)
```

### 發送未通過通知

```javascript
rejectSubmission(
  "HB-20260416-001",
  "本次內容與目前平台規劃方向較不一致，暫不安排上架。",
  "王小明"
)
```

### 移到後續洽談中

```javascript
moveSubmissionToDiscussion(
  "HB-20260416-001",
  "已安排進一步討論授權與上架方案。",
  "王小明"
)
```

### 重寄投稿確認信

```javascript
resendReceiptEmail("HB-20260416-001")
```

## 建議操作順序

1. 投稿送出後，先在 `投稿管理` 查看投稿編號
2. 執行 `markSubmissionUnderReview()`
3. 視情況執行下列其中一個：
   - `requestSubmissionRevision()`
   - `approveSubmission()`
   - `rejectSubmission()`
4. 若已進入合作階段，再執行 `moveSubmissionToDiscussion()`

## 注意事項

- 這份版本的附件欄位為「連結提交」，不是 Google 表單原生檔案上傳
- 若要多人收管理通知，請先執行 `setAdminNotificationEmails()`
- 若你複製腳本到新的 Apps Script 專案，需重新執行 `createHappyebookAuthorSubmissionForm()`
- 若表單或觸發器被改動，可執行 `reinstallAuthorSubmissionTrigger()`
