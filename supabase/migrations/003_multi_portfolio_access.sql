create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_name text not null,
  title text not null,
  app_name text,
  public_url text,
  brand_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.portfolio_members (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null,
  email text not null,
  role text default 'owner',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (portfolio_id, user_id),
  constraint portfolio_members_role_check check (role in ('owner', 'admin', 'editor', 'viewer'))
);

create index if not exists portfolio_members_user_id_idx on public.portfolio_members (user_id);
create index if not exists portfolio_members_portfolio_id_idx on public.portfolio_members (portfolio_id);
create index if not exists portfolios_slug_idx on public.portfolios (slug);

drop trigger if exists set_portfolios_updated_at on public.portfolios;
create trigger set_portfolios_updated_at
before update on public.portfolios
for each row execute function public.set_updated_at();

drop trigger if exists set_portfolio_members_updated_at on public.portfolio_members;
create trigger set_portfolio_members_updated_at
before update on public.portfolio_members
for each row execute function public.set_updated_at();

insert into public.portfolios (slug, owner_name, title, app_name, brand_name, is_active)
values ('ian', 'Ian Kipkorir', 'IanOS Portfolio', 'ian-portfolio', 'IanOS', true)
on conflict (slug) do update
set
  owner_name = excluded.owner_name,
  title = excluded.title,
  app_name = excluded.app_name,
  brand_name = excluded.brand_name,
  is_active = excluded.is_active;

insert into public.portfolios (slug, owner_name, title, app_name, brand_name, is_active)
values ('violet', 'Violet Achieng', 'Violet Achieng Portfolio', 'violet-portfolio', 'VioletSec', true)
on conflict (slug) do update
set
  owner_name = excluded.owner_name,
  title = excluded.title,
  app_name = excluded.app_name,
  brand_name = excluded.brand_name,
  is_active = excluded.is_active;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profile',
    'projects',
    'skills',
    'experience',
    'capabilities',
    'process_steps',
    'contact_links',
    'resume_assets',
    'site_settings',
    'navigation_items'
  ]
  loop
    execute format('alter table public.%I add column if not exists portfolio_id uuid references public.portfolios(id) on delete cascade', table_name);
    execute format(
      'update public.%I set portfolio_id = (select id from public.portfolios where slug = %L) where portfolio_id is null',
      table_name,
      'ian'
    );
  end loop;
end $$;

do $$
declare
  table_name text;
  null_count bigint;
begin
  foreach table_name in array array[
    'profile',
    'projects',
    'skills',
    'experience',
    'capabilities',
    'process_steps',
    'contact_links',
    'resume_assets',
    'site_settings',
    'navigation_items'
  ]
  loop
    execute format('select count(*) from public.%I where portfolio_id is null', table_name) into null_count;

    if null_count = 0 then
      execute format('alter table public.%I alter column portfolio_id set not null', table_name);
    end if;
  end loop;
end $$;

create index if not exists profile_portfolio_id_idx on public.profile (portfolio_id);
create index if not exists profile_portfolio_active_idx on public.profile (portfolio_id, is_active);
create index if not exists projects_portfolio_id_idx on public.projects (portfolio_id);
create index if not exists projects_portfolio_active_idx on public.projects (portfolio_id, is_active);
create index if not exists projects_portfolio_order_idx on public.projects (portfolio_id, order_index);
create index if not exists skills_portfolio_id_idx on public.skills (portfolio_id);
create index if not exists skills_portfolio_active_idx on public.skills (portfolio_id, is_active);
create index if not exists skills_portfolio_category_order_idx on public.skills (portfolio_id, category, order_index);
create index if not exists experience_portfolio_id_idx on public.experience (portfolio_id);
create index if not exists experience_portfolio_active_idx on public.experience (portfolio_id, is_active);
create index if not exists capabilities_portfolio_id_idx on public.capabilities (portfolio_id);
create index if not exists capabilities_portfolio_active_idx on public.capabilities (portfolio_id, is_active);
create index if not exists process_steps_portfolio_id_idx on public.process_steps (portfolio_id);
create index if not exists process_steps_portfolio_active_idx on public.process_steps (portfolio_id, is_active);
create index if not exists contact_links_portfolio_id_idx on public.contact_links (portfolio_id);
create index if not exists contact_links_portfolio_active_idx on public.contact_links (portfolio_id, is_active);
create index if not exists resume_assets_portfolio_id_idx on public.resume_assets (portfolio_id);
create index if not exists resume_assets_portfolio_active_idx on public.resume_assets (portfolio_id, is_active);
create index if not exists site_settings_portfolio_id_idx on public.site_settings (portfolio_id);
create index if not exists site_settings_portfolio_active_idx on public.site_settings (portfolio_id, is_active);
create index if not exists navigation_items_portfolio_id_idx on public.navigation_items (portfolio_id);
create index if not exists navigation_items_portfolio_active_idx on public.navigation_items (portfolio_id, is_active);
create index if not exists navigation_items_portfolio_order_idx on public.navigation_items (portfolio_id, order_index);

create or replace function public.is_portfolio_member(target_portfolio_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.portfolio_members
      where portfolio_id = target_portfolio_id
        and user_id = auth.uid()
        and is_active = true
    );
$$;

create or replace function public.can_manage_portfolio(target_portfolio_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.portfolio_members
      where portfolio_id = target_portfolio_id
        and user_id = auth.uid()
        and is_active = true
        and role in ('owner', 'admin', 'editor')
    );
$$;

create or replace function public.can_view_portfolio_admin(target_portfolio_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.portfolio_members
      where portfolio_id = target_portfolio_id
        and user_id = auth.uid()
        and is_active = true
        and role in ('owner', 'admin', 'editor', 'viewer')
    );
$$;

create or replace function public.can_administer_portfolio_members(target_portfolio_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.portfolio_members
      where portfolio_id = target_portfolio_id
        and user_id = auth.uid()
        and is_active = true
        and role in ('owner', 'admin')
    );
$$;

revoke all on function public.is_portfolio_member(uuid) from public;
revoke all on function public.can_manage_portfolio(uuid) from public;
revoke all on function public.can_view_portfolio_admin(uuid) from public;
revoke all on function public.can_administer_portfolio_members(uuid) from public;
grant execute on function public.is_portfolio_member(uuid) to authenticated;
grant execute on function public.can_manage_portfolio(uuid) to authenticated;
grant execute on function public.can_view_portfolio_admin(uuid) to authenticated;
grant execute on function public.can_administer_portfolio_members(uuid) to authenticated;

alter table public.portfolios enable row level security;
alter table public.portfolio_members enable row level security;

drop policy if exists "Public can read active portfolios" on public.portfolios;
drop policy if exists "Members can read their portfolios" on public.portfolios;
drop policy if exists "Portfolio managers can update portfolios" on public.portfolios;
drop policy if exists "Global admins can insert portfolios" on public.portfolios;

create policy "Public can read active portfolios"
on public.portfolios for select
to anon, authenticated
using (is_active = true);

create policy "Members can read their portfolios"
on public.portfolios for select
to authenticated
using (public.is_portfolio_member(id));

create policy "Portfolio managers can update portfolios"
on public.portfolios for update
to authenticated
using (public.can_manage_portfolio(id))
with check (public.can_manage_portfolio(id));

create policy "Global admins can insert portfolios"
on public.portfolios for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Members can read own portfolio membership" on public.portfolio_members;
drop policy if exists "Portfolio owners and admins can read members" on public.portfolio_members;
drop policy if exists "Portfolio owners and admins can insert members" on public.portfolio_members;
drop policy if exists "Portfolio owners and admins can update members" on public.portfolio_members;
drop policy if exists "Portfolio owners and admins can delete members" on public.portfolio_members;

create policy "Members can read own portfolio membership"
on public.portfolio_members for select
to authenticated
using (user_id = auth.uid());

create policy "Portfolio owners and admins can read members"
on public.portfolio_members for select
to authenticated
using (public.can_administer_portfolio_members(portfolio_id));

create policy "Portfolio owners and admins can insert members"
on public.portfolio_members for insert
to authenticated
with check (public.can_administer_portfolio_members(portfolio_id));

create policy "Portfolio owners and admins can update members"
on public.portfolio_members for update
to authenticated
using (public.can_administer_portfolio_members(portfolio_id))
with check (public.can_administer_portfolio_members(portfolio_id));

create policy "Portfolio owners and admins can delete members"
on public.portfolio_members for delete
to authenticated
using (public.can_administer_portfolio_members(portfolio_id));

drop policy if exists "Public can read active profile" on public.profile;
drop policy if exists "Public can read active projects" on public.projects;
drop policy if exists "Public can read active skills" on public.skills;
drop policy if exists "Public can read active experience" on public.experience;
drop policy if exists "Public can read active capabilities" on public.capabilities;
drop policy if exists "Public can read active process steps" on public.process_steps;
drop policy if exists "Public can read active contact links" on public.contact_links;
drop policy if exists "Public can read active resume assets" on public.resume_assets;
drop policy if exists "Public can read active site settings" on public.site_settings;
drop policy if exists "Public can read visible navigation items" on public.navigation_items;

drop policy if exists "Admins can insert profile" on public.profile;
drop policy if exists "Admins can update profile" on public.profile;
drop policy if exists "Admins can delete profile" on public.profile;
drop policy if exists "Admins can insert projects" on public.projects;
drop policy if exists "Admins can update projects" on public.projects;
drop policy if exists "Admins can delete projects" on public.projects;
drop policy if exists "Admins can insert skills" on public.skills;
drop policy if exists "Admins can update skills" on public.skills;
drop policy if exists "Admins can delete skills" on public.skills;
drop policy if exists "Admins can insert experience" on public.experience;
drop policy if exists "Admins can update experience" on public.experience;
drop policy if exists "Admins can delete experience" on public.experience;
drop policy if exists "Admins can insert capabilities" on public.capabilities;
drop policy if exists "Admins can update capabilities" on public.capabilities;
drop policy if exists "Admins can delete capabilities" on public.capabilities;
drop policy if exists "Admins can insert process steps" on public.process_steps;
drop policy if exists "Admins can update process steps" on public.process_steps;
drop policy if exists "Admins can delete process steps" on public.process_steps;
drop policy if exists "Admins can insert contact links" on public.contact_links;
drop policy if exists "Admins can update contact links" on public.contact_links;
drop policy if exists "Admins can delete contact links" on public.contact_links;
drop policy if exists "Admins can insert resume assets" on public.resume_assets;
drop policy if exists "Admins can update resume assets" on public.resume_assets;
drop policy if exists "Admins can delete resume assets" on public.resume_assets;
drop policy if exists "Admins can insert site settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;
drop policy if exists "Admins can delete site settings" on public.site_settings;
drop policy if exists "Admins can insert navigation items" on public.navigation_items;
drop policy if exists "Admins can update navigation items" on public.navigation_items;
drop policy if exists "Admins can delete navigation items" on public.navigation_items;

create policy "Public can read active profile for active portfolios"
on public.profile for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read profile"
on public.profile for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert profile"
on public.profile for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update profile"
on public.profile for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete profile"
on public.profile for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active projects for active portfolios"
on public.projects for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read projects"
on public.projects for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert projects"
on public.projects for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update projects"
on public.projects for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete projects"
on public.projects for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active skills for active portfolios"
on public.skills for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read skills"
on public.skills for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert skills"
on public.skills for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update skills"
on public.skills for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete skills"
on public.skills for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active experience for active portfolios"
on public.experience for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read experience"
on public.experience for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert experience"
on public.experience for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update experience"
on public.experience for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete experience"
on public.experience for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active capabilities for active portfolios"
on public.capabilities for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read capabilities"
on public.capabilities for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert capabilities"
on public.capabilities for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update capabilities"
on public.capabilities for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete capabilities"
on public.capabilities for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active process steps for active portfolios"
on public.process_steps for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read process steps"
on public.process_steps for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert process steps"
on public.process_steps for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update process steps"
on public.process_steps for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete process steps"
on public.process_steps for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active contact links for active portfolios"
on public.contact_links for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read contact links"
on public.contact_links for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert contact links"
on public.contact_links for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update contact links"
on public.contact_links for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete contact links"
on public.contact_links for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active resume assets for active portfolios"
on public.resume_assets for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read resume assets"
on public.resume_assets for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert resume assets"
on public.resume_assets for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update resume assets"
on public.resume_assets for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete resume assets"
on public.resume_assets for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read active site settings for active portfolios"
on public.site_settings for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read site settings"
on public.site_settings for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert site settings"
on public.site_settings for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update site settings"
on public.site_settings for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete site settings"
on public.site_settings for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

create policy "Public can read visible navigation items for active portfolios"
on public.navigation_items for select
to anon, authenticated
using (is_active = true and is_visible = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read navigation items"
on public.navigation_items for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert navigation items"
on public.navigation_items for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update navigation items"
on public.navigation_items for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete navigation items"
on public.navigation_items for delete to authenticated
using (public.can_manage_portfolio(portfolio_id));

-- Existing seed data belongs to the Ian portfolio after this migration.
-- Violet's portfolio shell exists, but Violet content is intentionally not fully seeded yet.
--
-- Grant Ian access:
-- insert into public.portfolio_members (portfolio_id, user_id, email, role)
-- select p.id, u.id, u.email, 'owner'
-- from public.portfolios p
-- cross join auth.users u
-- where p.slug = 'ian'
-- and u.email = 'ian-email@example.com'
-- on conflict do nothing;
--
-- Grant Violet access:
-- insert into public.portfolio_members (portfolio_id, user_id, email, role)
-- select p.id, u.id, u.email, 'owner'
-- from public.portfolios p
-- cross join auth.users u
-- where p.slug = 'violet'
-- and u.email = 'violet-email@example.com'
-- on conflict do nothing;
