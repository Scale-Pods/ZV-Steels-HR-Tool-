-- 1) Table
create table if not exists public.node_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  node_key text not null,
  label text,
  credentials_encrypted text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.node_credentials is 'Per-user encrypted credentials for nodes/integrations.';
comment on column public.node_credentials.user_id is 'Owner user id (auth.uid()).';
comment on column public.node_credentials.node_key is 'Logical key identifying the node/integration (e.g., "whatsapp", "openai", "make-webhook").';
comment on column public.node_credentials.credentials_encrypted is 'Encrypted JSON payload of credentials.';

-- 2) Uniqueness: one row per user+node_key
create unique index if not exists node_credentials_user_key_idx
  on public.node_credentials (user_id, node_key);

-- 3) Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_node_credentials_updated_at on public.node_credentials;
create trigger trg_node_credentials_updated_at
before update on public.node_credentials
for each row execute function public.set_updated_at();

-- 4) RLS
alter table public.node_credentials enable row level security;

-- Clean existing policies if any
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='node_credentials' and policyname='node_credentials_select_own') then
    drop policy node_credentials_select_own on public.node_credentials;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='node_credentials' and policyname='node_credentials_insert_own') then
    drop policy node_credentials_insert_own on public.node_credentials;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='node_credentials' and policyname='node_credentials_update_own') then
    drop policy node_credentials_update_own on public.node_credentials;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='node_credentials' and policyname='node_credentials_delete_own') then
    drop policy node_credentials_delete_own on public.node_credentials;
  end if;
end $$;

-- Only owners can select
create policy node_credentials_select_own
  on public.node_credentials
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Only owners can insert
create policy node_credentials_insert_own
  on public.node_credentials
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only owners can update
create policy node_credentials_update_own
  on public.node_credentials
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only owners can delete
create policy node_credentials_delete_own
  on public.node_credentials
  for delete
  to authenticated
  using (auth.uid() = user_id);
