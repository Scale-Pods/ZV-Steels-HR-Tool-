-- Ensure the table exists (no-op if it already does). We do not recreate it.
-- Add unique index for upsert to work reliably
create unique index if not exists user_integrations_user_service_uidx
  on public.user_integrations (user_id, service);

-- Enable RLS
alter table public.user_integrations enable row level security;

-- Cast auth.uid() to text to match user_id column type
-- Policies: each user can manage only their rows
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_integrations' and policyname = 'user_integrations_select_own'
  ) then
    create policy user_integrations_select_own
      on public.user_integrations
      for select
      using (auth.uid()::text = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_integrations' and policyname = 'user_integrations_insert_own'
  ) then
    create policy user_integrations_insert_own
      on public.user_integrations
      for insert
      with check (auth.uid()::text = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_integrations' and policyname = 'user_integrations_update_own'
  ) then
    create policy user_integrations_update_own
      on public.user_integrations
      for update
      using (auth.uid()::text = user_id)
      with check (auth.uid()::text = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_integrations' and policyname = 'user_integrations_delete_own'
  ) then
    create policy user_integrations_delete_own
      on public.user_integrations
      for delete
      using (auth.uid()::text = user_id);
  end if;
end $$;
