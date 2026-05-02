import { dbGet, dbPatch, markLayerDone, markError, addCost } from './db'
import type { Document, ProcessingResult } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text.substring(0, 8000) }),
      })
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 5000 * Math.pow(2, attempt)))
        continue
      }
      if (!res.ok) return null
      const data: { data: Array<{ embedding: number[] }> } = await res.json()
      return data.data[0].embedding
    } catch { return null }
  }
  return null
}

async function embedBatch(
  table: string,
  rows: Array<{ id: string; content: string }>,
  costCents: number
): Promise<number> {
  let spent = 0
  for (const row of rows) {
    const emb = await getEmbedding(row.content)
    if (!emb) continue
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ embedding: JSON.stringify(emb) }),
    })
    spent += costCents
    // Rate limit: 500 req/min for OpenAI embeddings → ~120ms between calls
    await new Promise(r => setTimeout(r, 120))
  }
  return spent
}

export async function processLayer7(doc: Document): Promise<ProcessingResult> {
  if (!process.env.OPENAI_API_KEY) {
    await markLayerDone(doc.id, 7)
    return { success: true, itemsProcessed: 0, costCents: 0 }
  }

  try {
    let totalCostCents = 0
    let processed = 0

    // Embed doc_chunks
    const chunks = await dbGet<{ id: string; content: string; title?: string }>(
      `doc_chunks?document_id=eq.${doc.id}&embedding=is.null&select=id,content,title&limit=100`
    )
    for (const c of chunks) {
      const text = [c.title, c.content].filter(Boolean).join(' ').substring(0, 8000)
      const emb = await getEmbedding(text)
      if (emb) {
        await fetch(`${SUPABASE_URL}/rest/v1/doc_chunks?id=eq.${c.id}`, {
          method: 'PATCH',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ embedding: JSON.stringify(emb) }),
        })
        totalCostCents += 1
        processed++
        await new Promise(r => setTimeout(r, 120))
      }
    }

    // Embed kb_entities
    const entities = await dbGet<{ id: string; name: string; description?: string }>(
      `kb_entities?brand=eq.${encodeURIComponent(doc.machine_brand || '')}&model=eq.${encodeURIComponent(doc.machine_model || '')}&embedding=is.null&select=id,name,description&limit=100`
    )
    const entityCost = await embedBatch('kb_entities',
      entities.map(e => ({ id: e.id, content: [e.name, e.description].filter(Boolean).join('. ') })),
      1
    )
    totalCostCents += entityCost
    processed += entities.length

    // Embed fault_intelligence
    const faults = await dbGet<{ id: string; fault_code?: string; fault_description?: string; symptoms?: string[] }>(
      `fault_intelligence?brand=eq.${encodeURIComponent(doc.machine_brand || '')}&model=eq.${encodeURIComponent(doc.machine_model || '')}&embedding=is.null&select=id,fault_code,fault_description,symptoms&limit=50`
    )
    const faultCost = await embedBatch('fault_intelligence',
      faults.map(f => ({
        id: f.id,
        content: [f.fault_code, f.fault_description, ...(f.symptoms || [])].filter(Boolean).join(' '),
      })),
      1
    )
    totalCostCents += faultCost
    processed += faults.length

    await addCost(doc.id, totalCostCents)
    await markLayerDone(doc.id, 7)
    return { success: true, itemsProcessed: processed, costCents: totalCostCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L7: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
