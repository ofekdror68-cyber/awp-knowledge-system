-- Deep Understanding Pipeline: 7-layer knowledge graph

create extension if not exists vector;
create extension if not exists pg_trgm;

-- Layer 1+2: doc_pages
create table if not exists doc_pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  page_number int not null,
  page_image_url text,
  page_type text check (page_type in (
    'text','schematic_electrical','schematic_hydraulic','parts_diagram',
    'table','fault_code_list','procedure','cover','index','mixed'
  )),
  raw_text text,
  visual_description text,
  components_detected jsonb,
  wires_detected jsonb,
  fault_codes_on_page text[],
  systems_referenced text[],
  cross_refs jsonb,
  key_specs jsonb,
  warnings text[],
  language text,
  embedding_text vector(1536),
  created_at timestamptz default now(),
  unique(document_id, page_number)
);
create index if not exists doc_pages_type_idx on doc_pages(page_type);
create index if not exists doc_pages_fault_codes_idx on doc_pages using gin(fault_codes_on_page);
create index if not exists doc_pages_systems_idx on doc_pages using gin(systems_referenced);
create index if not exists doc_pages_raw_text_idx on doc_pages using gin(to_tsvector('simple', coalesce(raw_text,'')));
create index if not exists doc_pages_document_idx on doc_pages(document_id);
alter table doc_pages enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='doc_pages' and policyname='allow all doc_pages') then
    create policy "allow all doc_pages" on doc_pages for all using (true) with check (true);
  end if;
end $$;

-- Layer 3: doc_chunks
create table if not exists doc_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  page_ids uuid[],
  chunk_type text check (chunk_type in (
    'procedure','spec','warning','fault_explanation',
    'component_description','schematic_legend','general'
  )),
  title text,
  content text not null,
  summary text,
  context_before text,
  context_after text,
  related_components text[],
  related_systems text[],
  importance_score int check (importance_score between 1 and 10),
  embedding vector(1536),
  created_at timestamptz default now()
);
create index if not exists doc_chunks_type_idx on doc_chunks(chunk_type);
create index if not exists doc_chunks_document_idx on doc_chunks(document_id);
create index if not exists doc_chunks_components_idx on doc_chunks using gin(related_components);
create index if not exists doc_chunks_systems_idx on doc_chunks using gin(related_systems);
create index if not exists doc_chunks_content_idx on doc_chunks using gin(to_tsvector('simple', content));
create index if not exists doc_chunks_embedding_idx on doc_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
alter table doc_chunks enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='doc_chunks' and policyname='allow all doc_chunks') then
    create policy "allow all doc_chunks" on doc_chunks for all using (true) with check (true);
  end if;
end $$;

-- Layer 4: kb_entities
create table if not exists kb_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in (
    'component','fault_code','procedure','spec','tool','fluid','fastener'
  )),
  brand text,
  model text,
  name text not null,
  aliases text[],
  description text,
  attributes jsonb,
  source_doc_ids uuid[],
  source_page_ids uuid[],
  confidence int check (confidence between 1 and 5),
  embedding vector(1536),
  created_at timestamptz default now()
);
create index if not exists kb_entities_type_idx on kb_entities(entity_type);
create index if not exists kb_entities_brand_model_idx on kb_entities(brand, model);
create index if not exists kb_entities_name_trgm_idx on kb_entities using gin(name gin_trgm_ops);
create index if not exists kb_entities_name_idx on kb_entities(name);
alter table kb_entities enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='kb_entities' and policyname='allow all kb_entities') then
    create policy "allow all kb_entities" on kb_entities for all using (true) with check (true);
  end if;
end $$;

-- Layer 5: kb_relationships
create table if not exists kb_relationships (
  id uuid primary key default gen_random_uuid(),
  from_entity_id uuid references kb_entities(id) on delete cascade,
  to_entity_id uuid references kb_entities(id) on delete cascade,
  relationship_type text check (relationship_type in (
    'causes','requires','controls','connects_to','part_of',
    'replaces','tested_by','located_at'
  )),
  strength int default 1,
  evidence_doc_ids uuid[],
  notes text,
  created_at timestamptz default now()
);
create index if not exists kb_rel_from_idx on kb_relationships(from_entity_id);
create index if not exists kb_rel_to_idx on kb_relationships(to_entity_id);
create index if not exists kb_rel_type_idx on kb_relationships(relationship_type);
alter table kb_relationships enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='kb_relationships' and policyname='allow all kb_relationships') then
    create policy "allow all kb_relationships" on kb_relationships for all using (true) with check (true);
  end if;
end $$;

-- Layer 6: fault_intelligence
create table if not exists fault_intelligence (
  id uuid primary key default gen_random_uuid(),
  brand text,
  model text,
  model_pattern text,
  fault_code text,
  fault_description text,
  symptoms text[],
  affected_systems text[],
  possible_causes jsonb,
  diagnostic_sequence jsonb,
  required_tools text[],
  estimated_repair_time_minutes int,
  estimated_cost_range text,
  safety_warnings text[],
  common_misdiagnosis text,
  tribal_knowledge text,
  source_type text check (source_type in ('manual','community','repair_history','combined')),
  source_ids uuid[],
  confidence int check (confidence between 1 and 5),
  embedding vector(1536),
  created_at timestamptz default now()
);
create index if not exists fault_intel_brand_model_idx on fault_intelligence(brand, model);
create index if not exists fault_intel_code_idx on fault_intelligence(fault_code);
create index if not exists fault_intel_symptoms_idx on fault_intelligence using gin(symptoms);
alter table fault_intelligence enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='fault_intelligence' and policyname='allow all fault_intelligence') then
    create policy "allow all fault_intelligence" on fault_intelligence for all using (true) with check (true);
  end if;
end $$;

-- Processing state
create table if not exists doc_processing_state (
  document_id uuid primary key references documents(id) on delete cascade,
  layer_1_done boolean default false,
  layer_2_done boolean default false,
  layer_3_done boolean default false,
  layer_4_done boolean default false,
  layer_5_done boolean default false,
  layer_6_done boolean default false,
  layer_7_done boolean default false,
  quarantined boolean default false,
  last_error text,
  attempts int default 0,
  total_pages int,
  total_chunks int,
  total_entities int,
  cost_usd_cents int default 0,
  processing_time_seconds int,
  updated_at timestamptz default now()
);
alter table doc_processing_state enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='doc_processing_state' and policyname='allow all doc_processing_state') then
    create policy "allow all doc_processing_state" on doc_processing_state for all using (true) with check (true);
  end if;
end $$;

insert into doc_processing_state (document_id)
select id from documents
where id not in (select document_id from doc_processing_state)
on conflict (document_id) do nothing;

-- Hybrid search function
create or replace function hybrid_search(
  query_text text,
  query_embedding vector(1536) default null,
  filter_brand text default null,
  filter_model text default null,
  filter_fault_code text default null,
  k int default 20
)
returns table (
  result_type text,
  result_id uuid,
  content text,
  document_id uuid,
  brand text,
  model text,
  chunk_type text,
  score float
)
language sql stable
as $$
  with chunk_results as (
    select
      'chunk'::text as result_type,
      dc.id as result_id,
      dc.content,
      dc.document_id,
      d.machine_brand as brand,
      d.machine_model as model,
      dc.chunk_type,
      (
        case when dc.embedding is not null and query_embedding is not null
          then (1.0 - (dc.embedding <=> query_embedding)) * 0.6
          else 0.0 end
        + ts_rank(to_tsvector('simple', dc.content), plainto_tsquery('simple', query_text)) * 0.4
      ) as score
    from doc_chunks dc
    join documents d on d.id = dc.document_id
    where (filter_brand is null or d.machine_brand = filter_brand)
      and (filter_model is null or d.machine_model = filter_model)
  ),
  entity_results as (
    select
      'entity'::text as result_type,
      ke.id as result_id,
      coalesce(ke.description, ke.name) as content,
      null::uuid as document_id,
      ke.brand,
      ke.model,
      ke.entity_type as chunk_type,
      (
        case when ke.embedding is not null and query_embedding is not null
          then (1.0 - (ke.embedding <=> query_embedding)) * 0.5
          else 0.0 end
        + similarity(ke.name, query_text) * 0.3
      ) as score
    from kb_entities ke
    where (filter_brand is null or ke.brand = filter_brand)
      and (filter_model is null or ke.model = filter_model)
      and (filter_fault_code is null or ke.name = filter_fault_code)
  ),
  fault_results as (
    select
      'fault'::text as result_type,
      fi.id as result_id,
      coalesce(fi.fault_description, fi.fault_code) as content,
      null::uuid as document_id,
      fi.brand,
      fi.model,
      'fault_intelligence'::text as chunk_type,
      (
        case when fi.embedding is not null and query_embedding is not null
          then (1.0 - (fi.embedding <=> query_embedding)) * 0.7
          else 0.0 end
        + case when fi.fault_code is not null and position(fi.fault_code in query_text) > 0
          then 0.5 else 0.0 end
      ) as score
    from fault_intelligence fi
    where (filter_brand is null or fi.brand = filter_brand)
      and (filter_model is null or fi.model = filter_model)
      and (filter_fault_code is null or fi.fault_code = filter_fault_code)
  )
  select * from chunk_results
  union all select * from entity_results
  union all select * from fault_results
  order by score desc
  limit k
$$;
