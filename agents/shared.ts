// Shared utilities for all AWP acquisition agents

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
]

export function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error = new Error('No attempts')
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...(options?.headers || {}),
        },
        signal: AbortSignal.timeout(30000),
      })
      if (res.status === 429 || res.status === 503) {
        await sleep(Math.pow(4, i) * 1000)
        continue
      }
      return res
    } catch (e) {
      lastError = e as Error
      if (i < maxRetries - 1) await sleep(Math.pow(4, i) * 1000)
    }
  }
  throw lastError
}

export async function isValidPdf(buffer: ArrayBuffer): Promise<boolean> {
  if (buffer.byteLength < 50_000) return false
  const bytes = new Uint8Array(buffer.slice(0, 5))
  return String.fromCharCode(...bytes).startsWith('%PDF')
}

export function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

export async function sbGet<T>(table: string, params: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) return []
  return res.json()
}

export async function sbPost(table: string, data: Record<string, unknown>) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

export async function sbPatch(table: string, id: string, data: Record<string, unknown>) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

export async function sbUpsert(table: string, data: Record<string, unknown>, onConflict: string) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(data),
  })
}

export async function uploadToStorage(path: string, buffer: ArrayBuffer): Promise<string | null> {
  // Try upsert (overwrite if exists)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/documents/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`Storage upload failed for ${path}:`, err)
    return null
  }
  return `${SUPABASE_URL}/storage/v1/object/public/documents/${path}`
}

export async function registerDocument(params: {
  brand: string
  model: string
  category: number
  categoryName: string
  title: string
  fileUrl: string
  fileSizeBytes: number
  source: string
}) {
  await sbPost('documents', {
    machine_brand: params.brand,
    machine_model: params.model,
    doc_type: 'acquired',
    title: params.title,
    file_url: params.fileUrl,
    doc_category: params.category,
    doc_category_name: params.categoryName,
    uploaded_at: new Date().toISOString(),
    source: params.source,
  })
}

export interface QueueItem {
  id: string
  brand: string
  model: string
  category: number
  category_name: string
  status: string
  current_agent: string | null
  retry_count: number
  attempted_urls: string[]
  error_log: string | null
}

export async function getPendingItems(limit = 10): Promise<QueueItem[]> {
  return sbGet<QueueItem>(
    'acquisition_queue',
    `status=eq.pending&order=retry_count.asc,created_at.asc&limit=${limit}`
  )
}

export async function markInProgress(id: string, agent: string) {
  await sbPatch('acquisition_queue', id, { status: 'in_progress', current_agent: agent })
}

export async function markCompleted(id: string, url: string, path: string, bytes: number) {
  await sbPatch('acquisition_queue', id, {
    status: 'completed', found_url: url, saved_path: path, file_size_bytes: bytes,
  })
}

export async function markFailed(id: string, errMsg: string, triedUrls: string[], nextStatus = 'pending') {
  const item = await sbGet<QueueItem>('acquisition_queue', `id=eq.${id}`)
  const existing = item[0]?.attempted_urls || []
  const allUrls = [...new Set([...existing, ...triedUrls])]
  await sbPatch('acquisition_queue', id, {
    status: nextStatus,
    retry_count: (item[0]?.retry_count || 0) + 1,
    attempted_urls: allUrls,
    error_log: errMsg,
    current_agent: null,
  })
}

export async function markManualRequired(id: string, notes: string, triedUrls: string[]) {
  const item = await sbGet<QueueItem>('acquisition_queue', `id=eq.${id}`)
  const existing = item[0]?.attempted_urls || []
  await sbPatch('acquisition_queue', id, {
    status: 'manual_required',
    retry_count: (item[0]?.retry_count || 0) + 1,
    attempted_urls: [...new Set([...existing, ...triedUrls])],
    error_log: notes,
    current_agent: null,
  })
}
