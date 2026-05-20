import os
import urllib.request
import urllib.error
import urllib.parse
import json
import time
import subprocess

# Directory to save the covers
TARGET_DIR = r"E:\happyebook2\assets\images\google-book-cover-images"
os.makedirs(TARGET_DIR, exist_ok=True)

# Github User
USER = "j945935cy"

# Headers to avoid some blocks, and to supply authentication token if available
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/vnd.github.v3+json"
}

# Try to get GitHub Token via 'gh auth token'
try:
    token_proc = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, check=True)
    token = token_proc.stdout.strip()
    if token:
        headers["Authorization"] = f"token {token}"
        print("Successfully obtained and applied GitHub token via 'gh auth token'.")
except Exception as e:
    print("Could not obtain GitHub token from 'gh auth token'. Continuing with unauthenticated requests.")

def make_request(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error for {url}: {e.code} {e.reason}")
        if e.code == 403:
            print("Rate limit exceeded or forbidden. Details:")
            print(e.read().decode('utf-8', errors='ignore'))
        return None
    except Exception as e:
        print(f"Error requesting {url}: {e}")
        return None

def download_file(url, dest_path):
    print(f"Downloading {url} to {dest_path}...")
    req_headers = {"User-Agent": "Mozilla/5.0"}
    if "Authorization" in headers:
        # Use auth header if available, though raw.githubusercontent doesn't strictly need it unless private.
        # But wait, raw.githubusercontent doesn't accept the token in Authorization for public repos or it works differently.
        # So we can try without auth first or keep it simple. Public raw images can be fetched without authentication.
        pass
        
    req = urllib.request.Request(url, headers=req_headers)
    try:
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Successfully downloaded {os.path.basename(dest_path)}")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def main():
    print("Fetching repositories...")
    repos_url = f"https://api.github.com/users/{USER}/repos?per_page=100"
    repos = make_request(repos_url)
    if not repos:
        print("Could not retrieve repositories list.")
        return

    print(f"Found {len(repos)} repositories.")
    
    downloaded_count = 0
    
    for repo in repos:
        repo_name = repo['name']
        default_branch = repo['default_branch']
        print(f"\nScanning repo: {repo_name} (branch: {default_branch})...")
        
        # Get the tree recursively
        tree_url = f"https://api.github.com/repos/{USER}/{repo_name}/git/trees/{default_branch}?recursive=1"
        tree_data = make_request(tree_url)
        if not tree_data or 'tree' not in tree_data:
            print(f"Could not get git tree for {repo_name} (it might be empty or API limit hit).")
            continue
            
        for item in tree_data['tree']:
            # We are looking for files (blobs), not trees (directories)
            if item['type'] != 'blob':
                continue
                
            path = item['path']
            filename = os.path.basename(path)
            
            # Match "cover" in filename and correct extension
            filename_lower = filename.lower()
            if 'cover' in filename_lower:
                if filename_lower.endswith(('.png', '.svg', '.jpg', '.jpeg', '.webp')):
                    # Formulate raw download URL with proper URL encoding
                    quoted_path = urllib.parse.quote(path)
                    raw_url = f"https://raw.githubusercontent.com/{USER}/{repo_name}/{default_branch}/{quoted_path}"
                    
                    # Formulate destination filename to include folders to prevent conflicts
                    safe_path = path.replace('/', '_')
                    
                    # Avoid double-prefixing if safe_path already starts with repo name
                    repo_lower = repo_name.lower()
                    if safe_path.lower().startswith(repo_lower):
                        dest_filename = safe_path
                    else:
                        dest_filename = f"{repo_name}_{safe_path}"
                        
                    dest_path = os.path.join(TARGET_DIR, dest_filename)
                    
                    # Download the file
                    if download_file(raw_url, dest_path):
                        downloaded_count += 1
                        
                    # Be nice to the servers
                    time.sleep(0.5)

    print(f"\nDone! Downloaded {downloaded_count} cover images to {TARGET_DIR}.")

if __name__ == "__main__":
    main()
