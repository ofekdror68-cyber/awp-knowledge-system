---
name: web-learning
description: Use this skill whenever the AWP Knowledge System needs to extract structured technical knowledge from any website (forums, manufacturer pages, archive sites, repair blogs). Use for: scraping fault discussions, extracting solutions from forum threads, parsing manufacturer service bulletins, classifying technical documents, summarizing mechanic discussions into structured fault/solution pairs. Trigger when source URLs mention: forum, troubleshoot, repair, fault, error code, manual, service bulletin, or any AWP brand name (JLG, Genie, Dingli, Manitou, Skyjack).
---

# Web Learning Skill

## Purpose
Extract reliable, structured technical knowledge from web sources and integrate it into the AWP knowledge base.

## Modules
- `scraper.ts` — fetch and clean HTML/PDF from any URL, extract PDF links
- `classifier.ts` — Claude-powered classification of documents and forum threads
- `extractor.ts` — PDF text extraction, markdown generation, folder path logic

## Standard workflow

1. INPUT: a URL or list of URLs
2. Fetch via `scrapeUrl()` — handles retry, UA rotation, content-type detection
3. Detect content type: HTML / PDF / error
4. For PDF: extract text with `extractPdfText()`, then `classifyDocument()`
5. For HTML forum thread: `cleanHtml()` → `classifyForum()` → `buildForumMarkdown()`
6. Save structured output:
   - Manuals → Supabase storage `documents/` + DB row in `documents` table
   - Forum threads → `community_knowledge` DB row + `Forums/` markdown file
   - Blog insights → `community_knowledge` row, `source_name='blog'`

## Quality rules
- NEVER save content with confidence < 2
- ALWAYS preserve `source_url` for traceability
- Detect language (he/en/zh for Dingli docs)
- For Chinese Dingli docs: translate technical terms via Claude before storing
- Reject: paywalls, login walls, captcha-blocked pages, content < 500 chars

## Failure modes
- `FORBIDDEN_403` → rotate User-Agent, retry; if still fails pass to next agent
- `NOT_FOUND_404` → try Wayback Machine snapshot
- `CAPTCHA_BLOCKED` → log and pass to next agent
- `AUTH_REQUIRED` → log and pass to next agent
- File < 50KB → likely placeholder, reject
- HTML pretending to be PDF → reject (magic bytes check)

## Chat retrieval integration
When user asks a question in `/chat`:
1. Search `documents` table (existing flow)
2. Search `community_knowledge` by: brand, model, fault_code, symptom keywords
3. Weight `community_knowledge` with `confidence >= 4` highly
4. Always cite: "לפי דיון בפורום [name], מכונאי פתר: [solution] (מקור: [url])"
