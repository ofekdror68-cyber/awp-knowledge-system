/**
 * Smart document retrieval:
 * - Extracts model name from user query
 * - Fetches ONLY the relevant document chunks for that model
 * - Token-efficient: ~500 tokens per query instead of thousands
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Known models from the Manuals/ folder structure
const KNOWN_MODELS = [
  // Dingli
  'JCPT0607DCM','JCPT1208AC','JCPT1008AC','JCPT1412AC','JCPT0807AC','JCPT0708DCM','JCPT1212AC',
  // JLG
  'ES1930','2E2032','2E2646','520AJ','2E1932','860SJ','510AJ','450AJ','3246E',
]

/** Extract model name from user query */
export function extractModel(query: string): string | null {
  // Direct match with known models
  const upper = query.toUpperCase().replace(/\s+/g, '')
  for (const model of KNOWN_MODELS) {
    if (upper.includes(model.toUpperCase())) return model
  }
  // Pattern match: letter/digit sequences 4+ chars (e.g. "860SJ", "JCPT1412")
  const match = query.match(/\b([A-Z]{1,4}[0-9]{2,6}[A-Z]{0,3}|[0-9]{2,4}[A-Z]{2,4})\b/i)
  return match ? match[1].toUpperCase() : null
}

/** Get document chunks for a specific model — max 3 most relevant */
export async function getModelDocs(model: string, docType?: string): Promise<string> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/document_chunks?select=content,documents!inner(machine_model,doc_type,title)&documents.machine_model=eq.${encodeURIComponent(model)}&limit=3`
    if (docType) url += `&documents.doc_type=eq.${docType}`

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    if (!res.ok) return ''
    const data = await res.json()
    if (!data?.length) return ''

    return data.map((c: { content: string }) => c.content.substring(0, 800)).join('\n---\n')
  } catch {
    return ''
  }
}

/** Choose model based on query type — token-efficient selection */
export function chooseModel(query: string, hasImage: boolean): 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' {
  // Use Sonnet only for: images, complex diagnostics, multi-step repairs
  if (hasImage) return 'claude-sonnet-4-6'
  const complex = /תיקון מורכב|fault code|error code|אבחון|diagram|wiring|hydraulic|הידראולי|electrical|חשמל/i
  if (complex.test(query)) return 'claude-sonnet-4-6'
  return 'claude-haiku-4-5-20251001' // default: cheap + fast
}

/** Get learned solutions for similar symptoms */
export async function getLearnedSolutions(query: string): Promise<string> {
  try {
    const keyword = encodeURIComponent(query.substring(0, 25))
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/fault_feedback?how_was_solved=ilike.*${keyword}*&worked=eq.true&select=how_was_solved&limit=2`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    if (!data?.length) return ''
    return '## פתרונות שעבדו בשטח:\n' + data.map((f: { how_was_solved: string }) => `"${f.how_was_solved}"`).join('\n')
  } catch { return '' }
}
