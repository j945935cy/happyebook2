# AGENTS.md

## 專案名稱

Happy eBook

## 專案定位

Happy eBook 是一個以「AI 時代學習與數位出版」為核心的電子書與教學內容平台。

網站重點不是單純展示書籍，而是建立一個能讓學生、教師、自學者快速進入 AI、程式設計、英文學習與數位出版領域的知識品牌。

## 主要任務

當你協助維護本專案時，請優先遵守以下原則：

1. 保持網站簡潔、高質感、容易閱讀。
2. 優先支援 GitHub Pages 靜態部署。
3. 優先使用 HTML、CSS、Vanilla JS。
4. 不要引入 React、Vue、Next.js 等重型框架。
5. 不要讓網站變得過度複雜。
6. 不要加入需要後端伺服器才能運作的功能。
7. 所有功能應盡量能在純靜態環境執行。
8. 修改前先理解現有檔案結構。
9. 修改後請確認首頁、書籍頁、關於頁、手機版都能正常顯示。
10. 優先改善使用者閱讀體驗，而不是加入炫技效果。

## 技術規範

請使用：

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages compatible static files

避免使用：

- React
- Vue
- Angular
- Next.js
- Nuxt
- Svelte
- Tailwind CDN
- Bootstrap CDN
- 需要 build step 的工具

除非使用者明確要求，否則不要新增複雜打包工具。

## 網站核心頁面

建議維持以下頁面：

- index.html
- books.html
- book.html
- about.html
- contact.html

建議維持以下資料夾：

- assets/css/
- assets/js/
- assets/images/
- assets/books/
- assets/icons/

## 品牌關鍵字

網站內容與文案應圍繞以下主題：

- AI 學習
- Python
- iPAS AI
- Prompt Engineering
- GitHub
- Vibe Coding
- 英文學習
- 數位出版
- 電子書
- 自學
- 教師教學
- 白話教學
- AI 工具應用

## 內容語氣

網站文案應該：

- 白話
- 清楚
- 友善
- 專業但不艱深
- 適合初學者
- 有教學感
- 避免誇大
- 避免過度行銷
- 避免空泛口號

## UI 原則

整體設計請接近：

- Apple-like
- Notion-like
- Medium-like
- GitBook-like

設計重點：

- 大留白
- 清楚層級
- 卡片式資訊
- 淡色背景
- 深色文字
- 淡藍或淡紫點綴
- 輕微陰影
- 柔和圓角
- 手機版優先可讀性

## SEO 原則

每個主要頁面都應具備：

- title
- meta description
- canonical
- Open Graph
- Twitter Card
- 合理的 h1、h2、h3 結構

首頁建議 title：

Happy eBook｜AI、Python、iPAS AI、電子書學習平台

首頁建議 description：

Happy eBook 提供 AI、Python、iPAS AI、Prompt Engineering、英文學習與數位出版教材，適合學生、教師與自學者。

## 圖片規範

圖片請注意：

- 使用相對路徑
- 加上 alt 文字
- 優先使用 webp 或壓縮後圖片
- 書籍封面請保持比例一致
- 首頁圖片避免過大
- 使用 loading="lazy"

## JavaScript 原則

JavaScript 只用於：

- 書籍篩選
- 搜尋
- 導覽列互動
- 輕量動畫
- 回到頂部按鈕
- 卡片資料渲染

避免：

- 過度動畫
- 複雜狀態管理
- 外部依賴過多
- 造成首頁載入變慢

## 修改流程

每次修改請優先檢查：

1. 是否破壞手機版？
2. 是否破壞 GitHub Pages 路徑？
3. 是否造成圖片失效？
4. 是否造成 CSS class 名稱不一致？
5. 是否讓首頁載入變慢？
6. 是否讓文案變得太行銷或太空泛？
7. 是否保留品牌定位？

## 禁止事項

請不要：

- 隨意刪除既有內容
- 使用不必要的框架
- 加入需要後端的功能
- 讓網站依賴不穩定 CDN
- 使用過多動畫
- 使用過多漸層
- 使用看起來廉價的陰影
- 把首頁做成普通賣書頁
- 把品牌文案寫得像詐騙廣告
- 使用簡體中文
- 使用 emoji

## 最終目標

讓 Happy eBook 成為一個清楚、可信任、好閱讀的繁體中文學習品牌網站。

核心印象應該是：

「用白話、實作、電子書，幫助更多人進入 AI 時代。」