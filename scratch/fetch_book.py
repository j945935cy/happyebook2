import urllib.request
import re

url = 'https://books.google.com.tw/books/about?id=HS3bEQAAQBAJ&redir_esc=y'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

        # Look for og:title or title tag
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        og_title = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        og_desc = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        og_image = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)

        print("HTML_TITLE:", title_match.group(1) if title_match else "None")
        print("OG_TITLE:", og_title.group(1) if og_title else "None")
        print("OG_DESC:", og_desc.group(1) if og_desc else "None")
        print("OG_IMAGE:", og_image.group(1) if og_image else "None")

        # Let's print out the first 1000 characters of head to inspect
        head_match = re.search(r'<head>(.*?)</head>', html, re.DOTALL | re.IGNORECASE)
        if head_match:
            print("HEAD_CONTENT:")
            print(head_match.group(1)[:1500])
except Exception as e:
    print("ERROR:", e)
