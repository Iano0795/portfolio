-- Fix Portfolio Access
-- Run this in Supabase Dashboard > SQL Editor
-- This will grant your account access to the 'ian' portfolio

-- Step 1: Check if your user exists in auth.users
-- (Uncomment to see your user details)
-- select id, email, created_at from auth.users where email = 'iankipkorir668@gmail.com';

-- Step 2: Add portfolio membership for Ian
insert into public.portfolio_members (portfolio_id, user_id, email, role, is_active)
select 
  p.id as portfolio_id,
  u.id as user_id,
  u.email,
  'owner' as role,
  true as is_active
from public.portfolios p
cross join auth.users u
where p.slug = 'ian'
  and u.email = 'iankipkorir668@gmail.com'
on conflict (portfolio_id, user_id) do update
set 
  role = excluded.role,
  is_active = excluded.is_active,
  email = excluded.email;

-- Step 3: Verify the membership was created
select 
  pm.id,
  pm.email,
  pm.role,
  pm.is_active,
  p.slug as portfolio_slug,
  p.title as portfolio_title
from public.portfolio_members pm
join public.portfolios p on p.id = pm.portfolio_id
where pm.email = 'iankipkorir668@gmail.com';

-- Expected output:
-- You should see one row with:
-- - email: iankipkorir668@gmail.com
-- - role: owner
-- - is_active: true
-- - portfolio_slug: ian
-- - portfolio_title: IanOS Portfolio

