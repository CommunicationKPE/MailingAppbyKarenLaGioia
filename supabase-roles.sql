alter table public.profiles
  add column if not exists role text not null default 'editor';

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;

do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check
    check (role in ('admin', 'editor'));
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists profiles_select_own_role on public.profiles;
drop policy if exists profiles_select_admin_or_own on public.profiles;
drop policy if exists contacts_select_authenticated on public.contacts;
drop policy if exists contacts_insert_authenticated on public.contacts;
drop policy if exists contacts_update_admin_or_owner on public.contacts;
drop policy if exists contacts_delete_admin_or_owner on public.contacts;

create policy profiles_select_admin_or_own
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy contacts_select_authenticated
on public.contacts for select
to authenticated
using (true);

create policy contacts_insert_authenticated
on public.contacts for insert
to authenticated
with check (user_id = auth.uid());

create policy contacts_update_admin_or_owner
on public.contacts for update
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and first_name = contacts.responsable
  )
)
with check (
  public.is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and first_name = contacts.responsable
  )
);

create policy contacts_delete_admin_or_owner
on public.contacts for delete
to authenticated
using (public.is_admin() or user_id = auth.uid());

-- Apres avoir recupere l'UUID du compte administrateur dans Supabase:
update public.profiles set role = 'admin' where id = '7c33a46f-107a-4c37-bac1-777677f80daa';
-- Les nouveaux comptes restent editeurs par defaut.
