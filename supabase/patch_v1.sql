-- Run once after the original schema.sql
-- Creates a profile automatically when a new Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'viewer', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- The original schema has no email column; add it safely.
alter table public.profiles add column if not exists email text;

-- Recreate trigger safely.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Allow a signed-in user to read/update their own profile.
drop policy if exists "user update own profile" on public.profiles;
create policy "user update own profile" on public.profiles
for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

-- Helpful for admin setup: after creating the first Auth user, run:
-- update public.profiles set role='admin' where email='YOUR_EMAIL_HERE';
