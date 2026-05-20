import urllib.request
import re
import json

url = 'https://www.googleapis.com/books/v1/volumes/HS3bEQAAQBAJ'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

result = {}
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        vol = data.get('volumeInfo', {})
        result['title'] = vol.get('title')
        result['subtitle'] = vol.get('subtitle')
        result['authors'] = vol.get('authors')
        result['publisher'] = vol.get('publisher')
        result['publishedDate'] = vol.get('publishedDate')
        result['description'] = vol.get('description')
        result['imageLinks'] = vol.get('imageLinks')
except Exception as e:
    result['error'] = str(e)

# Also try to scrape the book about page directly to see TW metadata
url_about = 'https://books.google.com.tw/books/about?id=HS3bEQAAQBAJ&redir_esc=y'
req_about = urllib.request.Request(
    url_about,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'zh-TW,zh;q=0.9'}
)
try:
    with urllib.request.urlopen(req_about) as response:
        html = response.read().decode('utf-8')
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        result['scraped_title'] = title_match.group(1) if title_match else None

        og_title = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        result['scraped_og_title'] = og_title.group(1) if og_title else None
except Exception as e:
    result['scraped_error'] = str(e)

with open('scratch/info.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=4, ensure_ascii=False)
print("Done writing to scratch/info.json")
