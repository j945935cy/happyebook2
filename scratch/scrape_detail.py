import urllib.request
import re
import html
import json

url = 'https://books.google.com.tw/books/about?id=HS3bEQAAQBAJ&redir_esc=y'
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
    }
)

result = {}
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')

        # Save raw HTML to debug if needed
        with open('scratch/raw_page.html', 'w', encoding='utf-8') as f:
            f.write(content)

        # Parse og elements
        og_title = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)
        og_desc = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)
        og_image = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)

        result['title'] = html.unescape(og_title.group(1)) if og_title else None
        result['description'] = html.unescape(og_desc.group(1)) if og_desc else None
        result['cover'] = html.unescape(og_image.group(1)) if og_image else None

        # Look for other metadata like Author, Categories, Publisher
        # Google Books pages often have meta name="description" or specific fields
        meta_desc = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)
        if meta_desc and not result['description']:
            result['description'] = html.unescape(meta_desc.group(1))

        # Try to find author and publisher from HTML text
        # Typically looks like: "Word VBA 撖虫?瞍?: 蝯血?摮貉? Word ?辣?芸??毀蝧. ??. Happy eBook."
        # Or let's search for specific metadata div patterns
        # Let's extract script elements that might have JSON-LD!
        # Schema.org JSON-LD is very common in Google Books
        json_ld_matches = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
        result['json_ld'] = []
        for jld in json_ld_matches:
            try:
                parsed = json.loads(jld.strip())
                result['json_ld'].append(parsed)
                # If it's a Book schema, we can extract details directly!
                if parsed.get('@type') == 'Book' or 'Book' in parsed.get('@type', []):
                    result['title'] = parsed.get('name', result['title'])
                    result['description'] = parsed.get('description', result['description'])
                    result['cover'] = parsed.get('image', result['cover'])

                    author = parsed.get('author')
                    if isinstance(author, dict):
                        result['author'] = author.get('name')
                    elif isinstance(author, list):
                        result['author'] = ', '.join([a.get('name') if isinstance(a, dict) else a for a in author])
                    else:
                        result['author'] = author

                    publisher = parsed.get('publisher')
                    if isinstance(publisher, dict):
                        result['publisher'] = publisher.get('name')
                    else:
                        result['publisher'] = publisher

                    result['genre'] = parsed.get('genre')

                    offers = parsed.get('offers')
                    if isinstance(offers, dict):
                        result['price'] = offers.get('price')
                        result['priceCurrency'] = offers.get('priceCurrency')
            except Exception as ex:
                print("JSON-LD parse error:", ex)

except Exception as e:
    result['error'] = str(e)

with open('scratch/scraped_details.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=4, ensure_ascii=False)
print("Finished scraping details.")
