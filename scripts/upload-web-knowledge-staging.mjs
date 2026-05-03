#!/usr/bin/env node
/**
 * Uploads web-knowledge-staging.json to Supabase web_knowledge table.
 * Run from repo root: node scripts/upload-web-knowledge-staging.mjs
 * Requires network access to Supabase (not available inside CCR sandbox).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://yucirvuwucgarlfkfzqx.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y2lydnV3dWNnYXJsZmtmenF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTQwNjksImV4cCI6MjA5MjQzMDA2OX0.lXcT1zAQjzfQ3Tzbw7riiRxenU8Mn0JOcn6bDUfAtsw'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// Load staging file
const stagingPath = join(__dirname, '..', 'web-knowledge-staging.json')
const items = JSON.parse(readFileSync(stagingPath, 'utf8'))

// Load existing URLs to avoid duplicates
console.log('Loading existing URLs from Supabase...')
const { data: existing, error: fetchError } = await sb
  .from('web_knowledge')
  .select('url')
  .limit(1000)

if (fetchError) {
  console.error('ERROR loading existing URLs:', fetchError.message)
  console.error('Hint: Run this script in an environment with network access to Supabase.')
  process.exit(1)
}

const existingUrls = new Set((existing || []).map(r => r.url))
console.log(`Existing URLs in DB: ${existingUrls.size}`)

let saved = 0
let skipped = 0
let errors = 0

for (const item of items) {
  if (existingUrls.has(item.url)) {
    console.log(`SKIP (duplicate): ${item.url}`)
    skipped++
    continue
  }

  // Try with all columns first, fall back to minimal columns
  const payload = {
    url: item.url,
    title: item.title,
    content_summary: item.content_summary,
    brands_mentioned: item.brands_mentioned,
  }

  // Add optional columns if they exist in schema
  if (item.equipment_model) payload.equipment_model = item.equipment_model
  if (item.topic) payload.topic = item.topic
  if (item.reliability_score != null) payload.reliability_score = item.reliability_score

  const { error } = await sb.from('web_knowledge').insert(payload)

  if (error) {
    // Try without optional columns
    if (error.message.includes('column') || error.message.includes('schema')) {
      const minPayload = {
        url: item.url,
        title: item.title,
        content_summary: item.content_summary,
        brands_mentioned: item.brands_mentioned,
      }
      const { error: err2 } = await sb.from('web_knowledge').insert(minPayload)
      if (err2) {
        console.error(`ERROR saving ${item.url}: ${err2.message}`)
        errors++
      } else {
        console.log(`SAVED (minimal): ${item.url}`)
        saved++
      }
    } else {
      console.error(`ERROR saving ${item.url}: ${error.message}`)
      errors++
    }
  } else {
    console.log(`SAVED: ${item.url}`)
    saved++
  }
}

console.log('\n=== Upload Summary ===')
console.log(`Saved:   ${saved}`)
console.log(`Skipped: ${skipped} (duplicates)`)
console.log(`Errors:  ${errors}`)
