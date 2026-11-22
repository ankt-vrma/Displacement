create table if not exists travel_plans (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  query text not null,
  trip jsonb,
  final_plan text not null,
  pdf_url text,
  created_at timestamptz default now()
);