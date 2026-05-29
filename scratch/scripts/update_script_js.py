path = r"E:\happyebook2\src\script.js"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '  "windows-aicoding": ["Windows-AICoding_google ebook cover.png"]'
replacement = '  "word-vba-examples": ["happyebook2_assets_images_word-vba-examples-cover.png"],\n  "windows-aicoding": ["Windows-AICoding_google ebook cover.png"]'

if target in content and 'word-vba-examples' not in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated src/script.js")
else:
    print("Target not found or already updated in src/script.js")
