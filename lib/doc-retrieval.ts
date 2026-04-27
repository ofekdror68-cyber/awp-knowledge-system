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

/** Get document chunks for a specific model — max 5 most relevant */
export async function getModelDocs(model: string, docType?: string): Promise<string> {
  try {
    // Step 1: get document IDs for this model
    let docsUrl = `${SUPABASE_URL}/rest/v1/documents?select=id&machine_model=eq.${encodeURIComponent(model)}`
    if (docType) docsUrl += `&doc_type=eq.${docType}`
    const docsRes = await fetch(docsUrl, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    if (!docsRes.ok) return ''
    const docs: { id: string }[] = await docsRes.json()
    if (!docs?.length) return ''

    // Step 2: fetch chunks for those document IDs
    const ids = docs.map(d => d.id).join(',')
    const chunksUrl = `${SUPABASE_URL}/rest/v1/document_chunks?select=content&document_id=in.(${ids})&limit=5`
    const chunksRes = await fetch(chunksUrl, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    if (!chunksRes.ok) return ''
    const chunks: { content: string }[] = await chunksRes.json()
    if (!chunks?.length) return ''

    return chunks.map(c => c.content.substring(0, 800)).join('\n---\n')
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

/** Get web knowledge for a model or brand — sourced by daily enrichment agent */
export async function getWebKnowledge(query: string, model: string | null): Promise<string> {
  try {
    const results: { title: string; content_summary: string; reliability_score: number | null }[] = []

    // Search by model name if known
    if (model) {
      const modelRes = await fetch(
        `${SUPABASE_URL}/rest/v1/web_knowledge?equipment_model=ilike.*${encodeURIComponent(model)}*&order=reliability_score.desc&limit=3&select=title,content_summary,reliability_score`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (modelRes.ok) {
        const data = await modelRes.json()
        if (Array.isArray(data)) results.push(...data)
      }
    }

    // Also search content_summary for query keywords (up to 30 chars)
    if (results.length < 3) {
      const keyword = encodeURIComponent(query.substring(0, 30).trim())
      const kwRes = await fetch(
        `${SUPABASE_URL}/rest/v1/web_knowledge?content_summary=ilike.*${keyword}*&order=reliability_score.desc&limit=3&select=title,content_summary,reliability_score`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (kwRes.ok) {
        const data = await kwRes.json()
        if (Array.isArray(data)) {
          for (const item of data) {
            if (!results.find(r => r.title === item.title)) results.push(item)
          }
        }
      }
    }

    if (!results.length) return ''

    const lines = results.slice(0, 4).map(r => {
      const trust = r.reliability_score && r.reliability_score >= 0.8 ? '✓ מקור מהימן' : '⚠ מקור חיצוני'
      return `[${trust}] ${r.title}\n${r.content_summary.substring(0, 600)}`
    })

    return '## ידע מהאינטרנט (נאסף אוטומטית):\n' + lines.join('\n---\n')
  } catch { return '' }
}
