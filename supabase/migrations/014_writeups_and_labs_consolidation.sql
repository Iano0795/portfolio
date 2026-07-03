-- ============================================================================
-- Migration: 014_writeups_and_labs_consolidation
-- Description: Consolidate Violet's public projects/writeups into safe Writeups & Labs
-- ============================================================================

-- ============================================================================
-- Extend lab_writeups
-- ============================================================================
alter table public.lab_writeups
add column if not exists lab_type text,
add column if not exists is_requestable boolean not null default false,
add column if not exists content_markdown text,
add column if not exists cover_image_url text,
add column if not exists reading_time_minutes integer,
add column if not exists published_at timestamptz;

alter table public.lab_writeups
drop constraint if exists lab_writeups_lab_type_check;

alter table public.lab_writeups
add constraint lab_writeups_lab_type_check
check (lab_type is null or lab_type in ('offensive', 'defensive'));

alter table public.lab_writeups
drop constraint if exists lab_writeups_reading_time_check;

alter table public.lab_writeups
add constraint lab_writeups_reading_time_check
check (
  reading_time_minutes is null
  or reading_time_minutes > 0
);

create index if not exists lab_writeups_public_filters_idx
on public.lab_writeups (
  portfolio_id,
  lab_type,
  machine_status,
  visibility,
  is_active,
  order_index
);

-- Public direct table reads must not expose active-machine full public content.
drop policy if exists "Public can read active public writeups" on public.lab_writeups;
drop policy if exists "Public can read safe public writeups" on public.lab_writeups;

create policy "Public can read safe public writeups"
on public.lab_writeups for select
to anon, authenticated
using (
  is_active = true
  and visibility = 'public'
  and machine_status <> 'active'
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = lab_writeups.portfolio_id
      and portfolios.is_active = true
  )
);

-- ============================================================================
-- Writeup screenshots/media metadata
-- ============================================================================
create table if not exists public.writeup_media (
  id uuid primary key default gen_random_uuid(),

  portfolio_id uuid not null
    references public.portfolios(id)
    on delete cascade,

  writeup_id uuid not null
    references public.lab_writeups(id)
    on delete cascade,

  media_type text not null default 'image',

  storage_bucket text not null,
  storage_path text not null,

  alt_text text,
  caption text,

  order_index integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint writeup_media_type_check
    check (media_type in ('image'))
);

create index if not exists writeup_media_writeup_order_idx
on public.writeup_media (
  writeup_id,
  is_active,
  order_index
);

create index if not exists writeup_media_portfolio_idx
on public.writeup_media (portfolio_id);

drop trigger if exists set_writeup_media_updated_at on public.writeup_media;
create trigger set_writeup_media_updated_at
before update on public.writeup_media
for each row execute function public.set_updated_at();

alter table public.writeup_media enable row level security;

drop policy if exists "Public can read public retired writeup media" on public.writeup_media;
drop policy if exists "Portfolio members can read writeup media" on public.writeup_media;
drop policy if exists "Portfolio managers can insert writeup media" on public.writeup_media;
drop policy if exists "Portfolio managers can update writeup media" on public.writeup_media;
drop policy if exists "Portfolio managers can delete writeup media" on public.writeup_media;

create policy "Public can read public retired writeup media"
on public.writeup_media for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.lab_writeups w
    join public.portfolios p on p.id = w.portfolio_id
    where w.id = writeup_media.writeup_id
      and w.portfolio_id = writeup_media.portfolio_id
      and w.is_active = true
      and w.visibility = 'public'
      and w.machine_status <> 'active'
      and p.is_active = true
  )
);

create policy "Portfolio members can read writeup media"
on public.writeup_media for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert writeup media"
on public.writeup_media for insert
to authenticated
with check (
  public.can_manage_portfolio(portfolio_id)
  and exists (
    select 1
    from public.lab_writeups w
    where w.id = writeup_media.writeup_id
      and w.portfolio_id = writeup_media.portfolio_id
  )
);

create policy "Portfolio managers can update writeup media"
on public.writeup_media for update
to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (
  public.can_manage_portfolio(portfolio_id)
  and exists (
    select 1
    from public.lab_writeups w
    where w.id = writeup_media.writeup_id
      and w.portfolio_id = writeup_media.portfolio_id
  )
);

create policy "Portfolio managers can delete writeup media"
on public.writeup_media for delete
to authenticated
using (public.can_manage_portfolio(portfolio_id));

-- ============================================================================
-- Public screenshot storage bucket
-- ============================================================================
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'writeup-assets',
  'writeup-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio managers can upload public writeup assets" on storage.objects;
drop policy if exists "Portfolio managers can update public writeup assets" on storage.objects;
drop policy if exists "Portfolio managers can delete public writeup assets" on storage.objects;

create policy "Portfolio managers can upload public writeup assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'writeup-assets'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

create policy "Portfolio managers can update public writeup assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'writeup-assets'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
)
with check (
  bucket_id = 'writeup-assets'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

create policy "Portfolio managers can delete public writeup assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'writeup-assets'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

comment on table public.writeup_media is
'Public screenshot metadata. Public rows must only reference screenshots intentionally safe for public retired writeups. Restricted/private evidence stays in the private writeups bucket.';

-- ============================================================================
-- Requestable writeup RPCs
-- ============================================================================
drop function if exists public.get_requestable_lab_writeups(text);

create or replace function public.get_requestable_lab_writeups(p_portfolio_slug text)
returns table (
  id uuid,
  title text,
  slug text,
  platform text,
  difficulty text,
  category text,
  lab_type text,
  machine_status text,
  visibility text,
  public_summary text,
  public_teaser text,
  tools jsonb,
  skills jsonb,
  tags jsonb,
  is_featured boolean,
  order_index integer,
  reading_time_minutes integer
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    w.id,
    w.title,
    w.slug,
    w.platform,
    w.difficulty,
    w.category,
    w.lab_type,
    w.machine_status,
    w.visibility,
    w.public_summary,
    w.public_teaser,
    w.tools,
    w.skills,
    w.tags,
    w.is_featured,
    w.order_index,
    w.reading_time_minutes
  from public.lab_writeups w
  inner join public.portfolios p on p.id = w.portfolio_id
  where p.slug = p_portfolio_slug
    and p.is_active = true
    and w.is_active = true
    and w.visibility = 'restricted'
    and w.is_requestable = true
  order by w.is_featured desc, w.order_index asc, w.created_at desc;
end;
$$;

grant execute on function public.get_requestable_lab_writeups(text) to anon, authenticated;

comment on function public.get_requestable_lab_writeups(text) is
'Returns safe teaser metadata for restricted writeups explicitly marked requestable. Never returns content_markdown or storage metadata.';

create or replace function public.create_writeup_access_request(
  p_portfolio_slug text,
  p_writeup_slug text,
  p_requester_name text,
  p_requester_email text,
  p_requester_reason text,
  p_requester_organization text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_portfolio_id uuid;
  v_writeup_id uuid;
  v_writeup_visibility text;
  v_writeup_is_active boolean;
  v_writeup_is_requestable boolean;
  v_normalized_email text;
  v_request_id uuid;
  v_existing_pending_request_id uuid;
begin
  p_portfolio_slug := trim(p_portfolio_slug);
  p_writeup_slug := trim(p_writeup_slug);
  p_requester_name := trim(p_requester_name);
  p_requester_email := trim(lower(p_requester_email));
  p_requester_reason := trim(p_requester_reason);
  p_requester_organization := nullif(trim(coalesce(p_requester_organization, '')), '');

  if p_requester_name = '' then
    raise exception 'Name is required.';
  end if;

  if p_requester_email = '' then
    raise exception 'Email is required.';
  end if;

  if p_requester_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email format.';
  end if;

  if p_requester_reason = '' then
    raise exception 'Reason for access is required.';
  end if;

  if length(p_requester_reason) > 1000 then
    raise exception 'Reason must be 1000 characters or fewer.';
  end if;

  select id into v_portfolio_id
  from public.portfolios
  where slug = p_portfolio_slug
    and is_active = true;

  if v_portfolio_id is null then
    raise exception 'Portfolio not found or inactive.';
  end if;

  select
    id,
    visibility,
    is_active,
    is_requestable
  into
    v_writeup_id,
    v_writeup_visibility,
    v_writeup_is_active,
    v_writeup_is_requestable
  from public.lab_writeups
  where portfolio_id = v_portfolio_id
    and slug = p_writeup_slug;

  if v_writeup_id is null then
    raise exception 'Writeup not found in this portfolio.';
  end if;

  if not v_writeup_is_active then
    raise exception 'This writeup is not currently available for requests.';
  end if;

  if v_writeup_visibility = 'public' then
    raise exception 'Public writeups do not require access requests.';
  end if;

  if v_writeup_visibility = 'private' then
    raise exception 'This writeup is private and cannot be requested.';
  end if;

  if v_writeup_visibility <> 'restricted' or not v_writeup_is_requestable then
    raise exception 'This writeup is not currently available for requests.';
  end if;

  v_normalized_email := p_requester_email;

  select id into v_existing_pending_request_id
  from public.writeup_access_requests
  where portfolio_id = v_portfolio_id
    and writeup_id = v_writeup_id
    and requester_email = v_normalized_email
    and status = 'pending';

  if v_existing_pending_request_id is not null then
    raise exception 'You already have a pending request for this writeup. Please wait for review.';
  end if;

  insert into public.writeup_access_requests (
    portfolio_id,
    writeup_id,
    requester_name,
    requester_email,
    requester_reason,
    requester_organization,
    status
  ) values (
    v_portfolio_id,
    v_writeup_id,
    p_requester_name,
    v_normalized_email,
    p_requester_reason,
    p_requester_organization,
    'pending'
  )
  returning id into v_request_id;

  insert into public.writeup_access_logs (
    portfolio_id,
    writeup_id,
    request_id,
    event_type,
    actor_email,
    metadata
  ) values (
    v_portfolio_id,
    v_writeup_id,
    v_request_id,
    'request_created',
    v_normalized_email,
    jsonb_build_object(
      'source', 'violet_public_portfolio',
      'requester_name', p_requester_name,
      'requester_organization', p_requester_organization,
      'created_via', 'public_rpc'
    )
  );

  return v_request_id;
end;
$$;

grant execute on function public.create_writeup_access_request(
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

comment on function public.create_writeup_access_request is
'Creates a pending access request only for active restricted writeups explicitly marked is_requestable. Never trusts client portfolio_id.';

-- ============================================================================
-- Public catalog and full writeup RPCs
-- ============================================================================
create or replace function public.get_public_writeups_catalog(p_portfolio_slug text)
returns table (
  id uuid,
  title text,
  slug text,
  platform text,
  difficulty text,
  category text,
  lab_type text,
  machine_status text,
  visibility text,
  is_requestable boolean,
  public_summary text,
  public_teaser text,
  tools jsonb,
  skills jsonb,
  tags jsonb,
  cover_image_url text,
  reading_time_minutes integer,
  is_featured boolean,
  order_index integer,
  can_read_full boolean
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    w.id,
    w.title,
    w.slug,
    w.platform,
    w.difficulty,
    w.category,
    w.lab_type,
    w.machine_status,
    w.visibility,
    w.is_requestable,
    w.public_summary,
    w.public_teaser,
    w.tools,
    w.skills,
    w.tags,
    w.cover_image_url,
    w.reading_time_minutes,
    w.is_featured,
    w.order_index,
    (
      w.is_active = true
      and w.visibility = 'public'
      and w.machine_status <> 'active'
      and nullif(trim(coalesce(w.content_markdown, '')), '') is not null
    ) as can_read_full
  from public.lab_writeups w
  inner join public.portfolios p on p.id = w.portfolio_id
  where p.slug = p_portfolio_slug
    and p.is_active = true
    and w.is_active = true
    and w.visibility in ('public', 'restricted')
  order by w.is_featured desc, w.order_index asc, w.created_at desc;
end;
$$;

grant execute on function public.get_public_writeups_catalog(text) to anon, authenticated;

comment on function public.get_public_writeups_catalog(text) is
'Returns safe public catalog metadata for Writeups & Labs. Excludes private/inactive rows, content_markdown, and storage metadata.';

create or replace function public.get_public_lab_writeup(
  p_portfolio_slug text,
  p_writeup_slug text
)
returns table (
  id uuid,
  title text,
  slug text,
  platform text,
  difficulty text,
  category text,
  lab_type text,
  machine_status text,
  public_summary text,
  tools jsonb,
  skills jsonb,
  tags jsonb,
  content_markdown text,
  cover_image_url text,
  reading_time_minutes integer,
  published_at timestamptz
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    w.id,
    w.title,
    w.slug,
    w.platform,
    w.difficulty,
    w.category,
    w.lab_type,
    w.machine_status,
    w.public_summary,
    w.tools,
    w.skills,
    w.tags,
    w.content_markdown,
    w.cover_image_url,
    w.reading_time_minutes,
    w.published_at
  from public.lab_writeups w
  inner join public.portfolios p on p.id = w.portfolio_id
  where p.slug = p_portfolio_slug
    and p.is_active = true
    and w.slug = p_writeup_slug
    and w.is_active = true
    and w.visibility = 'public'
    and w.machine_status <> 'active'
    and nullif(trim(coalesce(w.content_markdown, '')), '') is not null
  limit 1;
end;
$$;

grant execute on function public.get_public_lab_writeup(text, text) to anon, authenticated;

comment on function public.get_public_lab_writeup(text, text) is
'Returns full Markdown only for active public non-active-machine writeups with content. Restricted, private, active, inactive, or missing rows return no row.';
