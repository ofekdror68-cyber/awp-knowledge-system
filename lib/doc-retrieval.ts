const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const KNOWN_MODELS = [
  'JCPT0607DCM','JCPT1208AC','JCPT1008AC','JCPT1412AC','JCPT0807AC','JCPT0708DCM','JCPT1212AC',
  'ES1930','2E2032','2E2646','520AJ','2E1932','860SJ','510AJ','450AJ','3246E',
  'GS1932','GS2032','GS3246','Z3420N','Z4525J','Z5122RT',
  'MRT2150','MRT2550','180ATJ',
  'BT','BT Prime Mover',
]

export function extractModel(query: string): string | null {
  const upper = query.toUpperCase().replace(/\s+/g, '')
  for (const model of KNOWN_MODELS) {
    if (upper.includes(model.toUpperCase().replace(/\s+/g, ''))) return model
  }
  const match = query.match(/\b([A-Z]{1,4}[0-9]{2,6}[A-Z]{0,3}|[0-9]{2,4}[A-Z]{2,4})\b/i)
  return match ? match[1].toUpperCase() : null
}

export function isSchematicQuestion(query: string): boolean {
  return /סכמ|שמאטי|diagram|wiring|הידראולי|hydraulic|חשמל|electrical|circuit|וואיר|פיוז|relay|רלי|solenoid|סולנו|rite|circuit/i.test(query)
}

export async function getModelDocs(model: string): Promise<string> {
  try {
    const docsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?select=id,title&machine_model=eq.${encodeURIComponent(model)}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!docsRes.ok) return ''
    const docs: { id: string; title: string }[] = await docsRes.json()
    if (!docs?.length) return ''

    const ids = docs.map(d => d.id).join(',')
    const chunksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/document_chunks?select=content,page_number&document_id=in.(${ids})&limit=6`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!chunksRes.ok) return ''
    const chunks: { content: string; page_number: number | null }[] = await chunksRes.json()
    if (!chunks?.length) return ''

    const docTitles = docs.map(d => d.title).join(', ')
    return `מסמכים: ${docTitles}\n` + chunks.map(c => {
      const page = c.page_number ? ` [עמ' ${c.page_number}]` : ''
      return c.content.substring(0, 800) + page
    }).join('\n---\n')
  } catch { return '' }
}

export async function getSchematicPages(model: string | null): Promise<{ description: string; pageRef: string }[]> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/document_pages?select=schematic_description,page_number,page_type,document_id&page_type=neq.text&limit=5`
    if (model) {
      // Join via documents table
      const docsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?select=id&machine_model=eq.${encodeURIComponent(model)}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (docsRes.ok) {
        const docs: { id: string }[] = await docsRes.json()
        if (docs.length) {
          const ids = docs.map(d => d.id).join(',')
          url = `${SUPABASE_URL}/rest/v1/document_pages?select=schematic_description,page_number,page_type,document_id&page_type=neq.text&document_id=in.(${ids})&limit=5`
        }
      }
    }
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
    if (!res.ok) return []
    const pages: { schematic_description: string | null; page_number: number; page_type: string }[] = await res.json()
    return pages
      .filter(p => p.schematic_description)
      .map(p => ({
        description: p.schematic_description!,
        pageRef: `עמ' ${p.page_number} (${p.page_type.replace('_', ' ')})`,
      }))
  } catch { return [] }
}

export async function getRepairHistory(model: string | null, symptom: string): Promise<string> {
  try {
    const results: { machine_model: string | null; symptom: string; actual_fix: string; worked: boolean }[] = []

    if (model) {
      const modelRes = await fetch(
        `${SUPABASE_URL}/rest/v1/repair_history?select=machine_model,symptom,actual_fix,worked&machine_model=eq.${encodeURIComponent(model)}&worked=eq.true&actual_fix=not.is.null&limit=3&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (modelRes.ok) {
        const data = await modelRes.json()
        if (Array.isArray(data)) results.push(...data)
      }
    }

    if (results.length < 2 && symptom.length > 5) {
      const kw = encodeURIComponent(symptom.substring(0, 20))
      const sympRes = await fetch(
        `${SUPABASE_URL}/rest/v1/repair_history?select=machine_model,symptom,actual_fix,worked&symptom=ilike.*${kw}*&worked=eq.true&actual_fix=not.is.null&limit=3&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (sympRes.ok) {
        const data = await sympRes.json()
        if (Array.isArray(data)) {
          for (const item of data) {
            if (!results.find(r => r.symptom === item.symptom)) results.push(item)
          }
        }
      }
    }

    if (!results.length) return ''
    return '## תיקונים שעבדו בעבר:\n' + results.slice(0, 3).map(r =>
      `תסמין: "${r.symptom.substring(0, 80)}" → פתרון: "${(r.actual_fix || '').substring(0, 200)}"${r.machine_model ? ` (${r.machine_model})` : ''}`
    ).join('\n')
  } catch { return '' }
}

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

export async function getWebKnowledge(query: string, model: string | null): Promise<string> {
  try {
    const results: { title: string; content_summary: string; reliability_score: number | null }[] = []

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
    const lines = results.slice(0, 3).map(r => {
      const trust = r.reliability_score && r.reliability_score >= 0.8 ? '✓ מקור מהימן' : '⚠ מקור חיצוני'
      return `[${trust}] ${r.title}\n${r.content_summary.substring(0, 500)}`
    })
    return '## ידע מהאינטרנט:\n' + lines.join('\n---\n')
  } catch { return '' }
}

export function chooseModel(query: string, hasImage: boolean): 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' {
  if (hasImage) return 'claude-sonnet-4-6'
  const complex = /תיקון מורכב|fault code|error code|אבחון|diagram|wiring|hydraulic|הידראולי|electrical|חשמל|סכמ/i
  if (complex.test(query)) return 'claude-sonnet-4-6'
  return 'claude-haiku-4-5-20251001'
}

export async function getDocumentStats(): Promise<{ count: number; lastUpload: string | null }> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?select=uploaded_at&order=uploaded_at.desc&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact', Range: '0-0' } }
    )
    const lastDoc = res.ok ? await res.json() : []
    const countHeader = countRes.headers.get('content-range')
    const count = countHeader ? parseInt(countHeader.split('/')[1] || '0') : 0
    return { count, lastUpload: lastDoc[0]?.uploaded_at || null }
  } catch { return { count: 0, lastUpload: null } }
}
