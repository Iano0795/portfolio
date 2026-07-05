-- ============================================================================
-- Migration: 011_restricted_writeups_foundation
-- Description: Foundation for restricted lab writeup access system
-- ============================================================================

-- ============================================================================
-- TABLE: lab_writeups
-- ============================================================================
create table if not exists public.lab_writeups (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,

  title text not null,
  slug text not null,
  platform text,
  difficulty text,
  category text,

  machine_status text not null default 'retired',
  visibility text not null default 'restricted',

  public_summary text,
  public_teaser text,

  tools jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,

  storage_bucket text,
  storage_path text,
  file_name text,
  file_type text,

  is_featured boolean not null default false,
  is_active boolean not null default true,
  order_index integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lab_writeups_visibility_check
    check (visibility in ('public', 'restricted', 'private')),

  constraint lab_writeups_machine_status_check
    check (machine_status in ('active', 'retired', 'other')),

  constraint lab_writeups_slug_unique_per_portfolio
    unique (portfolio_id, slug)
);

-- ============================================================================
-- TABLE: writeup_access_requests
-- ============================================================================
create table if not exists public.writeup_access_requests (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  writeup_id uuid not null references public.lab_writeups(id) on delete cascade,

  requester_name text not null,
  requester_email text not null,
  requester_reason text,
  requester_organization text,

  status text not null default 'pending',

  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewer_note text,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint writeup_access_requests_status_check
    check (status in ('pending', 'approved', 'rejected', 'cancelled'))
);

-- ============================================================================
-- TABLE: writeup_access_grants
-- ============================================================================
create table if not exists public.writeup_access_grants (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  writeup_id uuid not null references public.lab_writeups(id) on delete cascade,
  request_id uuid references public.writeup_access_requests(id) on delete set null,

  requester_email text not null,

  token_hash text not null,
  token_label text,

  expires_at timestamptz,
  max_views integer,
  views_used integer not null default 0,

  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint writeup_access_grants_token_hash_unique
    unique (token_hash),

  constraint writeup_access_grants_max_views_check
    check (max_views is null or max_views > 0),

  constraint writeup_access_grants_views_used_check
    check (views_used >= 0)
);

-- ============================================================================
-- TABLE: writeup_access_logs
-- ============================================================================
create table if not exists public.writeup_access_logs (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  writeup_id uuid references public.lab_writeups(id) on delete set null,
  grant_id uuid references public.writeup_access_grants(id) on delete set null,
  request_id uuid references public.writeup_access_requests(id) on delete set null,

  event_type text not null,
  actor_email text,
  actor_user_id uuid references auth.users(id) on delete set null,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint writeup_access_logs_event_type_check
    check (
      event_type in (
        'request_created',
        'request_approved',
        'request_rejected',
        'grant_created',
        'grant_viewed',
        'grant_revoked',
        'grant_expired',
        'file_signed_url_created',
        'access_denied'
      )
    )
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists lab_writeups_portfolio_id_idx
on public.lab_writeups (portfolio_id);

create index if not exists lab_writeups_portfolio_visibility_idx
on public.lab_writeups (portfolio_id, visibility, is_active);

create index if not exists lab_writeups_portfolio_order_idx
on public.lab_writeups (portfolio_id, order_index);

create index if not exists writeup_access_requests_portfolio_idx
on public.writeup_access_requests (portfolio_id, status, created_at desc);

create index if not exists writeup_access_requests_writeup_idx
on public.writeup_access_requests (writeup_id);

create index if not exists writeup_access_grants_portfolio_idx
on public.writeup_access_grants (portfolio_id, created_at desc);

create index if not exists writeup_access_grants_writeup_idx
on public.writeup_access_grants (writeup_id);

create index if not exists writeup_access_grants_token_hash_idx
on public.writeup_access_grants (token_hash);

create index if not exists writeup_access_logs_portfolio_idx
on public.writeup_access_logs (portfolio_id, created_at desc);

create index if not exists writeup_access_logs_grant_idx
on public.writeup_access_logs (grant_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Assumes public.set_updated_at() already exists from previous migrations
drop trigger if exists set_lab_writeups_updated_at on public.lab_writeups;
create trigger set_lab_writeups_updated_at
before update on public.lab_writeups
for each row execute function public.set_updated_at();

drop trigger if exists set_writeup_access_requests_updated_at on public.writeup_access_requests;
create trigger set_writeup_access_requests_updated_at
before update on public.writeup_access_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_writeup_access_grants_updated_at on public.writeup_access_grants;
create trigger set_writeup_access_grants_updated_at
before update on public.writeup_access_grants
for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY: lab_writeups
-- ============================================================================
alter table public.lab_writeups enable row level security;

drop policy if exists "Public can read active public writeups" on public.lab_writeups;
drop policy if exists "Portfolio members can read all writeups" on public.lab_writeups;
drop policy if exists "Portfolio managers can insert writeups" on public.lab_writeups;
drop policy if exists "Portfolio managers can update writeups" on public.lab_writeups;
drop policy if exists "Portfolio managers can delete writeups" on public.lab_writeups;

-- Public/anon can only read active public writeups for active portfolios
create policy "Public can read active public writeups"
on public.lab_writeups for select
to anon, authenticated
using (
  is_active = true
  and visibility = 'public'
  and exists (
    select 1 from public.portfolios
    where id = lab_writeups.portfolio_id
    and is_active = true
  )
);

-- Portfolio members can read all writeups (including restricted/private)
create policy "Portfolio members can read all writeups"
on public.lab_writeups for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

-- Portfolio managers can insert writeups
create policy "Portfolio managers can insert writeups"
on public.lab_writeups for insert
to authenticated
with check (public.can_manage_portfolio(portfolio_id));

-- Portfolio managers can update writeups
create policy "Portfolio managers can update writeups"
on public.lab_writeups for update
to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

-- Portfolio managers can delete writeups
create policy "Portfolio managers can delete writeups"
on public.lab_writeups for delete
to authenticated
using (public.can_manage_portfolio(portfolio_id));

-- ============================================================================
-- ROW LEVEL SECURITY: writeup_access_requests
-- ============================================================================
alter table public.writeup_access_requests enable row level security;

drop policy if exists "Portfolio members can read access requests" on public.writeup_access_requests;
drop policy if exists "Portfolio managers can update access requests" on public.writeup_access_requests;

-- Public cannot read/list requests directly
-- Public request creation will be handled through a secure server route later
-- For now, only portfolio members can interact with requests

-- Portfolio members can read requests for their portfolio
create policy "Portfolio members can read access requests"
on public.writeup_access_requests for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

-- Portfolio managers can update request status (approve/reject)
create policy "Portfolio managers can update access requests"
on public.writeup_access_requests for update
to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

-- NOTE: Public request insertion will be handled through a secure server action
-- in a later task to ensure proper portfolio_id validation and writeup status checks

-- ============================================================================
-- ROW LEVEL SECURITY: writeup_access_grants
-- ============================================================================
alter table public.writeup_access_grants enable row level security;

drop policy if exists "Portfolio members can read grants" on public.writeup_access_grants;
drop policy if exists "Portfolio managers can insert grants" on public.writeup_access_grants;
drop policy if exists "Portfolio managers can update grants" on public.writeup_access_grants;

-- Public cannot read grants directly
-- Token validation will be handled through secure server routes

-- Portfolio members can read grants for their portfolio
create policy "Portfolio members can read grants"
on public.writeup_access_grants for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

-- Portfolio managers can create grants
create policy "Portfolio managers can insert grants"
on public.writeup_access_grants for insert
to authenticated
with check (public.can_manage_portfolio(portfolio_id));

-- Portfolio managers can update/revoke grants
create policy "Portfolio managers can update grants"
on public.writeup_access_grants for update
to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

-- ============================================================================
-- ROW LEVEL SECURITY: writeup_access_logs
-- ============================================================================
alter table public.writeup_access_logs enable row level security;

drop policy if exists "Portfolio members can read logs" on public.writeup_access_logs;

-- Public cannot read logs
-- Portfolio members can read logs for their portfolio
create policy "Portfolio members can read logs"
on public.writeup_access_logs for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

-- NOTE: Server routes will insert logs using service role client
-- No public insert policy needed

-- ============================================================================
-- STORAGE BUCKET DOCUMENTATION
-- ============================================================================
-- BUCKET NAME: writeups
-- PRIVACY: private
-- PATH PATTERN: writeups/{portfolioSlug}/{writeupSlug}/{timestamp}-{safe-file-name}
--
-- STORAGE POLICIES (to be created in Supabase Dashboard or future migration):
-- 1. Authenticated portfolio managers can upload/update/delete files for their portfolio's writeups
-- 2. Public cannot list or read files from the writeups bucket
-- 3. Access to restricted writeup files requires server-side signed URL generation
--    after token validation
--
-- RECOMMENDED POLICY EXAMPLES (for manual setup in Supabase Dashboard):
--
-- Policy: "Portfolio managers can upload writeup files"
-- Operation: INSERT
-- Target roles: authenticated
-- USING expression: (
--   EXISTS (
--     SELECT 1 FROM public.lab_writeups w
--     WHERE w.storage_bucket = bucket_id
--     AND w.storage_path = name
--     AND public.can_manage_portfolio(w.portfolio_id)
--   )
-- )
--
-- Policy: "Portfolio managers can update writeup files"
-- Operation: UPDATE
-- Target roles: authenticated
-- Similar USING expression as INSERT
--
-- Policy: "Portfolio managers can delete writeup files"
-- Operation: DELETE
-- Target roles: authenticated
-- Similar USING expression as INSERT
--
-- Policy: "No public access to writeup files"
-- Operation: SELECT
-- Target roles: authenticated
-- USING expression: false (or remove SELECT policy entirely for private bucket)
--
-- ============================================================================

