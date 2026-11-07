"""Refresh public repository metadata without exposing private repositories."""
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
headers = {"Accept": "application/vnd.github+json", "User-Agent": "varnholt-portfolio"}
if os.environ.get("GITHUB_TOKEN"):
    headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
repos = []
for page in range(1, 100):
    request = urllib.request.Request(
        f"https://api.github.com/users/varnholt/repos?type=owner&per_page=100&page={page}", headers=headers
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        batch = json.load(response)
    repos.extend(r for r in batch if not r.get("private", True))
    if len(batch) < 100:
        break
fields = ("name", "description", "language", "stargazers_count", "fork", "html_url", "homepage", "default_branch", "archived")
(ROOT / "repos.json").write_text(json.dumps([{k: r.get(k) for k in fields} for r in repos], indent=2) + "\n", encoding="utf-8")
print(f"Refreshed {len(repos)} public repositories")
