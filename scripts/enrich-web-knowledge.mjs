#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yucirvuwucgarlfkfzqx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y2lydnV3dWNnYXJsZmtmenF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTQwNjksImV4cCI6MjA5MjQzMDA2OX0.lXcT1zAQjzfQ3Tzbw7riiRxenU8Mn0JOcn6bDUfAtsw'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// STEP 1: Load existing URLs
const { data: existing, error: fetchError } = await sb
  .from('web_knowledge')
  .select('url')
  .limit(1000)

if (fetchError) {
  console.error('ERROR loading existing URLs:', fetchError.message)
  process.exit(1)
}

const existingUrls = new Set((existing || []).map(r => r.url))
console.log('EXISTING_COUNT=' + existingUrls.size)
existingUrls.forEach(u => console.log('EXISTING_URL=' + u))
