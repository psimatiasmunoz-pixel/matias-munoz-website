create extension if not exists pgcrypto;

create table if not exists public.psychological_test_results (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  test_code text not null,
  patient_name text,
  patient_slug text,
  applied_at timestamptz not null default now(),
  site_origin text,
  status text not null default 'completed',
  summary text,
  patient_data jsonb not null default '{}'::jsonb,
  raw_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  drive_root_folder text,
  drive_target_path text,
  drive_sync_status text not null default 'pending',
  drive_sync_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists psychological_test_results_patient_slug_idx
  on public.psychological_test_results (patient_slug);

create index if not exists psychological_test_results_test_code_idx
  on public.psychological_test_results (test_code);

create or replace function public.set_psychological_test_results_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists psychological_test_results_set_updated_at
on public.psychological_test_results;

create trigger psychological_test_results_set_updated_at
before update on public.psychological_test_results
for each row
execute function public.set_psychological_test_results_updated_at();

alter table public.psychological_test_results enable row level security;

drop policy if exists psychological_test_results_insert_anon
on public.psychological_test_results;

create policy psychological_test_results_insert_anon
on public.psychological_test_results
for insert
to anon, authenticated
with check (true);

drop policy if exists psychological_test_results_update_anon
on public.psychological_test_results;

create policy psychological_test_results_update_anon
on public.psychological_test_results
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists psychological_test_results_select_authenticated
on public.psychological_test_results;

create policy psychological_test_results_select_authenticated
on public.psychological_test_results
for select
to authenticated
using (true);
