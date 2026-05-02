import { NextRequest, NextResponse } from 'next/server'
import { sbGet, SUPABASE_URL, SUPABASE_KEY } from '@/agents/shared'

export const maxDuration = 30

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')
  const model = searchParams.get('model')
  const system = searchParams.get('system')
  const faultCode = searchParams.get('fault_code')
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '0')

  const params: string[] = [
    `quality=gte.2`,
    `confidence=gte.2`,
    `order=quality.desc,confidence.desc,local_score.desc`,
    `limit=${limit}`,
    `offset=${page * limit}`,
    `select=id,source_url,source_name,brand,model,system_category,fault_code,symptom,solution,mechanic_advice,confidence,quality,local_score,scraped_at`,
  ]

  if (brand) params.push(`brand=eq.${encodeURIComponent(brand)}`)
  if (model) params.push(`model=ilike.*${encodeURIComponent(model)}*`)
  if (system) params.push(`system_category=eq.${encodeURIComponent(system)}`)
  if (faultCode) params.push(`fault_code=ilike.*${encodeURIComponent(faultCode)}*`)

  if (q) {
    // Full-text search on symptom + solution
    const kw = encodeURIComponent(q.substring(0, 50))
    const [symptomRes, solutionRes] = await Promise.all([
      sbGet('community_knowledge', `symptom=ilike.*${kw}*&quality=gte.2&confidence=gte.2&select=id,source_url,source_name,brand,model,system_category,fault_code,symptom,solution,mechanic_advice,confidence,quality,local_score,scraped_at&limit=${limit}`),
      sbGet('community_knowledge', `solution=ilike.*${kw}*&quality=gte.2&confidence=gte.2&select=id,source_url,source_name,brand,model,system_category,fault_code,symptom,solution,mechanic_advice,confidence,quality,local_score,scraped_at&limit=${limit}`),
    ])
    const combined = [...symptomRes, ...(solutionRes as unknown[])]
    const seen = new Set<string>()
    const unique = combined.filter((item: unknown) => {
      const id = (item as { id: string }).id
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
    return NextResponse.json({ items: unique.slice(0, limit), total: unique.length })
  }

  const items = await sbGet('community_knowledge', params.join('&'))

  // Get total count
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/community_knowledge?${params.slice(0, -3).join('&')}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact', Range: '0-0' },
  })
  const total = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0')

  return NextResponse.json({ items, total })
}

// Search community knowledge for chat integration
export async function POST(req: NextRequest) {
  const { query, brand, model, faultCode } = await req.json()

  const results: unknown[] = []

  if (faultCode) {
    const byFault = await sbGet('community_knowledge',
      `fault_code=ilike.*${encodeURIComponent(faultCode)}*&confidence=gte.3&quality=gte.3&limit=3&select=source_name,source_url,brand,model,fault_code,symptom,solution,mechanic_advice,confidence`)
    results.push(...byFault)
  }

  if (model && results.length < 5) {
    const byModel = await sbGet('community_knowledge',
      `model=ilike.*${encodeURIComponent(model)}*&confidence=gte.3&quality=gte.3&limit=3&select=source_name,source_url,brand,model,fault_code,symptom,solution,mechanic_advice,confidence`)
    results.push(...(byModel as unknown[]))
  }

  if (query && results.length < 5) {
    const kw = encodeURIComponent(query.substring(0, 40))
    const bySymptom = await sbGet('community_knowledge',
      `symptom=ilike.*${kw}*&confidence=gte.2&quality=gte.2&limit=3&select=source_name,source_url,brand,model,fault_code,symptom,solution,mechanic_advice,confidence`)
    results.push(...(bySymptom as unknown[]))
  }

  // Deduplicate
  const seen = new Set<string>()
  const unique = results.filter((item: unknown) => {
    const url = (item as { source_url: string }).source_url
    if (seen.has(url)) return false
    seen.add(url)
    return true
  })

  return NextResponse.json({ items: unique.slice(0, 5) })
}
