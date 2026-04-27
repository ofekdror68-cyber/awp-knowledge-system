-- Add missing columns to web_knowledge for AWP enrichment skill
alter table web_knowledge
  add column if not exists equipment_model text,
  add column if not exists topic text check (topic in ('fault_codes','hydraulics','electrical','maintenance','parts','general')),
  add column if not exists reliability_score float default 0.5 check (reliability_score >= 0 and reliability_score <= 1);

-- Index for fast model lookups
create index if not exists web_knowledge_model_idx on web_knowledge (equipment_model);
create index if not exists web_knowledge_topic_idx on web_knowledge (topic);

-- Unique constraint on URL to prevent duplicates
alter table web_knowledge
  add constraint if not exists web_knowledge_url_unique unique (url);
