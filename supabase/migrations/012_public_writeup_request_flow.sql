-- ============================================================================
-- Migration: 012_public_writeup_request_flow
-- Description: Public RPC functions for viewing requestable writeups and creating access requests
-- ============================================================================

-- ============================================================================
-- FUNCTION: get_requestable_lab_writeups
-- Purpose: Return safe teaser metadata for restricted writeups that can be requested publicly
-- Security: Returns only safe fields, no storage paths or sensitive data
-- ============================================================================
create or replace function public.get_requestable_lab_writeups(p_portfolio_slug text)
returns table (
  id uuid,
  title text,
  slug text,
  platform text,
  difficulty text,
  category text,
  machine_status text,
  visibility text,
  public_summary text,
  public_teaser text,
  tools jsonb,
  skills jsonb,
  tags jsonb,
  is_featured boolean,
  order_index integer
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
    w.machine_status,
    w.visibility,
    w.public_summary,
    w.public_teaser,
    w.tools,
    w.skills,
    w.tags,
    w.is_featured,
    w.order_index
  from public.lab_writeups w
  inner join public.portfolios p on p.id = w.portfolio_id
  where p.slug = p_portfolio_slug
    and p.is_active = true
    and w.is_active = true
    and w.visibility = 'restricted'
    and w.machine_status != 'active'
  order by w.is_featured desc, w.order_index asc, w.created_at desc;
end;
$$;

-- Grant execute to anon and authenticated users
grant execute on function public.get_requestable_lab_writeups(text) to anon, authenticated;

comment on function public.get_requestable_lab_writeups(text) is 
'Returns safe teaser metadata for restricted writeups that can be requested. Excludes storage paths, active machines, and private writeups.';

-- ============================================================================
-- FUNCTION: create_writeup_access_request
-- Purpose: Safely create a pending access request
-- Security: Validates portfolio, writeup, and business rules before insertion
-- ============================================================================
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
  v_writeup_machine_status text;
  v_writeup_is_active boolean;
  v_normalized_email text;
  v_request_id uuid;
  v_existing_pending_request_id uuid;
begin
  -- Trim and validate inputs
  p_portfolio_slug := trim(p_portfolio_slug);
  p_writeup_slug := trim(p_writeup_slug);
  p_requester_name := trim(p_requester_name);
  p_requester_email := trim(lower(p_requester_email));
  p_requester_reason := trim(p_requester_reason);
  p_requester_organization := nullif(trim(coalesce(p_requester_organization, '')), '');

  -- Validate required fields
  if p_requester_name = '' then
    raise exception 'Name is required.';
  end if;

  if p_requester_email = '' then
    raise exception 'Email is required.';
  end if;

  -- Basic email format validation
  if p_requester_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email format.';
  end if;

  if p_requester_reason = '' then
    raise exception 'Reason for access is required.';
  end if;

  if length(p_requester_reason) > 1000 then
    raise exception 'Reason must be 1000 characters or fewer.';
  end if;

  -- Get portfolio ID
  select id into v_portfolio_id
  from public.portfolios
  where slug = p_portfolio_slug
    and is_active = true;

  if v_portfolio_id is null then
    raise exception 'Portfolio not found or inactive.';
  end if;

  -- Get writeup details
  select 
    id,
    visibility,
    machine_status,
    is_active
  into 
    v_writeup_id,
    v_writeup_visibility,
    v_writeup_machine_status,
    v_writeup_is_active
  from public.lab_writeups
  where portfolio_id = v_portfolio_id
    and slug = p_writeup_slug;

  if v_writeup_id is null then
    raise exception 'Writeup not found in this portfolio.';
  end if;

  -- Validate writeup is requestable
  if not v_writeup_is_active then
    raise exception 'This writeup is not currently available for requests.';
  end if;

  if v_writeup_visibility = 'public' then
    raise exception 'Public writeups do not require access requests.';
  end if;

  if v_writeup_visibility = 'private' then
    raise exception 'This writeup is private and cannot be requested.';
  end if;

  if v_writeup_machine_status = 'active' then
    raise exception 'Access requests for active machines are not available at this time.';
  end if;

  v_normalized_email := p_requester_email;

  -- Check for existing pending request for same writeup + email
  select id into v_existing_pending_request_id
  from public.writeup_access_requests
  where portfolio_id = v_portfolio_id
    and writeup_id = v_writeup_id
    and requester_email = v_normalized_email
    and status = 'pending';

  if v_existing_pending_request_id is not null then
    raise exception 'You already have a pending request for this writeup. Please wait for review.';
  end if;

  -- Insert request
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

  -- Insert log entry
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

-- Grant execute to anon and authenticated users
grant execute on function public.create_writeup_access_request(
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

comment on function public.create_writeup_access_request is 
'Creates a pending access request for a restricted writeup. Validates portfolio, writeup status, and prevents duplicate pending requests.';

