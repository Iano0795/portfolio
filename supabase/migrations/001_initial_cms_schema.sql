create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text default 'admin',
  created_at timestamptz default now(),
  unique (user_id),
  unique (email)
);

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  name text,
  headline text,
  subheadline text,
  intro_line text,
  location text,
  availability_status text,
  current_focus text,
  core_stack jsonb,
  terminal_lines jsonb,
  cta_primary_label text,
  cta_secondary_label text,
  cta_contact_label text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  role text,
  short_description text,
  problem text,
  solution text,
  outcome text,
  stack jsonb,
  is_featured boolean default false,
  is_private boolean default false,
  github_url text,
  live_url text,
  case_study_url text,
  image_url text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  stage_label text,
  title text not null,
  organization text,
  period text,
  description text,
  achievements jsonb,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.capabilities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  command text,
  label text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contact_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text,
  url text not null,
  icon text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resume_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  version_label text,
  is_active boolean default false,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text,
  app_title text,
  tagline text,
  version_label text,
  mode_label text,
  status_label text,
  availability_label text,
  footer_text text,
  command_prompt_prefix text,
  default_section text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  label text not null,
  system_label text,
  command text,
  icon text,
  order_index integer default 0,
  is_visible boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_active_order_idx on public.projects (is_active, order_index, created_at);
create index if not exists skills_active_category_order_idx on public.skills (is_active, category, order_index);
create index if not exists experience_active_order_idx on public.experience (is_active, order_index);
create index if not exists capabilities_active_order_idx on public.capabilities (is_active, order_index);
create index if not exists process_steps_active_order_idx on public.process_steps (is_active, order_index);
create index if not exists contact_links_active_order_idx on public.contact_links (is_active, order_index);
create index if not exists resume_assets_active_uploaded_idx on public.resume_assets (is_active, uploaded_at desc);
create index if not exists navigation_items_active_visible_order_idx on public.navigation_items (is_active, is_visible, order_index);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profile_updated_at
before update on public.profile
for each row execute function public.set_updated_at();

create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger set_skills_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

create trigger set_experience_updated_at
before update on public.experience
for each row execute function public.set_updated_at();

create trigger set_capabilities_updated_at
before update on public.capabilities
for each row execute function public.set_updated_at();

create trigger set_process_steps_updated_at
before update on public.process_steps
for each row execute function public.set_updated_at();

create trigger set_contact_links_updated_at
before update on public.contact_links
for each row execute function public.set_updated_at();

create trigger set_resume_assets_updated_at
before update on public.resume_assets
for each row execute function public.set_updated_at();

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_navigation_items_updated_at
before update on public.navigation_items
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admins enable row level security;
alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.capabilities enable row level security;
alter table public.process_steps enable row level security;
alter table public.contact_links enable row level security;
alter table public.resume_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;

create policy "Admins can read admins"
on public.admins for select
to authenticated
using (public.is_admin());

create policy "Admins can insert admins"
on public.admins for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update admins"
on public.admins for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete admins"
on public.admins for delete
to authenticated
using (public.is_admin());

create policy "Public can read active profile"
on public.profile for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active projects"
on public.projects for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active skills"
on public.skills for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active experience"
on public.experience for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active capabilities"
on public.capabilities for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active process steps"
on public.process_steps for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active contact links"
on public.contact_links for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active resume assets"
on public.resume_assets for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active site settings"
on public.site_settings for select
to anon, authenticated
using (is_active = true);

create policy "Public can read visible navigation items"
on public.navigation_items for select
to anon, authenticated
using (is_active = true and is_visible = true);

create policy "Admins can insert profile"
on public.profile for insert to authenticated
with check (public.is_admin());

create policy "Admins can update profile"
on public.profile for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete profile"
on public.profile for delete to authenticated
using (public.is_admin());

create policy "Admins can insert projects"
on public.projects for insert to authenticated
with check (public.is_admin());

create policy "Admins can update projects"
on public.projects for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete projects"
on public.projects for delete to authenticated
using (public.is_admin());

create policy "Admins can insert skills"
on public.skills for insert to authenticated
with check (public.is_admin());

create policy "Admins can update skills"
on public.skills for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete skills"
on public.skills for delete to authenticated
using (public.is_admin());

create policy "Admins can insert experience"
on public.experience for insert to authenticated
with check (public.is_admin());

create policy "Admins can update experience"
on public.experience for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete experience"
on public.experience for delete to authenticated
using (public.is_admin());

create policy "Admins can insert capabilities"
on public.capabilities for insert to authenticated
with check (public.is_admin());

create policy "Admins can update capabilities"
on public.capabilities for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete capabilities"
on public.capabilities for delete to authenticated
using (public.is_admin());

create policy "Admins can insert process steps"
on public.process_steps for insert to authenticated
with check (public.is_admin());

create policy "Admins can update process steps"
on public.process_steps for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete process steps"
on public.process_steps for delete to authenticated
using (public.is_admin());

create policy "Admins can insert contact links"
on public.contact_links for insert to authenticated
with check (public.is_admin());

create policy "Admins can update contact links"
on public.contact_links for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete contact links"
on public.contact_links for delete to authenticated
using (public.is_admin());

create policy "Admins can insert resume assets"
on public.resume_assets for insert to authenticated
with check (public.is_admin());

create policy "Admins can update resume assets"
on public.resume_assets for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete resume assets"
on public.resume_assets for delete to authenticated
using (public.is_admin());

create policy "Admins can insert site settings"
on public.site_settings for insert to authenticated
with check (public.is_admin());

create policy "Admins can update site settings"
on public.site_settings for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete site settings"
on public.site_settings for delete to authenticated
using (public.is_admin());

create policy "Admins can insert navigation items"
on public.navigation_items for insert to authenticated
with check (public.is_admin());

create policy "Admins can update navigation items"
on public.navigation_items for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete navigation items"
on public.navigation_items for delete to authenticated
using (public.is_admin());
