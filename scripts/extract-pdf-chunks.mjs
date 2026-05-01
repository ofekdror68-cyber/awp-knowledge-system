#!/usr/bin/env node
/**
 * Extract text from all PDFs in Manuals/ and store chunks in document_chunks table.
 * Skips documents already chunked (checks by document_id).
 * Chunks: ~800 chars each, overlap 100 chars.
 */

import { getDocument } from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs'
import { readFile, readdir } from 'fs/promises'
import { join, extname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MANUALS_DIR = '/Users/ofek/Desktop/Manuals'
const CHUNK_SIZE = 800
const OVERLAP = 100

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

async function extractText(filepath) {
  const buf = await readFile(filepath)
  const data = new Uint8Array(buf)
  const pdf = await getDocument({ data }).promise
  let text = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    const pageText = content.items.map(i => i.str).join(' ').trim()
    if (pageText) text += pageText + '\n'
  }
  return text.trim()
}

function chunkText(text) {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push(text.slice(start, end).trim())
    start += CHUNK_SIZE - OVERLAP
  }
  return chunks.filter(c => c.length > 50)
}

async function getAllPDFs(dir, results = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) await getAllPDFs(full, results)
    else if (extname(e.name).toLowerCase() === '.pdf') results.push(full)
  }
  return results
}

async function main() {
  const files = await getAllPDFs(MANUALS_DIR)
  console.log(`Found ${files.length} PDFs`)

  // Get all documents from DB to match files
  const { data: docs } = await sb.from('documents').select('id,machine_model,file_url,title')
  const docMap = new Map()
  for (const doc of (docs || [])) {
    // Match by model + partial filename
    docMap.set(doc.id, doc)
  }
  console.log(`DB has ${docs?.length ?? 0} document records`)

  // Get already-chunked doc IDs
  const { data: existingChunks } = await sb.from('document_chunks').select('document_id')
  const chunkedIds = new Set((existingChunks || []).map(c => c.document_id))
  console.log(`Already chunked: ${chunkedIds.size} documents`)

  let ok = 0, skip = 0, fail = 0

  for (const filepath of files) {
    const relative = filepath.replace(MANUALS_DIR + '/', '')
    const parts = relative.split('/')
    const brand = parts[0]
    const model = parts[1]
    const filename = parts[parts.length - 1]

    // Find matching document record
    const doc = (docs || []).find(d =>
      d.machine_model === model &&
      d.file_url?.includes(filename.replace('.pdf', ''))
    )

    if (!doc) {
      // Try looser match: model + brand from file_url
      const doc2 = (docs || []).find(d => d.machine_model === model)
      if (!doc2) {
        process.stdout.write('?')
        skip++
        continue
      }
      // Use this doc
      if (chunkedIds.has(doc2.id)) { process.stdout.write('.'); skip++; continue }
      await processDoc(doc2, filepath, brand, model, filename)
      ok++
      continue
    }

    if (chunkedIds.has(doc.id)) { process.stdout.write('.'); skip++; continue }

    await processDoc(doc, filepath, brand, model, filename)
    ok++
  }

  console.log(`\nDone: ${ok} chunked, ${skip} skipped, ${fail} failed`)

  async function processDoc(doc, filepath, brand, model, filename) {
    try {
      const text = await extractText(filepath)
      if (!text || text.length < 100) { process.stdout.write('E'); return }

      const chunks = chunkText(text)
      const rows = chunks.map((content, i) => ({
        document_id: doc.id,
        content,
        chunk_index: i,
        metadata: { brand, model, filename, source: 'pdf_extract' }
      }))

      const { error } = await sb.from('document_chunks').insert(rows)
      if (error) throw new Error(error.message)

      process.stdout.write('✓')
    } catch (e) {
      console.error(`\n✗ ${filename}: ${e.message}`)
      fail++
    }
  }
}

main().catch(console.error)
