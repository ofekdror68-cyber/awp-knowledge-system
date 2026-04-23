#!/usr/bin/env node
/**
 * Upload all PDFs from Manuals/ to Supabase Storage.
 * Uses folder structure: Brand/Model/filename.pdf
 * Stores metadata in `documents` table for fast lookup.
 */

import { readdir, readFile, stat } from 'fs/promises'
import { join, basename, extname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
const MANUALS_DIR = '/Users/ofek/Desktop/Manuals'

// doc_type from filename suffix
function inferDocType(filename) {
  const lower = filename.toLowerCase()
  if (lower.includes('parts')) return 'parts_catalog'
  if (lower.includes('service') || lower.includes('maintenance')) return 'manual'
  if (lower.includes('operator')) return 'manual'
  if (lower.includes('fault') || lower.includes('error')) return 'fault_codes'
  if (lower.includes('schematic') || lower.includes('wiring')) return 'schematic'
  return 'manual'
}

async function getAllFiles(dir, results = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      await getAllFiles(full, results)
    } else if (['.pdf', '.jpg', '.jpeg', '.png', '.svg'].includes(extname(e.name).toLowerCase())) {
      results.push(full)
    }
  }
  return results
}

async function main() {
  const files = await getAllFiles(MANUALS_DIR)
  console.log(`Found ${files.length} files to upload`)

  let ok = 0, skip = 0, fail = 0

  for (const filepath of files) {
    // Parse path: Manuals/Brand/Model/filename.pdf
    const relative = filepath.replace(MANUALS_DIR + '/', '')
    const parts = relative.split('/')
    const brand = parts[0] || 'Unknown'
    const model = parts[1] || 'Unknown'
    const filename = parts[parts.length - 1]
    const storagePath = `manuals/${relative}`

    // Check if already uploaded
    const { data: existing } = await sb.from('documents')
      .select('id').eq('file_url', storagePath).single()
    if (existing) { skip++; process.stdout.write('.'); continue }

    try {
      const fileBuffer = await readFile(filepath)
      const fileStat = await stat(filepath)
      const ext = extname(filename).toLowerCase()
      const mimeType = ext === '.pdf' ? 'application/pdf' : `image/${ext.slice(1)}`

      // Upload to storage
      const { error: uploadErr } = await sb.storage
        .from('awp-documents')
        .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data: { publicUrl } } = sb.storage.from('awp-documents').getPublicUrl(storagePath)

      // Insert document record
      const docType = inferDocType(filename)
      const title = filename.replace(extname(filename), '').replace(/_/g, ' ')

      await sb.from('documents').insert({
        machine_brand: brand,
        machine_model: model,
        doc_type: docType,
        title: `${model} — ${title}`,
        file_url: publicUrl,
      })

      ok++
      process.stdout.write('✓')
    } catch (e) {
      fail++
      console.error(`\n✗ ${filename}: ${e.message}`)
    }
  }

  console.log(`\n\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed`)
}

main().catch(console.error)
