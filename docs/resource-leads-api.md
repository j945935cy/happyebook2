# Happy eBook 資源申請 API

`free-resources.html` 的 iPAS AI 資源申請表會送到：

```text
/api/resource-leads
```

此 API 使用 Vercel Serverless Function，將資料追加到 Google Sheets。

## Google Sheet 欄位

工作表名稱預設為 `resource_leads`，請先建立第一列欄位：

```text
createdAt | name | email | resource | page | referer | userAgent
```

## Vercel 環境變數

在 Vercel Project Settings 設定：

```text
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_SHEET_ID
GOOGLE_SHEET_NAME
```

`GOOGLE_SHEET_NAME` 可省略，預設使用 `resource_leads`。

`GOOGLE_PRIVATE_KEY` 可以直接貼 service account JSON 裡的 private key，保留 `\n` 也可以，API 會轉成換行。

## 權限

把 Google Sheet 分享給 service account email，權限至少要能編輯。

## 前端行為

表單送出成功後會轉向：

```text
ipas-ai-7-day-review.html
```

若 API 未部署或 Google Sheets 環境變數未設定，表單會顯示錯誤，不會假裝已保存。
