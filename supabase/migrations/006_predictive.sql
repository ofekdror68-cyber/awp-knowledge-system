-- Predictive Maintenance Layer

-- Fleet machines operational registry
create table if not exists fleet_machines (
  id uuid primary key default gen_random_uuid(),
  internal_id text unique,
  mavaatz text,
  brand text not null,
  model text not null,
  serial_number text,
  year_manufactured int,
  category text,
  current_hours int default 0,
  last_hours_update timestamptz,
  last_service_date date,
  last_service_hours int,
  next_scheduled_service_hours int,
  next_scheduled_service_date date,
  location text,
  status text default 'active' check (status in ('active','in_repair','retired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists fleet_machines_brand_model_idx on fleet_machines(brand, model);
create index if not exists fleet_machines_status_idx on fleet_machines(status);
create index if not exists fleet_machines_mavaatz_idx on fleet_machines(mavaatz);

alter table fleet_machines enable row level security;
do $$ begin
  create policy "allow all fleet_machines" on fleet_machines for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Time-series hours readings
create table if not exists machine_hours_log (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references fleet_machines(id) on delete cascade,
  reading_hours int not null,
  reading_date date not null default current_date,
  source text default 'manual_entry' check (source in ('manual_entry','technician_report','client_report','chat_extract')),
  recorded_by text,
  created_at timestamptz default now()
);

create index if not exists machine_hours_machine_idx on machine_hours_log(machine_id, reading_date desc);

alter table machine_hours_log enable row level security;
do $$ begin
  create policy "allow all machine_hours_log" on machine_hours_log for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Component-level wear tracking
create table if not exists component_wear (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references fleet_machines(id) on delete cascade,
  component_name text not null,
  installed_date date,
  installed_hours int,
  expected_lifetime_hours int,
  expected_lifetime_months int,
  last_inspection_date date,
  last_inspection_result text check (last_inspection_result in ('good','worn','replace_soon','failed')),
  replacement_history jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists component_wear_machine_idx on component_wear(machine_id);

alter table component_wear enable row level security;
do $$ begin
  create policy "allow all component_wear" on component_wear for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- AI failure predictions
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references fleet_machines(id) on delete cascade,
  predicted_failure_type text not null,
  predicted_component text,
  probability int check (probability between 0 and 100),
  confidence int check (confidence between 0 and 100),
  predicted_window_days_min int,
  predicted_window_days_max int,
  reasoning text,
  evidence jsonb default '{}',
  recommended_action text,
  recommended_action_cost_estimate text,
  cost_if_ignored_estimate text,
  status text default 'active' check (status in ('active','acknowledged','prevented','happened','expired')),
  created_at timestamptz default now(),
  expires_at timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by text,
  outcome text check (outcome in ('correct','incorrect','prevented')),
  outcome_notes text
);

create index if not exists predictions_machine_idx on predictions(machine_id);
create index if not exists predictions_status_idx on predictions(status);
create index if not exists predictions_probability_idx on predictions(probability desc);
create index if not exists predictions_active_idx on predictions(machine_id, predicted_failure_type) where status = 'active';

alter table predictions enable row level security;
do $$ begin
  create policy "allow all predictions" on predictions for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Fleet-wide failure patterns (learned knowledge base)
create table if not exists failure_patterns (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  failure_type text not null,
  typical_age_hours_min int,
  typical_age_hours_max int,
  typical_age_months_min int,
  typical_age_months_max int,
  precursor_signals text[] default '{}',
  occurrence_count int default 0,
  total_machines_tracked int default 0,
  base_rate_percent numeric default 0,
  last_updated timestamptz default now(),
  unique(brand, model, failure_type)
);

create index if not exists failure_patterns_brand_model_idx on failure_patterns(brand, model);

alter table failure_patterns enable row level security;
do $$ begin
  create policy "allow all failure_patterns" on failure_patterns for all using (true) with check (true);
exception when duplicate_object then null;
end $$;
