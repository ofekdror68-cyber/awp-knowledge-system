-- Enable pgvector
create extension if not exists vector;

-- Machines
create table if not exists machines (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('JLG','Manitou','Dingli','Genie','אחר')),
  model text not null,
  serial_number text,
  year int,
  notes text,
  hours_current int default 0,
  hours_last_service int default 0,
  last_service_date date,
  next_service_due_date date,
  next_service_due_hours int,
  status text default 'תקין' check (status in ('תקין','דורש טיפול','בטיפול','מושבת')),
  created_at timestamptz default now()
);

-- Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  machine_brand text,
  machine_model text,
  doc_type text check (doc_type in ('manual','schematic','parts_catalog','fault_codes','other')),
  title text not null,
  file_url text,
  uploaded_at timestamptz default now()
);

-- Document chunks with embeddings
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  page_number int,
  created_at timestamptz default now()
);

-- Create vector index
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Parts
create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  brand text,
  model_compatibility text[] default '{}',
  part_number text,
  description text not null,
  image_url text,
  location_description text,
  created_at timestamptz default now()
);

-- Faults
create table if not exists faults (
  id uuid primary key default gen_random_uuid(),
  machine_brand text,
  machine_model text,
  fault_code text,
  symptoms text not null,
  solution text not null,
  source text default 'internal' check (source in ('internal','internet','learned','manual')),
  times_used int default 0,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Fault feedback (self-learning)
create table if not exists fault_feedback (
  id uuid primary key default gen_random_uuid(),
  fault_id uuid references faults(id) on delete set null,
  how_was_solved text not null,
  worked boolean default true,
  machine_brand text,
  machine_model text,
  original_symptoms text,
  created_at timestamptz default now()
);

-- Web knowledge
create table if not exists web_knowledge (
  id uuid primary key default gen_random_uuid(),
  url text,
  title text,
  content_summary text not null,
  brands_mentioned text[] default '{}',
  embedding vector(1536),
  scraped_at timestamptz default now()
);

create index if not exists web_knowledge_embedding_idx
  on web_knowledge using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Maintenance schedules
create table if not exists maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references machines(id) on delete cascade,
  interval_type text not null check (interval_type in ('50h','100h','250h','500h','1000h','annual')),
  tasks jsonb not null default '[]',
  created_at timestamptz default now(),
  unique(machine_id, interval_type)
);

-- Service logs
create table if not exists service_logs (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references machines(id) on delete cascade,
  date date not null default current_date,
  technician_name text,
  hours_at_service int,
  service_type text check (service_type in ('תקופתי','תיקון','החלפת חלק','בדיקה')),
  checklist_completed jsonb default '[]',
  parts_replaced jsonb default '[]',
  notes text,
  next_service_hours int,
  next_service_date date,
  created_at timestamptz default now()
);

-- Function for semantic search on document chunks
create or replace function search_document_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  page_number int,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.page_number,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- Function for semantic search on web knowledge
create or replace function search_web_knowledge(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  url text,
  title text,
  content_summary text,
  similarity float
)
language sql stable
as $$
  select
    wk.id,
    wk.url,
    wk.title,
    wk.content_summary,
    1 - (wk.embedding <=> query_embedding) as similarity
  from web_knowledge wk
  where wk.embedding is not null
    and 1 - (wk.embedding <=> query_embedding) > match_threshold
  order by wk.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS
alter table machines enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table parts enable row level security;
alter table faults enable row level security;
alter table fault_feedback enable row level security;
alter table web_knowledge enable row level security;
alter table maintenance_schedules enable row level security;
alter table service_logs enable row level security;

-- Open policies (internal tool, no user auth required)
create policy "allow all" on machines for all using (true) with check (true);
create policy "allow all" on documents for all using (true) with check (true);
create policy "allow all" on document_chunks for all using (true) with check (true);
create policy "allow all" on parts for all using (true) with check (true);
create policy "allow all" on faults for all using (true) with check (true);
create policy "allow all" on fault_feedback for all using (true) with check (true);
create policy "allow all" on web_knowledge for all using (true) with check (true);
create policy "allow all" on maintenance_schedules for all using (true) with check (true);
create policy "allow all" on service_logs for all using (true) with check (true);
