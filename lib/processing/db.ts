import type { Document, ProcessingState } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
})

export async function dbGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: headers() })
  if (!res.ok) throw new Error(`DB GET ${path}: ${await res.text()}`)
  return res.json()
}

export async function dbPost(table: string, body: unknown, options?: { upsert?: boolean }): Promise<void> {
  const prefer = options?.upsert ? 'resolution=merge-duplicates' : 'return=minimal'
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: prefer },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DB POST ${table}: ${text}`)
  }
}

export async function dbPatch(table: string, filter: string, body: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`DB PATCH ${table}: ${await res.text()}`)
}

export async function getUnprocessedDocs(layer: number, limit = 5): Promise<Document[]> {
  const layerCol = `layer_${layer}_done`
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/doc_processing_state?${layerCol}=eq.false&quarantined=eq.false&select=document_id&limit=${limit}&order=attempts.asc`,
    { headers: headers() }
  )
  if (!res.ok) return []
  const states: { document_id: string }[] = await res.json()
  if (!states.length) return []

  const ids = states.map(s => s.document_id).join(',')
  const docsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/documents?id=in.(${ids})&select=id,machine_brand,machine_model,doc_type,title,file_url,page_count`,
    { headers: headers() }
  )
  if (!docsRes.ok) return []
  return docsRes.json()
}

export async function getProcessingState(docId: string): Promise<ProcessingState | null> {
  const rows = await dbGet<ProcessingState>(`doc_processing_state?document_id=eq.${docId}`)
  return rows[0] || null
}

export async function markLayerDone(docId: string, layer: number, extras?: Partial<ProcessingState>): Promise<void> {
  await dbPatch('doc_processing_state', `document_id=eq.${docId}`, {
    [`layer_${layer}_done`]: true,
    updated_at: new Date().toISOString(),
    ...extras,
  })
}

export async function markError(docId: string, error: string): Promise<void> {
  const state = await getProcessingState(docId)
  const attempts = (state?.attempts || 0) + 1
  await dbPatch('doc_processing_state', `document_id=eq.${docId}`, {
    last_error: error.substring(0, 500),
    attempts,
    quarantined: attempts >= 3,
    updated_at: new Date().toISOString(),
  })
}

export async function addCost(docId: string, cents: number): Promise<void> {
  await dbPatch('doc_processing_state', `document_id=eq.${docId}`, {
    cost_usd_cents: cents,
    updated_at: new Date().toISOString(),
  })
}

export async function getProgressStats(): Promise<{
  total: number
  layers: Array<{ layer: number; done: number; pct: number }>
  totalCostCents: number
  quarantined: number
}> {
  const rows = await dbGet<ProcessingState>('doc_processing_state?select=layer_1_done,layer_2_done,layer_3_done,layer_4_done,layer_5_done,layer_6_done,layer_7_done,quarantined,cost_usd_cents')
  const total = rows.length
  if (!total) return { total: 0, layers: [], totalCostCents: 0, quarantined: 0 }

  const layers = [1, 2, 3, 4, 5, 6, 7].map(n => {
    const col = `layer_${n}_done` as keyof ProcessingState
    const done = rows.filter(r => r[col]).length
    return { layer: n, done, pct: Math.round((done / total) * 100) }
  })

  const totalCostCents = rows.reduce((s, r) => s + (r.cost_usd_cents || 0), 0)
  const quarantined = rows.filter(r => r.quarantined).length

  return { total, layers, totalCostCents, quarantined }
}

export async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${url} → ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
