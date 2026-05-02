-- Enable pgvector extension (needed for community_knowledge embeddings)
create extension if not exists vector;

-- Queue for the acquisition system
create table if not exists acquisition_queue (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  category int not null,
  category_name text,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','failed','manual_required')),
  current_agent text check (current_agent in ('oem','distributor','archive',null)),
  retry_count int default 0,
  attempted_urls jsonb default '[]'::jsonb,
  error_log text,
  found_url text,
  saved_path text,
  file_size_bytes int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists acquisition_queue_status_idx on acquisition_queue(status);
create index if not exists acquisition_queue_brand_model_idx on acquisition_queue(brand, model);
create index if not exists acquisition_queue_pending_idx on acquisition_queue(status, retry_count) where status = 'pending';

alter table acquisition_queue enable row level security;
create policy "All access acquisition_queue" on acquisition_queue for all using (true);

-- Community knowledge from forums and web sources
create table if not exists community_knowledge (
  id uuid primary key default gen_random_uuid(),
  source_url text unique not null,
  source_name text,
  brand text,
  model text,
  system_category text,
  fault_code text,
  symptom text,
  solution text,
  mechanic_advice jsonb default '[]'::jsonb,
  full_thread_markdown text,
  confidence int check (confidence between 1 and 5),
  quality int check (quality between 1 and 5),
  local_score int default 0,
  language text default 'en',
  embedding vector(1536),
  scraped_at timestamptz default now(),
  saved_path text
);

create index if not exists community_knowledge_brand_model_idx on community_knowledge(brand, model);
create index if not exists community_knowledge_fault_code_idx on community_knowledge(fault_code);
create index if not exists community_knowledge_system_idx on community_knowledge(system_category);
create index if not exists community_knowledge_quality_idx on community_knowledge(quality, confidence) where quality >= 3;
create index if not exists community_knowledge_symptom_idx on community_knowledge using gin(to_tsvector('simple', coalesce(symptom,'')));
create index if not exists community_knowledge_solution_idx on community_knowledge using gin(to_tsvector('simple', coalesce(solution,'')));

alter table community_knowledge enable row level security;
create policy "All access community_knowledge" on community_knowledge for all using (true);

-- Trigger to auto-update updated_at on acquisition_queue
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger acquisition_queue_updated_at
  before update on acquisition_queue
  for each row execute function update_updated_at_column();
