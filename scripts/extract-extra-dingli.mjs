#!/usr/bin/env node
/**
 * Extract text chunks from the new Dingli files uploaded from "דינגלי תקלות" folder.
 */
import { getDocument } from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs'
import { readFile, readdir } from 'fs/promises'
import { join, extname, basename } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const DIR = '/Users/ofek/Desktop/דינגלי תקלות'
const CHUNK_SIZE = 800
const OVERLAP = 100

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
    chunks.push(text.slice(start, Math.min(start + CHUNK_SIZE, text.length)).trim())
    start += CHUNK_SIZE - OVERLAP
  }
  return chunks.filter(c => c.length > 50)
}

const files = (await readdir(DIR)).filter(f => extname(f).toLowerCase() === '.pdf')
const { data: docs } = await sb.from('documents').select('id,title,machine_model')

let ok = 0, skip = 0, fail = 0

for (const filename of files) {
  const safeFilename = filename.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')

  // Find matching document record
  const doc = docs.find(d => d.title?.includes(safeFilename.replace('.pdf', '').substring(0, 15)))
    || docs.find(d => d.title?.toLowerCase().includes(filename.toLowerCase().replace(/[^\x00-\x7F]/g, '').substring(0, 10).toLowerCase()))

  if (!doc) { console.log(`? no DB record for: ${filename}`); skip++; continue }

  // Check if already chunked
  const { count } = await sb.from('document_chunks').select('id', { count: 'exact', head: true }).eq('document_id', doc.id)
  if (count > 0) { process.stdout.write('.'); skip++; continue }

  try {
    const text = await extractText(join(DIR, filename))
    if (!text || text.length < 100) { process.stdout.write('E'); skip++; continue }

    const chunks = chunkText(text)
    await sb.from('document_chunks').insert(
      chunks.map((content, i) => ({ document_id: doc.id, content, chunk_index: i, metadata: { filename } }))
    )
    ok++
    process.stdout.write('✓')
  } catch (e) {
    fail++
    console.error(`\n✗ ${filename}: ${e.message}`)
  }
}

console.log(`\nDone: ${ok} chunked, ${skip} skipped, ${fail} failed`)
