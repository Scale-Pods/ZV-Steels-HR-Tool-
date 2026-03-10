-- Create core tables for WhatsApp Exhibition Automation

-- Users are managed by Clerk; we store user_id (string) to link records.
create table if not exists public.user_integrations (
  user_id text,
  service text not null,
  credentials jsonb not null default '{}'::jsonb,
  connected boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, service)
);

create table if not exists public.campaigns (
  id bigserial primary key,
  user_id text,
  name text not null,
  created_at timestamptz not null default now()
);

-- Helpful index
create index if not exists idx_user_integrations_user on public.user_integrations(user_id);
create index if not exists idx_campaigns_user on public.campaigns(user_id);

-- RLS: enable and add basic policies (adjust after Clerk integration)
alter table public.user_integrations enable row level security;
alter table public.campaigns enable row level security;

-- For now, allow all; tighten when Clerk auth is added.
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'user_integrations') then
    create policy "Allow all temporarily" on public.user_integrations
      for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'campaigns') then
    create policy "Allow all temporarily" on public.campaigns
      for all using (true) with check (true);
  end if;
end $$;
