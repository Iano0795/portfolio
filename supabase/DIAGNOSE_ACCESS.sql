-- Diagnostic Queries for Portfolio Access
-- Run these in Supabase Dashboard > SQL Editor to understand what's happening

-- ============================================================
-- STEP 1: Check if your user exists in auth.users
-- ============================================================
select 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
from auth.users 
where email = 'iankipkorir668@gmail.com';

-- Expected: 1 row with your user details
-- If NO ROWS: User doesn't exist - you need to sign up first
-- If 1 ROW: User exists ✅

-- ============================================================
-- STEP 2: Check if 'ian' portfolio exists
-- ============================================================
select 
  id as portfolio_id,
  slug,
  title,
  owner_name,
  is_active
from public.portfolios 
where slug = 'ian';

-- Expected: 1 row with portfolio details
-- If NO ROWS: Migration 003 didn't run - check migrations
-- If 1 ROW: Portfolio exists ✅

-- ============================================================
-- STEP 3: Check if portfolio_members table has any records
-- ============================================================
select 
  pm.id,
  pm.email,
  pm.role,
  pm.is_active,
  p.slug as portfolio_slug,
  u.email as auth_email
from public.portfolio_members pm
left join public.portfolios p on p.id = pm.portfolio_id
left join auth.users u on u.id = pm.user_id;

-- Expected: Records linking users to portfolios
-- If NO ROWS: This is your problem! ❌ No portfolio members exist
-- If ROWS exist but none for your email: Your account not linked
-- If ROW exists for your email: Membership exists ✅

-- ============================================================
-- STEP 4: Check specifically for your portfolio membership
-- ============================================================
select 
  pm.id,
  pm.email,
  pm.role,
  pm.is_active,
  p.slug as portfolio_slug,
  p.title as portfolio_title,
  pm.user_id,
  pm.portfolio_id
from public.portfolio_members pm
join public.portfolios p on p.id = pm.portfolio_id
where pm.email = 'iankipkorir668@gmail.com'
  and p.slug = 'ian';

-- Expected: 1 row with role='owner', is_active=true
-- If NO ROWS: ❌ This is why you're getting "Access denied"
-- If 1 ROW with is_active=false: ❌ Membership exists but inactive
-- If 1 ROW with is_active=true: ✅ Membership exists and active

-- ============================================================
-- STEP 5: Test RLS function directly (if logged in)
-- ============================================================
-- Replace <PORTFOLIO_ID> with the actual portfolio id from Step 2
-- Run this while logged in as your user

-- select public.can_manage_portfolio('<PORTFOLIO_ID>');

-- Expected: true
-- If NULL or false: RLS function can't find your membership
-- If true: ✅ RLS should work

-- ============================================================
-- STEP 6: Check current authenticated user (if logged in)
-- ============================================================
-- This only works if you run it while authenticated in the app
-- You can't test this in SQL Editor, but useful for debugging

-- select auth.uid(), auth.email();

-- Expected: Your user_id and email
-- If NULL: Not authenticated
-- If UUID: ✅ Authenticated

-- ============================================================
-- DIAGNOSIS SUMMARY
-- ============================================================

-- Problem Scenarios:

-- Scenario A: No user exists
--   Step 1 returns NO ROWS
--   Solution: Sign up at /admin/login

-- Scenario B: User exists but no portfolio_members records at all
--   Step 1 returns 1 row ✅
--   Step 3 returns NO ROWS ❌
--   Solution: Run FIX_PORTFOLIO_ACCESS.sql

-- Scenario C: User exists, other members exist, but not you
--   Step 1 returns 1 row ✅
--   Step 3 returns rows for others ✅
--   Step 4 returns NO ROWS ❌
--   Solution: Run FIX_PORTFOLIO_ACCESS.sql

-- Scenario D: User exists, membership exists, but inactive
--   Step 4 returns 1 row with is_active=false ❌
--   Solution: UPDATE public.portfolio_members SET is_active=true 
--             WHERE email='iankipkorir668@gmail.com';

-- Scenario E: Everything exists and active (should work!)
--   All steps return expected results ✅
--   Problem might be elsewhere (check session, cookies, etc.)

