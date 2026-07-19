#!/usr/bin/env python3
"""Update the public Happy eBook Top 5 from a private Google Play sales report."""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NEWS_PATH = ROOT / "src" / "news.json"
BOOKS_PATH = ROOT / "src" / "books.json"


def find_column(fieldnames: list[str], *names: str) -> str:
    normalized = {name.strip().casefold(): name for name in fieldnames}
    for candidate in names:
        if candidate.casefold() in normalized:
            return normalized[candidate.casefold()]
    raise ValueError(f"報表缺少欄位：{' / '.join(names)}")


def parse_number(value: str) -> float:
    cleaned = str(value or "0").replace(",", "").strip()
    return float(cleaned or 0)


def read_report(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        delimiter = "\t" if sample.count("\t") > sample.count(",") else ","
        return list(csv.DictReader(handle, delimiter=delimiter))


def load_book_links() -> dict[str, str]:
    books = json.loads(BOOKS_PATH.read_text(encoding="utf-8"))
    return {
        str(book.get("title", "")).strip().casefold(): str(
            book.get("buyUrl") or book.get("readUrl") or ""
        )
        for book in books
    }


def update_ranking(report_path: Path, start: str, end: str) -> list[dict[str, object]]:
    rows = read_report(report_path)
    if not rows:
        raise ValueError("報表沒有資料列")
    fields = list(rows[0].keys())
    title_column = find_column(fields, "Title", "書名")
    units_column = find_column(fields, "Net Units Sold", "淨銷售量", "Qty", "數量")
    totals: defaultdict[str, float] = defaultdict(float)
    for row in rows:
        title = str(row.get(title_column, "")).strip()
        if title:
            totals[title] += parse_number(row.get(units_column, "0"))

    links = load_book_links()
    ranking = [entry for entry in sorted(totals.items(), key=lambda item: (-item[1], item[0])) if entry[1] > 0][:5]
    news = json.loads(NEWS_PATH.read_text(encoding="utf-8"))
    group = next((item for item in news["groups"] if item.get("id") == "happyebook"), None)
    if group is None:
        raise ValueError("news.json 找不到 happyebook 分類")

    group["updatedAt"] = date.today().isoformat()
    group["period"] = f"{start} 至 {end}"
    group["items"] = [
        {
            "rank": index,
            "title": title,
            "summary": "依 Google Play 圖書銷售摘要報表的淨銷售量排序。",
            "source": "Google Play 圖書",
            "date": date.today().isoformat(),
            "url": links.get(title.casefold(), ""),
        }
        for index, (title, _units) in enumerate(ranking, start=1)
    ]
    news["updatedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
    NEWS_PATH.write_text(json.dumps(news, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return group["items"]


def main() -> None:
    parser = argparse.ArgumentParser(description="把 Google Play 銷售報表轉成首頁暢銷 Top 5")
    parser.add_argument("report", type=Path, help="Google Play 銷售摘要 CSV/TSV")
    parser.add_argument("--start", required=True, help="統計起日，YYYY-MM-DD")
    parser.add_argument("--end", required=True, help="統計迄日，YYYY-MM-DD")
    args = parser.parse_args()
    for value in (args.start, args.end):
        date.fromisoformat(value)
    if not args.report.is_file():
        parser.error(f"找不到報表：{args.report}")
    items = update_ranking(args.report, args.start, args.end)
    print(f"已更新 {NEWS_PATH.relative_to(ROOT)}，共 {len(items)} 本書；未寫入營收金額。")


if __name__ == "__main__":
    main()
