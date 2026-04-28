# happyebook2

happyebook2 是一個以內容展示為核心的電子書平台網站，用來整理、展示與導流多種電子書作品。

平台內容包含：

- EPUB / PDF 電子書
- 網頁版電子書
- 免費閱讀內容
- 付費或試閱內容
- 作者投稿作品

網站風格以教學平台、數位書櫃、簡潔易讀為主，不走花俏商城路線。

## 技術架構

本專案使用純前端靜態網站架構：

- HTML5
- CSS3
- Vanilla JavaScript
- JSON 作為書籍資料來源

不使用：

- React
- Vue
- Angular
- Tailwind
- Bootstrap
- jQuery
- 外部大型 UI framework

## 專案結構

```text
happyebook2/
├─ assets/                  # 圖片與書封素材
│  └─ images/
├─ docs/                    # 專案文件
├─ PROMPTS/                 # 階段提示詞與規劃提示
├─ src/                     # 主要網站前端檔案
│  ├─ index.html            # 首頁
│  ├─ books.html            # 書籍列表
│  ├─ book.html             # 單本作品頁
│  ├─ submit.html           # 投稿頁
│  ├─ about.html            # 關於頁
│  ├─ contact.html          # 聯絡頁
│  ├─ admin.html            # 管理頁
│  ├─ books.json            # 書籍資料
│  ├─ script.js             # 前台互動
│  ├─ admin.js              # 管理頁互動
│  └─ styles.css            # 全站樣式
├─ AGENTS.md                # Codex 專案規則
├─ CNAME                    # GitHub Pages 自訂網域
├─ index.html               # 根目錄導向頁
└─ readme.md
```

## 主要功能

- 書籍列表展示
- 依內容型態篩選：全部、免費、付費、網頁版
- 依 `books.json` 自動產生分類篩選按鈕
- 書籍卡片顯示書封、書名、副標、作者、格式、標籤與簡介
- 單本作品詳細頁
- Google 表單投稿入口
- 聯絡表單與 mailto 備援
- 手機版導覽選單
- 響應式書籍卡片排版

## 書籍資料

主要資料來源：

```text
src/books.json
```

每本書常見欄位：

```json
{
  "id": "book-id",
  "title": "書名",
  "subtitle": "副標",
  "author": "作者",
  "category": "分類",
  "type": "web",
  "format": "網站閱讀",
  "cover": "../assets/images/book-cover.svg",
  "description": "作品簡介",
  "downloadUrl": "",
  "buyUrl": "",
  "readUrl": "https://example.com",
  "featured": true,
  "popular": true,
  "priceLabel": "免費閱讀"
}
```

`category` 可使用字串或陣列：

```json
"category": ["前端設計", "程式設計"]
```

## 本機預覽

建議從專案根目錄啟動靜態伺服器，讓 `src/` 頁面可以正確讀取 `../assets/images/...` 書封路徑。

```powershell
python -m http.server 8090 --bind 127.0.0.1 --directory C:\happyebook2
```

開啟：

```text
http://127.0.0.1:8090/src/index.html
http://127.0.0.1:8090/src/books.html
```

如果書封出現破圖，通常是伺服器根目錄開錯。不要只用 `C:\happyebook2\src` 當根目錄，請使用 `C:\happyebook2`。

## 常用指令

查看 Git 狀態：

```powershell
git -C C:\happyebook2 status --short --branch
```

查看最近提交：

```powershell
git -C C:\happyebook2 log --oneline --decorate --max-count=10
```

查看修改摘要：

```powershell
git -C C:\happyebook2 diff --stat
```

檢查 JavaScript 語法：

```powershell
node --check C:\happyebook2\src\script.js
```

推送到 GitHub：

```powershell
git -C C:\happyebook2 push origin main
```

## 部署

目前專案可用 GitHub Pages 部署。

重要檔案：

- `.nojekyll`：避免 GitHub Pages 套用 Jekyll 處理
- `CNAME`：自訂網域設定
- 根目錄 `index.html`：導向主要網站頁面

## 開發規範

- 所有主要前端檔案放在 `src/`
- 所有樣式集中在 `src/styles.css`
- 所有前台互動集中在 `src/script.js`
- 書籍資料以 `src/books.json` 為主
- 文案使用繁體中文與台灣用語
- 圖片需有 `alt`
- 表單欄位需有 `label`
- 保持介面簡潔、明亮、易讀

## Codex Skill

本專案已建立常用指令 skill：

```text
happyebook2-commands
```

可用於：

- 查詢 Git 狀態
- 整理提交紀錄
- 啟動本機測試頁
- 檢查封面破圖
- 執行前端驗證
- 推送 GitHub

## 相關文件

- `AGENTS.md`：專案開發規則
- `docs/operation-manual.md`：網站操作手冊
- `docs/content-model.md`：內容資料模型
- `docs/site-map.md`：網站地圖
- `docs/deployment-notes.md`：部署筆記
- `docs/design-system.md`：設計系統

## 後續規劃

- 強化首頁平台介紹與精選書區塊
- 增加單本作品推薦
- 補強 SEO 與社群分享 meta
- 改善投稿審核流程
- 規劃正式後台與內容管理流程

## 授權

此專案作為 happyebook2 電子書平台開發基礎使用。

