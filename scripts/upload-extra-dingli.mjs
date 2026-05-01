#!/usr/bin/env node
import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const DIR = '/Users/ofek/Desktop/דינגלי תקלות'

// Map filename patterns to model(s)
function inferModel(filename) {
  const f = filename.toUpperCase()
  if (f.includes('0607DCM') && f.includes('0608') && f.includes('0708')) return 'JCPT0607DCM'
  if (f.includes('0607DCM')) return 'JCPT0607DCM'
  if (f.includes('0608DCM')) return 'JCPT0608DCM'
  if (f.includes('0708DCM')) return 'JCPT0708DCM'
  if (f.includes('0807HA') || f.includes('0807AC')) return 'JCPT0807AC'
  if (f.includes('0807')) return 'JCPT0807AC'
  if (f.includes('0808')) return 'JCPT0808AC'
  return 'Dingli'
}

function inferDocType(filename) {
  const f = filename.toLowerCase()
  if (f.includes('part')) return 'parts_catalog'
  if (f.includes('operating') || f.includes('operator')) return 'manual'
  if (f.includes('service') || f.includes('maintenance')) return 'manual'
  if (f.includes('fault') || f.includes('error')) return 'fault_codes'
  return 'manual'
}

const files = [
  'JCPT0607DCM DCM-XD Part Manual  copy.pdf',
  'JCPT0607DCM JCPT0608DCM JCPT0708DCM Operating Manual copy.pdf',
  'JCPT0608DCM 0708DCM DCM-XD  Part Manual copy.pdf',
  'JCPT0807-1614（交流） Operating Manual copy.pdf',
  'JCPT0807-1614（交流） Operating Manual.pdf',
  'JCPT0807HA  0807AC  Part Manual copy.pdf',
  'JCPT0808-1614（交流） Part Manual copy.pdf',
  'JCPT0808-1614（交流） Part Manual.pdf',
]

let ok = 0, skip = 0, fail = 0

for (const filename of files) {
  const filepath = join(DIR, filename)
  const model = inferModel(filename)
  const docType = inferDocType(filename)
  const safeFilename = filename.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const storagePath = `manuals/Dingli/${model}/${safeFilename}`

  const { data: existing } = await sb.from('documents').select('id').eq('file_url', storagePath).maybeSingle()
  if (existing) { skip++; console.log(`skip: ${filename}`); continue }

  try {
    const buf = await readFile(filepath)
    const { error: uploadErr } = await sb.storage.from('awp-documents').upload(storagePath, buf, { contentType: 'application/pdf', upsert: true })
    if (uploadErr) throw new Error(uploadErr.message)

    const { data: { publicUrl } } = sb.storage.from('awp-documents').getPublicUrl(storagePath)
    const title = `${model} — ${filename.replace(/\.pdf$/i, '').trim()}`

    await sb.from('documents').insert({ machine_brand: 'Dingli', machine_model: model, doc_type: docType, title, file_url: publicUrl })
    ok++
    console.log(`✓ ${filename} → ${model}`)
  } catch (e) {
    fail++
    console.error(`✗ ${filename}: ${e.message}`)
  }
}

console.log(`\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed`)
