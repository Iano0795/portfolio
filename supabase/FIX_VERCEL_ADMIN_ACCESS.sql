-- Fix Vercel Admin Access
-- Run this in the Supabase project used by the Vercel deployment.
--
-- The app only allows admin access when the authenticated user has an active
-- row in public.portfolio_members for the target portfolio.
--
-- Set these two values before running:
--   v_admin_email: the email you use on /admin/login
--   v_portfolio_slugs: the portfolios this admin should manage

do $$
declare
  v_admin_email text := 'admin@ianos.local';
  v_portfolio_slugs text[] := array['ian', 'violet'];
  v_user_id uuid;
  v_missing_portfolios text[];
begin
  select id
  into v_user_id
  from auth.users
  where lower(email) = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No Supabase Auth user exists for email %', v_admin_email;
  end if;

  select array_agg(slug)
  into v_missing_portfolios
  from unnest(v_portfolio_slugs) as requested(slug)
  where not exists (
    select 1
    from public.portfolios p
    where p.slug = requested.slug
      and p.is_active = true
  );

  if v_missing_portfolios is not null then
    raise exception 'Missing or inactive portfolio slug(s): %', v_missing_portfolios;
  end if;

  insert into public.portfolio_members (
    portfolio_id,
    user_id,
    email,
    role,
    is_active
  )
  select
    p.id,
    v_user_id,
    v_admin_email,
    'owner',
    true
  from public.portfolios p
  where p.slug = any(v_portfolio_slugs)
  on conflict (portfolio_id, user_id) do update
  set
    email = excluded.email,
    role = excluded.role,
    is_active = true,
    updated_at = now();
end $$;

select
  pm.email,
  pm.role,
  pm.is_active,
  p.slug as portfolio_slug,
  p.title as portfolio_title
from public.portfolio_members pm
join public.portfolios p on p.id = pm.portfolio_id
where lower(pm.email) = lower('admin@ianos.local')
order by p.slug;
