import urllib.request
import os

cover_url = "https://books.google.com.tw/books/publisher/content?id=HS3bEQAAQBAJ&printsec=frontcover&img=1&zoom=1"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

dest_1 = r"E:\happyebook2\assets\images\word-vba-examples-cover.png"
dest_2 = r"E:\happyebook2\assets\images\google-book-cover-images\happyebook2_assets_images_word-vba-examples-cover.png"

# Ensure directories exist
os.makedirs(os.path.dirname(dest_1), exist_ok=True)
os.makedirs(os.path.dirname(dest_2), exist_ok=True)

try:
    req = urllib.request.Request(cover_url, headers=headers)
    with urllib.request.urlopen(req) as response, open(dest_1, 'wb') as out_file:
        out_file.write(response.read())
    print("Successfully downloaded to dest_1")

    # Also copy to dest_2
    with open(dest_1, 'rb') as src_file, open(dest_2, 'wb') as dst_file:
        dst_file.write(src_file.read())
    print("Successfully copied to dest_2")
except Exception as e:
    print("Error downloading cover:", e)
