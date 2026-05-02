// Agent 4: Forum Scraper — scrapes professional forums for real-world fault diagnoses
// Runs independently in parallel to document hunters.

import Anthropic from '@anthropic-ai/sdk'
import { sleep, sbPost, sbUpsert, SUPABASE_URL, SUPABASE_KEY } from './shared'
import { scrapeUrl } from '@/skills/web-learning/scraper'
import { classifyForum } from '@/skills/web-learning/classifier'
import { buildForumMarkdown, buildFolderPath, buildFilename } from '@/skills/web-learning/extractor'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Forum sources with their search patterns
const FORUM_SOURCES = [
  {
    name: 'HeavyEquipmentForums',
    searchUrl: (q: string) => `https://www.heavyequipmentforums.com/search?q=${encodeURIComponent(q)}&forums[]=14`,
    threadPattern: /heavyequipmentforums\.com\/threads\//,
  },
  {
    name: 'Reddit_HeavyEquipment',
    searchUrl: (q: string) => `https://www.reddit.com/r/HeavyEquipment/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&limit=10`,
    isJson: true,
  },
  {
    name: 'Reddit_Construction',
    searchUrl: (q: string) => `https://www.reddit.com/r/Construction/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&limit=5`,
    isJson: true,
  },
]

const AWP_SEARCH_QUERIES = [
  'JLG fault code repair',
  'Genie scissor lift troubleshoot',
  'boom lift hydraulic problem',
  'scissor lift electrical fault',
  'JLG 1932 error',
  'Genie GS2032 fault',
  'aerial lift won\'t drive',
  'boom lift platform won\'t raise',
  'JLG diagnostic fault',
  'Genie fault code fix',
  'Dingli scissor fault',
  'aerial work platform repair',
]

const BRAND_MODEL_QUERIES = [
  { brand: 'JLG', queries: ['JLG 1932 fault', 'JLG 2032 repair', 'JLG 3246 problem', 'JLG 520AJ fault', 'JLG 860SJ troubleshoot'] },
  { brand: 'Genie', queries: ['Genie GS1932 fault', 'Genie GS3246 repair', 'Genie Z3420 problem', 'Genie Z5122 fault'] },
  { brand: 'Dingli', queries: ['Dingli scissor lift fault', 'JCPT fault code', 'Dingli platform problem'] },
  { brand: 'Manitou', queries: ['Manitou MRT fault', 'Manitou 2150 repair', 'Manitou telehandler problem'] },
]

interface RedditPost {
  data: {
    children: Array<{
      data: {
        title: string
        selftext: string
        url: string
        permalink: string
        score: number
        num_comments: number
      }
    }>
  }
}

async function scrapeRedditSearch(searchUrl: string, sourceName: string): Promise<number> {
  let saved = 0
  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'AWPKnowledgeBot/1.0 (educational research)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return 0
    const data: RedditPost = await res.json()
    const posts = data?.data?.children || []

    for (const post of posts.slice(0, 8)) {
      const { title, selftext, permalink, score } = post.data
      if (!selftext || selftext.length < 100) continue
      if (score < 2) continue

      const threadUrl = `https://reddit.com${permalink}`
      const combined = `${title}\n\n${selftext}`
      const classified = await classifyForum(combined)

      if (classified.confidence < 2) continue
      if (!classified.symptom || classified.symptom.length < 20) continue

      const md = buildForumMarkdown({
        title,
        url: threadUrl,
        source: sourceName,
        brand: classified.brand,
        model: classified.model,
        system: classified.system,
        fault_code: classified.fault_code,
        symptom: classified.symptom,
        solution: classified.solution,
        mechanic_advice: classified.mechanic_advice,
        confidence: classified.confidence,
        quality: classified.quality,
        scraped_at: new Date().toISOString(),
      })

      const folderPath = buildFolderPath(classified.brand, classified.model)
      const filename = buildFilename(classified.system, title)
      const savedPath = `Forums/${folderPath}/${filename}`

      await sbUpsert('community_knowledge', {
        source_url: threadUrl,
        source_name: sourceName,
        brand: classified.brand,
        model: classified.model,
        system_category: classified.system,
        fault_code: classified.fault_code,
        symptom: classified.symptom,
        solution: classified.solution,
        mechanic_advice: classified.mechanic_advice,
        full_thread_markdown: md,
        confidence: classified.confidence,
        quality: classified.quality,
        language: 'en',
        scraped_at: new Date().toISOString(),
        saved_path: savedPath,
      }, 'source_url')

      saved++
      await sleep(1000)
    }
  } catch (e) {
    console.error(`Reddit scrape error (${sourceName}):`, e)
  }
  return saved
}

async function scrapeHeavyEquipmentForums(query: string): Promise<number> {
  let saved = 0
  try {
    const searchUrl = `https://www.heavyequipmentforums.com/search?q=${encodeURIComponent(query)}&forums[]=14`
    const result = await scrapeUrl(searchUrl)
    await sleep(3000)

    if (!result.text) return 0

    // Extract thread links
    const threadLinks = (result.links || []).filter(l =>
      l.includes('heavyequipmentforums.com/threads/')
    ).slice(0, 5)

    for (const threadUrl of threadLinks) {
      const thread = await scrapeUrl(threadUrl)
      await sleep(3000)
      if (!thread.text || thread.text.length < 300) continue

      const title = thread.title || query
      const classified = await classifyForum(`${title}\n\n${thread.text}`)

      if (classified.confidence < 2) continue

      const md = buildForumMarkdown({
        title,
        url: threadUrl,
        source: 'HeavyEquipmentForums',
        brand: classified.brand,
        model: classified.model,
        system: classified.system,
        fault_code: classified.fault_code,
        symptom: classified.symptom,
        solution: classified.solution,
        mechanic_advice: classified.mechanic_advice,
        confidence: classified.confidence,
        quality: classified.quality,
        scraped_at: new Date().toISOString(),
      })

      const folderPath = buildFolderPath(classified.brand, classified.model)
      const filename = buildFilename(classified.system, title)

      await sbUpsert('community_knowledge', {
        source_url: threadUrl,
        source_name: 'HeavyEquipmentForums',
        brand: classified.brand,
        model: classified.model,
        system_category: classified.system,
        fault_code: classified.fault_code,
        symptom: classified.symptom,
        solution: classified.solution,
        mechanic_advice: classified.mechanic_advice,
        full_thread_markdown: md,
        confidence: classified.confidence,
        quality: classified.quality,
        language: 'en',
        scraped_at: new Date().toISOString(),
        saved_path: `Forums/${folderPath}/${filename}`,
      }, 'source_url')

      saved++
    }
  } catch (e) {
    console.error('HeavyEquipmentForums scrape error:', e)
  }
  return saved
}

export async function runForumScraper(options?: { limit?: number }): Promise<{ saved: number; sources: Record<string, number> }> {
  const sources: Record<string, number> = {}
  let totalSaved = 0
  const maxQueries = options?.limit || AWP_SEARCH_QUERIES.length

  // Mode A: Brand+Model specific queries
  for (const brandGroup of BRAND_MODEL_QUERIES) {
    for (const query of brandGroup.queries.slice(0, 3)) {
      // Reddit
      const redditUrl = `https://www.reddit.com/r/HeavyEquipment/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=8`
      const n = await scrapeRedditSearch(redditUrl, 'Reddit_HeavyEquipment')
      sources['Reddit_HeavyEquipment'] = (sources['Reddit_HeavyEquipment'] || 0) + n
      totalSaved += n
      await sleep(3000)
    }
  }

  // Mode B: General AWP queries
  for (const query of AWP_SEARCH_QUERIES.slice(0, maxQueries)) {
    // Reddit r/Construction
    const constructionUrl = `https://www.reddit.com/r/Construction/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=5`
    const n = await scrapeRedditSearch(constructionUrl, 'Reddit_Construction')
    sources['Reddit_Construction'] = (sources['Reddit_Construction'] || 0) + n
    totalSaved += n
    await sleep(2000)
  }

  // HeavyEquipmentForums (throttled)
  for (const query of AWP_SEARCH_QUERIES.slice(0, 5)) {
    const n = await scrapeHeavyEquipmentForums(query)
    sources['HeavyEquipmentForums'] = (sources['HeavyEquipmentForums'] || 0) + n
    totalSaved += n
    await sleep(30000) // 30s between sites as per spec
  }

  return { saved: totalSaved, sources }
}
