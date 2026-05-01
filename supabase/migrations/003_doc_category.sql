-- Add classification columns to documents table
alter table documents
  add column if not exists doc_category int,
  add column if not exists doc_category_name text;

-- Index for fast filtering by category
create index if not exists documents_doc_category_idx on documents (doc_category);
create index if not exists documents_brand_model_idx on documents (machine_brand, machine_model);
