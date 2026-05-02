export interface ProcessingResult {
  success: boolean
  error?: string
  itemsProcessed: number
  costCents: number
}

export interface DocPage {
  id?: string
  document_id: string
  page_number: number
  raw_text: string
  page_type?: string
  visual_description?: string
  components_detected?: unknown
  wires_detected?: unknown
  fault_codes_on_page?: string[]
  systems_referenced?: string[]
  cross_refs?: unknown
  key_specs?: unknown
  warnings?: string[]
  language?: string
  page_image_url?: string
}

export interface DocChunk {
  document_id: string
  page_ids?: string[]
  chunk_type: string
  title?: string
  content: string
  summary?: string
  context_before?: string
  context_after?: string
  related_components?: string[]
  related_systems?: string[]
  importance_score?: number
}

export interface KbEntity {
  entity_type: string
  brand?: string
  model?: string
  name: string
  aliases?: string[]
  description?: string
  attributes?: Record<string, unknown>
  source_doc_ids?: string[]
  confidence?: number
}

export interface FaultIntelligence {
  brand?: string
  model?: string
  fault_code?: string
  fault_description?: string
  symptoms?: string[]
  affected_systems?: string[]
  possible_causes?: unknown
  diagnostic_sequence?: unknown
  required_tools?: string[]
  estimated_repair_time_minutes?: number
  estimated_cost_range?: string
  safety_warnings?: string[]
  common_misdiagnosis?: string
  tribal_knowledge?: string
  source_type?: string
  source_ids?: string[]
  confidence?: number
}

export interface ProcessingState {
  document_id: string
  layer_1_done: boolean
  layer_2_done: boolean
  layer_3_done: boolean
  layer_4_done: boolean
  layer_5_done: boolean
  layer_6_done: boolean
  layer_7_done: boolean
  quarantined: boolean
  attempts: number
  last_error?: string
  total_pages?: number
  total_chunks?: number
  total_entities?: number
  cost_usd_cents?: number
}

export interface Document {
  id: string
  machine_brand?: string
  machine_model?: string
  doc_type?: string
  title: string
  file_url?: string
  page_count?: number
}
