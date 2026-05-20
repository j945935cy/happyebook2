import urllib.request
import json
import os

with open('scratch/scraped_details.json', 'r', encoding='utf-8') as f:
    details = json.load(f)

img_url_scraped = details.get('cover')
img_url_zoom2 = "https://books.google.com.tw/books/publisher/content?id=HS3bEQAAQBAJ&printsec=frontcover&img=1&zoom=2"
img_url_zoom3 = "https://books.google.com.tw/books/publisher/content?id=HS3bEQAAQBAJ&printsec=frontcover&img=1&zoom=3"

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def try_download(url, name):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            print(f"URL: {name}, Size: {len(data)}")
            return data
    except Exception as e:
        print(f"Error {name}: {e}")
        return None

d_scraped = try_download(img_url_scraped, "scraped")
d_zoom2 = try_download(img_url_zoom2, "zoom2")
d_zoom3 = try_download(img_url_zoom3, "zoom3")

# We want the largest one!
best_data = None
best_name = ""
for data, name in [(d_zoom3, "zoom3"), (d_zoom2, "zoom2"), (d_scraped, "scraped")]:
    if data and len(data) > 10000:
        best_data = data
        best_name = name
        break
else:
    # Fallback to whatever we got
    for data, name in [(d_zoom2, "zoom2"), (d_scraped, "scraped")]:
        if data:
            best_data = data
            best_name = name
            break

if best_data:
    dest_1 = r"E:\happyebook2\assets\images\word-vba-examples-cover.png"
    dest_2 = r"E:\happyebook2\assets\images\google-book-cover-images\happyebook2_assets_images_word-vba-examples-cover.png"

    with open(dest_1, 'wb') as f:
        f.write(best_data)
    with open(dest_2, 'wb') as f:
        f.write(best_data)
    print(f"Saved the best cover from {best_name} with size {len(best_data)}")
else:
    print("Could not find any better cover image.")
