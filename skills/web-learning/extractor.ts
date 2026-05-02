// Extractor — pulls PDF text and prepares content for classification

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    // pdf-parse v2 exports directly (no .default)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfModule = await import('pdf-parse') as any
    const pdfParse = pdfModule.default ?? pdfModule
    const data = await pdfParse(Buffer.from(buffer), { max: 10 })
    return data.text?.substring(0, 8000) || ''
  } catch {
    return ''
  }
}

export function buildForumMarkdown(params: {
  title: string
  url: string
  source: string
  brand: string | null
  model: string | null
  system: string
  fault_code: string | null
  symptom: string
  solution: string | null
  mechanic_advice: string[]
  confidence: number
  quality: number
  scraped_at: string
}): string {
  const lines = [
    `# ${params.title}`,
    '',
    `**Source:** [${params.source}](${params.url})`,
    `**Scraped:** ${params.scraped_at}`,
    `**Brand:** ${params.brand || 'Unknown'} | **Model:** ${params.model || 'General'}`,
    `**System:** ${params.system} | **Fault Code:** ${params.fault_code || 'N/A'}`,
    `**Confidence:** ${params.confidence}/5 | **Quality:** ${params.quality}/5`,
    '',
    '## Symptom',
    params.symptom,
    '',
    '## Solution',
    params.solution || '*No confirmed solution in thread*',
    '',
  ]

  if (params.mechanic_advice.length > 0) {
    lines.push('## Mechanic Tips')
    for (const tip of params.mechanic_advice) {
      lines.push(`- ${tip}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function buildFolderPath(brand: string | null, model: string | null): string {
  if (brand && model && model !== 'general' && model !== 'General') {
    const safeBrand = brand.replace(/[^a-zA-Z0-9]/g, '')
    const safeModel = model.replace(/[^a-zA-Z0-9]/g, '_')
    return `by-model/${safeBrand}_${safeModel}`
  }
  if (brand) {
    const safeBrand = brand.replace(/[^a-zA-Z0-9]/g, '')
    return `general/${safeBrand}_general`
  }
  return 'general/mixed'
}

export function buildFilename(system: string, title: string): string {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, 50)
  return `fault_${system}_${safeTitle}.md`
}
