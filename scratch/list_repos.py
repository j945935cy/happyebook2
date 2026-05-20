import urllib.request
import json

url = "https://api.github.com/users/j945935cy/repos?per_page=100"
headers = {"User-Agent": "Mozilla/5.0"}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req) as response:
        repos = json.loads(response.read().decode('utf-8'))
        print("REPOS:")
        for r in repos:
            print(f" - {r['name']} (Default branch: {r['default_branch']})")
except Exception as e:
    print("Error:", e)
