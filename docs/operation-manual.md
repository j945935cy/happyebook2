# happyebook2 操作手冊

本手冊提供 Happy eBook 網站日常維護、內容上架、預覽檢查與上線流程。適用對象包含站台管理者、內容編輯、前端維護人員與接手專案的工程師。

## 1. 專案概覽

happyebook2 是一個靜態電子書平台，使用 HTML5、CSS3 與 Vanilla JavaScript 製作。網站目前以 `src/books.json` 作為書籍資料來源，前台頁面會讀取這份 JSON 並顯示書籍卡片、分類、標籤與閱讀按鈕。

主要用途：

- 展示 EPUB、PDF、網頁版電子書。
- 整理免費、付費與外部閱讀入口。
- 提供作者投稿與聯絡入口。
- 作為後續會員、作者後台與商業功能擴充基礎。

## 2. 重要目錄

```text
happyebook2/
├─ assets/          素材、圖片與書封
├─ docs/            專案文件與操作說明
├─ PROMPTS/         開發提示詞
├─ src/             前台頁面、樣式、JavaScript 與書籍資料
├─ AGENTS.md        專案開發規範
├─ index.html       根目錄轉址入口
└─ readme.md        專案總覽
```

日常最常使用的檔案：

- `src/books.json`：書籍資料。
- `src/index.html`：首頁。
- `src/books.html`：書籍列表頁。
- `src/book.html`：單本作品頁。
- `src/admin.html`：書籍資料輔助編輯頁。
- `src/styles.css`：全站樣式。
- `src/script.js`：前台互動功能。
- `src/admin.js`：管理頁互動功能。

## 3. 本機預覽

### 3.1 直接開啟

若只是快速查看畫面，可直接用瀏覽器開啟：

```text
src/index.html
```

部分瀏覽器可能會因本機檔案安全限制，導致 `books.json` 載入不穩。若遇到資料未顯示，請改用本機伺服器預覽。

### 3.2 使用本機伺服器

在專案根目錄執行：

```powershell
python -m http.server 8000
```

然後開啟：

```text
http://localhost:8000/src/
```

檢查重點：

- 首頁是否正常顯示精選作品。
- 書籍列表是否能切換分類與類型。
- 單本作品頁是否能透過 `book.html?id=作品ID` 開啟。
- 手機寬度下導覽列與卡片是否正常排列。

## 4. 書籍資料維護

### 4.1 資料來源

所有書籍資料集中於：

```text
src/books.json
```

每一本書是一個 JSON 物件。基本格式如下：

```json
{
  "id": "grammar-beginners-v2",
  "title": "國中英文文法入門",
  "subtitle": "42 章完整國中文法教材",
  "author": "Happy eBook 編輯部",
  "category": "英語學習",
  "type": "web",
  "format": "網站閱讀",
  "cover": "../assets/images/book-grammar-beginners.svg",
  "description": "完整收錄國中三年英文文法，適合學生循序學習與教師教學使用。",
  "downloadUrl": "",
  "buyUrl": "",
  "readUrl": "https://j945935cy.github.io/Grammar-for-Beginners-V2/",
  "featured": true,
  "popular": true,
  "priceLabel": "免費閱讀",
  "published": true
}
```

### 4.2 欄位說明

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `id` | 是 | 作品唯一代號，建議使用英文小寫、數字與連字號。 |
| `title` | 是 | 書名。 |
| `subtitle` | 否 | 副標題或補充說明。 |
| `author` | 是 | 作者或編輯單位。 |
| `category` | 是 | 分類名稱，例如「英語學習」、「證照學習」。 |
| `type` | 是 | 作品類型，可用 `web`、`free`、`paid`。 |
| `format` | 是 | 顯示格式，例如「網站閱讀」、「PDF」、「EPUB」。 |
| `cover` | 是 | 書封圖片路徑。 |
| `description` | 是 | 作品簡介。 |
| `downloadUrl` | 視情況 | 免費下載連結。 |
| `buyUrl` | 視情況 | 付費購買連結。 |
| `readUrl` | 視情況 | 網頁版閱讀或外部作品連結。 |
| `featured` | 否 | 是否顯示於首頁精選區。 |
| `popular` | 否 | 是否顯示於首頁熱門區。 |
| `priceLabel` | 否 | 按鈕或取得方式文字，例如「免費閱讀」、「前往書籍頁」。 |
| `published` | 否 | 是否公開顯示。未填時預設為公開。 |

### 4.3 類型設定

`type` 會影響前台標籤與主要按鈕：

- `web`：顯示「網頁版」，主要按鈕連到 `readUrl`。
- `free`：顯示「免費」，主要按鈕連到 `downloadUrl`。
- `paid`：顯示「付費」，主要按鈕連到 `buyUrl`。

### 4.4 新增作品

1. 開啟 `src/books.json`。
2. 複製既有作品物件作為範本。
3. 修改 `id`、書名、作者、分類、連結與說明。
4. 確認 JSON 陣列中的每個物件之間都有逗號。
5. 儲存後重新整理網站。

注意事項：

- `id` 不可與其他作品重複。
- 外部連結請使用完整網址，例如 `https://example.com/book`。
- 書封圖片建議放在 `assets/images/`。
- 不想公開的作品可設定 `"published": false`。

### 4.5 使用管理頁輔助編輯

管理頁位置：

```text
src/admin.html
```

管理頁用途：

- 新增作品資料。
- 編輯現有作品。
- 調整作品順序。
- 切換公開或隱藏。
- 複製或下載整理後的 `books.json`。

操作流程：

1. 用本機伺服器開啟 `src/admin.html`。
2. 在左側表單新增或編輯作品。
3. 右側確認作品清單與 JSON 輸出。
4. 點選「複製 JSON」或「下載 books.json」。
5. 將產生的內容貼回 `src/books.json`。
6. 重新整理前台頁面檢查結果。

提醒：管理頁目前是靜態輔助工具，不會自動寫回專案檔案。最後仍需手動更新 `src/books.json`。

## 5. 書封與素材管理

素材建議放在：

```text
assets/images/
```

書封建議：

- 使用 SVG、PNG 或 JPG。
- 檔名清楚，例如 `book-grammar-beginners.svg`。
- 書封比例保持一致，避免卡片高度差異過大。
- 圖片路徑從 `src/` 頁面出發，通常寫成 `../assets/images/檔名.svg`。

新增書封後請檢查：

- 圖片是否成功顯示。
- `<img>` 的 `alt` 是否能由書名組成合理替代文字。
- 手機版是否沒有裁切到重要文字。

## 6. 前台頁面操作

### 6.1 首頁

首頁會顯示：

- 精選作品：`featured` 為 `true` 的作品。
- 熱門作品：`popular` 為 `true` 的作品。

若作品沒有出現在首頁，請檢查：

- `published` 是否為 `false`。
- `featured` 或 `popular` 是否為 `true`。
- `books.json` 是否格式正確。

### 6.2 書籍列表頁

書籍列表頁會根據 `type` 與 `category` 篩選作品。

維護分類時請注意：

- 同一分類名稱要一致，例如不要同時使用「英文學習」與「英語學習」。
- 新增分類後，如頁面有固定分類按鈕，需同步更新 `src/books.html`。

### 6.3 單本作品頁

單本作品頁透過網址參數讀取作品：

```text
book.html?id=作品ID
```

範例：

```text
book.html?id=grammar-beginners-v2
```

若找不到指定作品，頁面會顯示資料中的第一本作品。上線前請確認每個卡片的「更多資訊」連結都能開啟正確作品。

### 6.4 投稿與聯絡頁

投稿頁與聯絡頁目前屬於靜態資訊頁。若要正式收件，可採用下列方式之一：

- 連到 Google 表單。
- 使用第三方表單服務。
- 後續串接自有後端 API。

正式上線前請確認：

- 投稿規則清楚。
- 聯絡信箱或表單連結正確。
- 使用者送出資料後知道後續處理方式。

## 7. 樣式與互動維護

### 7.1 樣式原則

所有主要樣式集中在：

```text
src/styles.css
```

維護原則：

- 優先使用既有元件樣式。
- 色彩盡量使用 CSS 變數。
- 不在 HTML 寫大量 inline style。
- 按鈕、卡片、標籤、表單欄位與 Footer 要維持一致。

### 7.2 JavaScript 原則

前台互動集中在：

```text
src/script.js
```

管理頁互動集中在：

```text
src/admin.js
```

維護原則：

- 不加入 jQuery 或大型 UI framework。
- 不把大量 JavaScript 寫在 HTML 內。
- 修改資料載入、篩選、手機選單時，要同時檢查首頁、列表頁與單本作品頁。

## 8. 上線前檢查清單

內容檢查：

- `src/books.json` 是合法 JSON。
- 每本書都有唯一 `id`。
- 書名、作者、分類與說明沒有錯字。
- 免費、付費、網頁版連結都能正常開啟。
- 未公開作品已設定 `"published": false`。

畫面檢查：

- 首頁、列表頁、單本作品頁、投稿頁、關於頁、聯絡頁都能開啟。
- 桌機、平板、手機版沒有爆版。
- 導覽列在手機版可正常展開。
- 書籍卡片按鈕可點擊。
- 圖片沒有破圖。

技術檢查：

- 沒有引入 React、Vue、Angular、Tailwind、Bootstrap 或 jQuery。
- 大量樣式仍集中在 `src/styles.css`。
- 大量互動仍集中在 `src/script.js` 或 `src/admin.js`。
- 根目錄 `index.html` 能導向或連到正確首頁。

## 9. 上線流程

### 9.1 GitHub Pages

適合此專案的靜態網站上線方式：

1. 確認所有修改已儲存。
2. 檢查 `src/` 頁面與 `assets/` 素材路徑。
3. 將變更提交到 Git。
4. 推送到 GitHub。
5. 到 GitHub Pages 設定分支與發布目錄。
6. 開啟正式網址檢查首頁與書籍頁。

### 9.2 Vercel 或 Netlify

若使用 Vercel 或 Netlify：

1. 匯入 GitHub repository。
2. 專案類型選擇靜態網站。
3. 若平台要求發布目錄，可設定為專案根目錄或依平台規則指定。
4. 上線後檢查 `src/index.html` 是否能正確進入網站。

## 10. 常見問題

### 10.1 書籍沒有顯示

請檢查：

- `books.json` 是否有語法錯誤。
- 是否用本機伺服器開啟，而不是直接用檔案路徑。
- 作品是否設定 `"published": false`。
- 瀏覽器開發者工具是否出現 `books.json` 載入錯誤。

### 10.2 書封破圖

請檢查：

- 圖片是否放在正確資料夾。
- `cover` 路徑是否從 `src/` 頁面出發。
- 檔名大小寫是否一致。

### 10.3 按鈕連到錯誤位置

請檢查：

- `type` 是否設定正確。
- `web` 作品是否有 `readUrl`。
- `free` 作品是否有 `downloadUrl`。
- `paid` 作品是否有 `buyUrl`。

### 10.4 分類篩選沒有出現新分類

請檢查：

- `books.json` 的 `category` 名稱是否一致。
- `src/books.html` 是否有固定分類按鈕需要同步新增。
- `src/script.js` 的篩選邏輯是否被修改過。

### 10.5 管理頁文字顯示亂碼

請確認檔案編碼為 UTF-8，並確認 HTML 有設定：

```html
<meta charset="UTF-8">
```

若只是在終端機查看檔案時亂碼，可能是終端機編碼問題；請用支援 UTF-8 的編輯器開啟確認。

## 11. 例行維護建議

每次新增或調整作品後：

1. 檢查 `books.json` 格式。
2. 開啟首頁確認精選與熱門區。
3. 開啟書籍列表測試篩選。
4. 開啟單本作品頁測試按鈕。
5. 使用手機寬度檢查導覽列與卡片。
6. 上線後再次用正式網址抽查主要頁面。

每月可做一次整理：

- 移除失效連結。
- 檢查書籍分類是否過於分散。
- 更新投稿說明與聯絡方式。
- 補齊缺少的書封與作品描述。
- 檢查文件是否仍符合實際操作流程。
