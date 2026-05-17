#!/usr/bin/env python3
"""
AWP Knowledge Supabase Save Script
Run this locally to upload pending_knowledge.json to Supabase.
Usage: python3 save_to_supabase.py
"""

import json
import urllib.request
import urllib.error
import time
import sys
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://yucirvuwucgarlfkfzqx.supabase.co")
SUPABASE_KEY = os.environ.get(
    "SUPABASE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y2lydnV3dWNnYXJsZmtmenF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTQwNjksImV4cCI6MjA5MjQzMDA2OX0.lXcT1zAQjzfQ3Tzbw7riiRxenU8Mn0JOcn6bDUfAtsw",
)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), "pending_knowledge.json")


def get_existing_urls():
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/web_knowledge?select=url&limit=1000",
        headers=HEADERS,
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read())
        return {item["url"] for item in data}
    except Exception as e:
        print(f"Warning: could not fetch existing URLs: {e}")
        return set()


def save_item(item, existing_urls):
    if item["url"] in existing_urls:
        print(f"  SKIP (duplicate): {item['url'][:80]}")
        return "duplicate"

    payload = json.dumps(item).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/web_knowledge",
        data=payload,
        headers=HEADERS,
        method="POST",
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        print(f"  SAVED: {item['url'][:80]}")
        return "saved"
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if "does not exist" in body or "column" in body.lower():
            # Retry without optional columns
            minimal = {
                "url": item["url"],
                "title": item["title"],
                "content_summary": item["content_summary"],
                "brands_mentioned": item["brands_mentioned"],
            }
            payload = json.dumps(minimal).encode("utf-8")
            req2 = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/web_knowledge",
                data=payload,
                headers=HEADERS,
                method="POST",
            )
            try:
                urllib.request.urlopen(req2, timeout=15)
                print(f"  SAVED (minimal): {item['url'][:80]}")
                return "saved"
            except Exception as e2:
                print(f"  ERROR (minimal retry): {e2}")
                return "error"
        print(f"  ERROR {e.code}: {body[:200]}")
        return "error"
    except Exception as e:
        print(f"  ERROR: {e}")
        return "error"


def main():
    print("AWP Knowledge — Supabase Upload")
    print("=" * 40)

    with open(KNOWLEDGE_FILE, encoding="utf-8") as f:
        items = json.load(f)

    print(f"Loaded {len(items)} items from {KNOWLEDGE_FILE}")
    existing = get_existing_urls()
    print(f"Existing URLs in DB: {len(existing)}")
    print()

    saved = duplicates = errors = 0
    for item in items:
        result = save_item(item, existing)
        if result == "saved":
            saved += 1
            existing.add(item["url"])
        elif result == "duplicate":
            duplicates += 1
        else:
            errors += 1
        time.sleep(0.2)

    print()
    print(f"Done: {saved} saved, {duplicates} duplicates, {errors} errors")


if __name__ == "__main__":
    main()
