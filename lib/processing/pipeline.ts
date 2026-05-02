import { getUnprocessedDocs } from './db'
import { processLayer1 } from './layer1_structural'
import { processLayer2 } from './layer2_visual'
import { processLayer3 } from './layer3_chunks'
import { processLayer4 } from './layer4_entities'
import { processLayer5 } from './layer5_relationships'
import { processLayer6 } from './layer6_faults'
import { processLayer7 } from './layer7_index'
import type { Document, ProcessingResult } from './types'

type LayerFn = (doc: Document) => Promise<ProcessingResult>

const LAYERS: LayerFn[] = [
  processLayer1,
  processLayer2,
  processLayer3,
  processLayer4,
  processLayer5,
  processLayer6,
  processLayer7,
]

export async function runLayer(layer: number, batchSize = 5): Promise<{
  processed: number
  errors: number
  totalCostCents: number
  results: Array<{ docId: string; success: boolean; error?: string }>
}> {
  if (layer < 1 || layer > 7) throw new Error(`Invalid layer: ${layer}`)
  const layerFn = LAYERS[layer - 1]
  const docs = await getUnprocessedDocs(layer, batchSize)

  let processed = 0
  let errors = 0
  let totalCostCents = 0
  const results = []

  // Process sequentially to avoid rate limits
  for (const doc of docs) {
    const result = await layerFn(doc)
    if (result.success) processed++
    else errors++
    totalCostCents += result.costCents
    results.push({ docId: doc.id, success: result.success, error: result.error })
  }

  return { processed, errors, totalCostCents, results }
}
