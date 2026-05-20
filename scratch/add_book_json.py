import json

path = r"E:\happyebook2\src\books.json"

with open(path, 'r', encoding='utf-8') as f:
    books = json.load(f)

# Define new book
new_book = {
    "id": "word-vba-examples",
    "title": "Word VBA 實例演習：給初學者的 Word 文件自動化練習書",
    "subtitle": "給初學者的 Word 文件自動化練習書",
    "author": "Happy eBook",
    "category": [
        "程式設計",
        "VBA"
    ],
    "type": "paid",
    "format": "Google Play Books 電子書",
    "cover": "https://books.google.com.tw/books/publisher/content?id=HS3bEQAAQBAJ&printsec=frontcover&img=1&zoom=1",
    "description": "《Word VBA 實例演習》是一本為 Word 使用者設計的 VBA 入門實作書。它不要求讀者先學完程式語法，而是從看得見的 Word 工作開始：插入文字、錄製巨集、整理格式、批次尋找取代、建立表格、產生會議紀錄範本、從 Excel 名單產生 Word 通知單，最後做出版前文件檢查。本書特別適合會使用 Word，但第一次接觸 VBA 的讀者。每章都先說明要完成的文件任務，再提供實作步驟、完整程式碼、程式碼解說、人工檢查點，以及新手可能卡住的地方。讀者可以先做出成果，再逐步理解 `Sub`、`Selection`、`ActiveDocument`、`Range`、`Find`、`Tables`、`Dir` 與 Excel Automation 等概念。第 1 到第 3 章帶讀者建立第一個巨集、理解錄製巨集產生的程式碼，並完成一鍵套用文件基本格式。這幾章的重點是熟悉 `.docm`、VBA 編輯器、模組與巨集安全設定。第 4 到第 7 章開始處理常見文件維護任務，包括批次尋找與取代、自動插入文件資訊與頁碼、建立會議紀錄範本，以及產生 Word 表格檢查清單。每章都提醒讀者先使用練習副本，避免在正式文件上直接測試。第 8 到第 10 章進入較完整的自動化流程：批次處理資料夾裡的多份 Word 文件、從 Excel 名單產生 Word 通知單，以及建立出版前文件檢查小工具。這些章節強調自動化可以節省重複工作，但不會取代人的最後閱讀與判斷。附錄提供 VBA 初學者速查表與常見錯誤排除方式，協助讀者在遇到路徑、引號、巨集安全性、選取範圍、表格座標或 Excel 未關閉等問題時，能先縮小範圍再處理。",
    "downloadUrl": "",
    "buyUrl": "https://books.google.com.tw/books/about?id=HS3bEQAAQBAJ&redir_esc=y",
    "readUrl": "https://books.google.com.tw/books/about?id=HS3bEQAAQBAJ&redir_esc=y",
    "featured": True,
    "popular": True,
    "priceLabel": "NT$118，提供試閱版"
}

# Check if book already exists to avoid duplicates
if not any(b['id'] == new_book['id'] for b in books):
    books.append(new_book)
    print("Appended new book entry.")
else:
    print("Book already exists in JSON.")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(books, f, indent=4, ensure_ascii=False)
print("Finished writing books.json.")
