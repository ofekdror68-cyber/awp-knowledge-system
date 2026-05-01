-- document_pages: vision-analyzed PDF pages (schematics, electrical diagrams, etc.)
CREATE TABLE IF NOT EXISTS document_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  page_number int NOT NULL,
  page_type text CHECK (page_type IN ('text', 'schematic_electrical', 'schematic_hydraulic', 'parts_diagram', 'mixed')),
  extracted_text text,
  schematic_description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_pages_document_idx ON document_pages(document_id);
CREATE INDEX IF NOT EXISTS document_pages_type_idx ON document_pages(page_type);
CREATE INDEX IF NOT EXISTS document_pages_schematic_idx ON document_pages(page_type) WHERE page_type != 'text';

ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All access document_pages" ON document_pages FOR ALL USING (true);

-- repair_history: self-growing repair memory
CREATE TABLE IF NOT EXISTS repair_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_model text,
  serial_number text,
  system_category text CHECK (system_category IN ('הנעה', 'הידראוליקה', 'חשמל', 'בקרה', 'בטיחות', 'מנוע', 'אחר')),
  symptom text NOT NULL,
  clarifying_qa jsonb DEFAULT '[]',
  diagnosis_given text,
  actual_fix text,
  worked boolean,
  technician_notes text,
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS repair_history_model_idx ON repair_history(machine_model);
CREATE INDEX IF NOT EXISTS repair_history_system_idx ON repair_history(system_category);
CREATE INDEX IF NOT EXISTS repair_history_worked_idx ON repair_history(worked) WHERE worked = true;
CREATE INDEX IF NOT EXISTS repair_history_symptom_idx ON repair_history USING gin(to_tsvector('simple', symptom));

ALTER TABLE repair_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All access repair_history" ON repair_history FOR ALL USING (true);

-- Add vision_analyzed flag to documents so we know which ones were processed
ALTER TABLE documents ADD COLUMN IF NOT EXISTS vision_analyzed boolean DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_count int;
