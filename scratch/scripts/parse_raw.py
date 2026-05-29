import re

with open('scratch/data/raw_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's search for "Happy eBook" or names
# Google Books pages often list "作者", "出版商", "ISBN", etc.
# We can search for tables or lists containing metadata
# For example, look at strings of interest
matches = re.findall(r'href=[^>]*q=inauthor:[^>]*>(.*?)</a>', html, re.IGNORECASE)
print("AUTHORS_FROM_URLS:", matches)

matches_publisher = re.findall(r'href=[^>]*q=inpublisher:[^>]*>(.*?)</a>', html, re.IGNORECASE)
print("PUBLISHERS_FROM_URLS:", matches_publisher)

# Search for any span or div with "頁數" or "出版" or "ISBN"
meta_list = re.findall(r'<div>([^<]*?(?:頁數|出版|ISBN|價格|分類)[^<]*?)</div>', html, re.IGNORECASE)
print("METADATA_LINES:", meta_list[:20])

# Let's search for some patterns in the entire text
for line in html.split('\n'):
    if 'Happy eBook' in line or 'VBA' in line:
        if len(line) < 200:
            print("LINE:", line.strip())
