#!/usr/bin/env python3
"""
AWP Lead Generation Agent — אופק גיזום
Scrapes Google Maps via Apify, filters/scores leads, saves to Supabase, notifies via Telegram.
Run: python3 scripts/lead-gen-agent.py
"""

import json
import time
import sys
import os
import csv
from datetime import date
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode

# ── Credentials — set via environment variables ───────────────────────────────
APIFY_TOKEN    = os.getenv("APIFY_TOKEN",    "")
SUPABASE_URL   = os.getenv("SUPABASE_URL",   "")
SUPABASE_KEY   = os.getenv("SUPABASE_KEY",   "")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT  = os.getenv("TELEGRAM_CHAT",  "")

APIFY_ACTOR    = "nwua9Gu5YrADL7ZDj"
MAX_LEADS      = 100
SCORE_THRESHOLD = 5
POLL_INTERVAL  = 30   # seconds
MAX_POLL_TIME  = 900  # 15 minutes

SEARCH_QUERIES = [
    "מתקיני נברשות ישראל",
    "chandelier installers Israel",
    "צבעי חזיתות ישראל",
    "facade painting contractors Israel",
    "מתקיני סולאר ישראל",
    "solar panel installation Israel",
    "מתקיני שלטים ישראל",
    "sign installers Israel",
    "מנקי חלונות גבוהים ישראל",
    "high rise window cleaning Israel",
    "מתקיני מזגנים תעשייתיים ישראל",
    "industrial AC installation Israel",
    "מתקיני זכוכית ישראל",
    "glass installation contractors Israel",
    "קבלני גמר חזיתות ישראל",
]

SKIP_NAMES = {"בזק", "חברת החשמל", "עיריית", "עירייה", "מועצה",
              "אוניברסיטה", "בית חולים", "שפיר", "דניה", "סיבוס",
              "אופק גיזום"}
SKIP_PHONES = {"0522222224"}

SKIP_CATEGORIES = {"government", "municipality", "real estate", "hospital",
                   "university", "awp rental", "platform rental",
                   "השכרת פלטפורמות", "השכרת מנופים"}

KEEP_KEYWORDS = ["chandelier", "נברשת", "facade", "חזית", "solar", "סולאר",
                 "sign", "שלט", "window clean", "ניקוי חלונות", "ac install",
                 "מזגן", "glass", "זכוכית", "event", "אירוע", "construction",
                 "קבלן", "גמר", "גובה", "high rise", "heights"]

HEIGHT_KEYWORDS = ["חזית", "גובה", "סולאר", "נברשת", "solar", "facade",
                   "heights", "high rise", "altitude"]

PENALIZE_KEYWORDS = ["tourism", "תיירות", "restaurant", "מסעדה", "retail",
                     "קמעונאי", "coffee", "קפה", "hotel", "מלון"]


# ── HTTP helpers ──────────────────────────────────────────────────────────────
def http(method, url, headers=None, body=None, timeout=30):
    data = json.dumps(body).encode() if body is not None else None
    req  = Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    with urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def get(url, headers=None):
    return http("GET", url, headers=headers)


def post(url, body, headers=None):
    return http("POST", url, headers=headers, body=body)


# ── Step 1 — Load existing phones from Supabase ───────────────────────────────
def load_existing_phones():
    print("STEP 1 — Loading existing phones from Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/leads?select=phone&limit=5000"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        rows = get(url, headers=headers)
        phones = {r["phone"] for r in rows if r.get("phone")}
        print(f"  Found {len(phones)} existing phones.")
        return phones
    except Exception as e:
        print(f"  WARNING: Could not load existing phones: {e}")
        return set()


# ── Step 2 — Run Apify scraper ────────────────────────────────────────────────
def start_apify_run():
    print("STEP 2 — Starting Apify Google Maps scraper...")
    url = f"https://api.apify.com/v2/acts/{APIFY_ACTOR}/runs"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    payload = {
        "searchStringsArray": SEARCH_QUERIES,
        "locationQuery": "Israel",
        "language": "he",
        "maxCrawledPlacesPerSearch": 60,
    }
    resp = post(url, payload, headers=headers)
    run_id     = resp["data"]["id"]
    dataset_id = resp["data"]["defaultDatasetId"]
    print(f"  Run ID: {run_id}  Dataset: {dataset_id}")
    return run_id, dataset_id


def poll_apify_run(run_id):
    print(f"  Polling run {run_id} (max {MAX_POLL_TIME}s)...")
    url     = f"https://api.apify.com/v2/acts/{APIFY_ACTOR}/runs/{run_id}"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    elapsed = 0
    while elapsed < MAX_POLL_TIME:
        resp   = get(url, headers=headers)
        status = resp["data"]["status"]
        print(f"  [{elapsed}s] Status: {status}")
        if status == "SUCCEEDED":
            return True
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            return False
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
    print("  ERROR: Timed out waiting for Apify run.")
    return False


def fetch_apify_results(dataset_id):
    print(f"  Fetching results from dataset {dataset_id}...")
    url     = f"https://api.apify.com/v2/datasets/{dataset_id}/items?format=json&limit=2000"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    items   = get(url, headers=headers)
    print(f"  Raw items: {len(items)}")
    return items


# ── Step 3 — Filter ───────────────────────────────────────────────────────────
def should_skip(item):
    phone = (item.get("phone") or "").strip()
    if not phone:
        return True, "no phone"

    name     = item.get("title") or item.get("name") or ""
    category = (item.get("categoryName") or item.get("category") or "").lower()

    for skip in SKIP_NAMES:
        if skip in name:
            return True, f"skip name: {skip}"

    if phone in SKIP_PHONES:
        return True, "skip phone"

    for skip_cat in SKIP_CATEGORIES:
        if skip_cat in category:
            return True, f"skip category: {skip_cat}"

    name_lower = name.lower()
    cat_lower  = category.lower()
    combined   = name_lower + " " + cat_lower
    if any(kw in combined for kw in KEEP_KEYWORDS):
        return False, "keep: keyword match"

    return True, "no matching keep keyword"


def filter_leads(items, existing_phones):
    print("STEP 3 — Filtering leads...")
    kept = []
    skipped = 0
    dupes   = 0
    for item in items:
        phone = (item.get("phone") or "").strip()
        if phone and phone in existing_phones:
            dupes += 1
            continue
        skip, reason = should_skip(item)
        if skip:
            skipped += 1
        else:
            kept.append(item)
    print(f"  Kept: {len(kept)}  Skipped: {skipped}  Dupes: {dupes}")
    return kept


# ── Step 4 — Score ────────────────────────────────────────────────────────────
def score_lead(item):
    score   = 0
    reasons = []

    name     = (item.get("title") or item.get("name") or "").lower()
    category = (item.get("categoryName") or item.get("category") or "").lower()
    combined = name + " " + category

    # Category match +4
    target_cats = ["solar", "סולאר", "chandelier", "נברשת", "facade", "חזית",
                   "sign", "שלט", "window clean", "ניקוי חלונות", "ac install",
                   "מזגן", "glass", "זכוכית", "קבלן"]
    if any(kw in combined for kw in target_cats):
        score += 4
        reasons.append("category+4")

    # Has website +1
    website = item.get("website") or ""
    if website:
        score += 1
        reasons.append("website+1")

    # Rating ≥ 4.0 +1
    rating = float(item.get("totalScore") or item.get("rating") or 0)
    if rating >= 4.0:
        score += 1
        reasons.append(f"rating{rating}+1")

    # Review count ≥ 10 +1
    reviews = int(item.get("reviewsCount") or item.get("review_count") or 0)
    if reviews >= 10:
        score += 1
        reasons.append(f"reviews{reviews}+1")

    # Height keywords +2
    if any(kw in combined for kw in HEIGHT_KEYWORDS):
        score += 2
        reasons.append("height+2")

    # Penalize tourism/food/retail -3
    if any(kw in combined for kw in PENALIZE_KEYWORDS):
        score -= 3
        reasons.append("penalize-3")

    return score, ", ".join(reasons)


def score_leads(items):
    print("STEP 4 — Scoring leads...")
    scored = []
    for item in items:
        s, reason = score_lead(item)
        item["_score"]  = s
        item["_reason"] = reason
        scored.append(item)
    scored.sort(key=lambda x: x["_score"], reverse=True)
    qualified = [x for x in scored if x["_score"] >= SCORE_THRESHOLD]
    print(f"  Scored: {len(scored)}  Qualified (≥{SCORE_THRESHOLD}): {len(qualified)}")
    return qualified[:MAX_LEADS]


# ── Step 5 — Save to Supabase ─────────────────────────────────────────────────
def save_lead(item):
    url     = f"{SUPABASE_URL}/rest/v1/leads"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "return=minimal",
    }
    payload = {
        "name":           item.get("title") or item.get("name") or "",
        "phone":          (item.get("phone") or "").strip(),
        "category":       item.get("categoryName") or item.get("category") or "",
        "address":        item.get("address") or "",
        "city":           item.get("city") or "",
        "website":        item.get("website") or "",
        "rating":         float(item.get("totalScore") or item.get("rating") or 0) or None,
        "review_count":   int(item.get("reviewsCount") or item.get("review_count") or 0) or None,
        "score":          item["_score"],
        "score_reason":   item["_reason"],
        "google_maps_url": item.get("url") or item.get("google_maps_url") or "",
        "source_query":   item.get("searchString") or item.get("source_query") or "",
    }
    try:
        post(url, payload, headers=headers)
        return True
    except HTTPError as e:
        body = e.read().decode()
        if e.code in (400, 404):
            # Retry with minimal fields
            try:
                minimal = {
                    "name":     payload["name"],
                    "phone":    payload["phone"],
                    "category": payload["category"],
                    "score":    payload["score"],
                }
                post(url, minimal, headers=headers)
                return True
            except Exception as e2:
                print(f"  ERROR saving {payload['phone']}: {e2}")
                return False
        print(f"  ERROR saving {payload['phone']}: {e.code} {body[:200]}")
        return False
    except Exception as e:
        print(f"  ERROR saving {payload['phone']}: {e}")
        return False


def save_leads_to_supabase(leads):
    print(f"STEP 5 — Saving {len(leads)} leads to Supabase...")
    saved = 0
    for lead in leads:
        if save_lead(lead):
            saved += 1
    print(f"  Saved: {saved}")
    return saved


def save_leads_to_csv(leads):
    filename = f"leads-{date.today()}.csv"
    path     = os.path.join(os.path.dirname(__file__), "..", filename)
    path     = os.path.normpath(path)
    fields   = ["name", "phone", "category", "address", "city", "website",
                "rating", "review_count", "score", "score_reason",
                "google_maps_url", "source_query"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for lead in leads:
            row = {
                "name":           lead.get("title") or lead.get("name") or "",
                "phone":          (lead.get("phone") or "").strip(),
                "category":       lead.get("categoryName") or lead.get("category") or "",
                "address":        lead.get("address") or "",
                "city":           lead.get("city") or "",
                "website":        lead.get("website") or "",
                "rating":         lead.get("totalScore") or lead.get("rating") or "",
                "review_count":   lead.get("reviewsCount") or lead.get("review_count") or "",
                "score":          lead["_score"],
                "score_reason":   lead["_reason"],
                "google_maps_url": lead.get("url") or lead.get("google_maps_url") or "",
                "source_query":   lead.get("searchString") or lead.get("source_query") or "",
            }
            w.writerow(row)
    print(f"  CSV saved: {path}")
    return path


# ── Step 6 — Telegram notification ───────────────────────────────────────────
def count_by_category(leads, keyword):
    return sum(1 for l in leads if keyword in (
        (l.get("categoryName") or l.get("category") or "") +
        (l.get("title") or l.get("name") or "")
    ).lower())


def send_telegram(text):
    url  = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    body = {"chat_id": TELEGRAM_CHAT, "parse_mode": "HTML", "text": text}
    try:
        post(url, body)
        print("  Telegram notification sent.")
    except Exception as e:
        print(f"  WARNING: Telegram failed: {e}")


def notify_success(raw_count, filtered_count, qualified, saved):
    n_solar     = count_by_category(qualified, "סולאר") + count_by_category(qualified, "solar")
    n_facade    = count_by_category(qualified, "חזית") + count_by_category(qualified, "facade")
    n_sign      = count_by_category(qualified, "שלט") + count_by_category(qualified, "sign")
    n_chandelier = count_by_category(qualified, "נברשת") + count_by_category(qualified, "chandelier")
    text = (
        "🎯 <b>סוכן לידים — AWP אופק גיזום</b>\n\n"
        "✅ ריצה שבועית הסתיימה\n"
        f"📊 נמצאו: {raw_count} עסקים\n"
        f"🔍 אחרי סינון: {filtered_count}\n"
        f"⭐ ציון ≥5: {len(qualified)}\n"
        f"💾 נשמרו ב-DB: {saved}\n\n"
        "🏆 הקטגוריות הטובות:\n"
        f"• סולאר: {n_solar}\n"
        f"• חזיתות: {n_facade}\n"
        f"• שלטים: {n_sign}\n"
        f"• נברשות: {n_chandelier}"
    )
    send_telegram(text)


def notify_error(msg):
    text = (
        "❌ <b>סוכן לידים — AWP</b>\n\n"
        f"שגיאה בריצה:\n{msg}\n\n"
        "נדרשת בדיקה ידנית."
    )
    send_telegram(text)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("AWP Lead Generation Agent — אופק גיזום")
    print("=" * 60)

    # Step 1
    existing_phones = load_existing_phones()

    # Step 2
    try:
        run_id, dataset_id = start_apify_run()
    except Exception as e:
        msg = f"Apify start failed: {e}"
        print(f"ERROR: {msg}")
        notify_error(msg)
        sys.exit(1)

    success = poll_apify_run(run_id)
    if not success:
        msg = f"Apify run {run_id} did not succeed."
        print(f"ERROR: {msg}")
        notify_error(msg)
        sys.exit(1)

    try:
        items = fetch_apify_results(dataset_id)
    except Exception as e:
        msg = f"Fetching Apify results failed: {e}"
        print(f"ERROR: {msg}")
        notify_error(msg)
        sys.exit(1)

    raw_count = len(items)

    # Step 3
    filtered = filter_leads(items, existing_phones)

    # Step 4
    qualified = score_leads(filtered)

    # Step 5
    saved = 0
    if qualified:
        try:
            saved = save_leads_to_supabase(qualified)
        except Exception as e:
            print(f"  Supabase save failed ({e}), falling back to CSV...")
            save_leads_to_csv(qualified)
            saved = len(qualified)

        if saved == 0:
            print("  Supabase returned 0 saved, falling back to CSV...")
            save_leads_to_csv(qualified)
            saved = len(qualified)
    else:
        print("STEP 5 — No qualified leads to save.")

    # Step 6
    notify_success(raw_count, len(filtered), qualified, saved)

    print("=" * 60)
    print(f"Done. Raw={raw_count} Filtered={len(filtered)} Qualified={len(qualified)} Saved={saved}")
    print("=" * 60)


if __name__ == "__main__":
    main()
