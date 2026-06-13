# Portfolio Access Fix Guide

## Problem
Error: **"Access denied. This account is not assigned to any portfolio workspace."**

## Root Cause
Your user account (`iankipkorir668@gmail.com`) exists in Supabase Auth, but there is **no record** in the `portfolio_members` table linking your user to the 'ian' portfolio.

The migration 003 includes commented-out SQL to create these relationships, but they were never executed:

```sql
-- Grant Ian access: (THIS WAS COMMENTED OUT - NEVER RAN!)
-- insert into public.portfolio_members (portfolio_id, user_id, email, role)
-- ...
```

## Solution

### Option 1: Run SQL Script in Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Run This SQL**
   
   ```sql
   -- Add portfolio membership for Ian
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
   ```

4. **Click "Run"**

5. **Verify It Worked**
   
   Run this query:
   ```sql
   select 
     pm.email,
     pm.role,
     pm.is_active,
     p.slug as portfolio_slug,
     p.title as portfolio_title
   from public.portfolio_members pm
   join public.portfolios p on p.id = pm.portfolio_id
   where pm.email = 'iankipkorir668@gmail.com';
   ```
   
   Expected output:
   ```
   email: iankipkorir668@gmail.com
   role: owner
   is_active: true
   portfolio_slug: ian
   portfolio_title: IanOS Portfolio
   ```

6. **Test Access**
   - Go back to your app
   - Refresh the page or logout and login again
   - You should now have access to the portfolio

### Option 2: Apply Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or reset and reapply all migrations
supabase db reset
```

Then run the SQL script from Option 1.

### Option 3: Manual Insert via Supabase Dashboard

If the cross join query doesn't work (e.g., if your user doesn't exist yet):

1. **Get Your User ID**
   
   Go to Supabase Dashboard > Authentication > Users
   
   Find your email: `iankipkorir668@gmail.com`
   
   Copy the `User ID` (UUID format like: `123e4567-e89b-12d3-a456-426614174000`)

2. **Get Portfolio ID**
   
   Run this query:
   ```sql
   select id, slug, title from public.portfolios where slug = 'ian';
   ```
   
   Copy the `id` (UUID)

3. **Insert Portfolio Member**
   
   Replace `<USER_ID>` and `<PORTFOLIO_ID>` with your actual UUIDs:
   
   ```sql
   insert into public.portfolio_members (portfolio_id, user_id, email, role, is_active)
   values (
     '<PORTFOLIO_ID>',
     '<USER_ID>',
     'iankipkorir668@gmail.com',
     'owner',
     true
   );
   ```

## Verification

After running the fix, verify it worked:

### Check 1: Portfolio Member Exists
```sql
select * from public.portfolio_members 
where email = 'iankipkorir668@gmail.com';
```

Should return at least 1 row.

### Check 2: RLS Function Returns True
```sql
-- Replace <PORTFOLIO_ID> with your 'ian' portfolio id
select public.can_manage_portfolio('<PORTFOLIO_ID>');
```

Should return `true` when you're logged in.

### Check 3: Can Query Resume Assets
```sql
-- Replace <PORTFOLIO_ID> with your 'ian' portfolio id
select * from public.resume_assets 
where portfolio_id = '<PORTFOLIO_ID>';
```

Should not throw RLS error (even if empty).

## Why This Happened

The migration 003 created:
- ✅ `portfolios` table with 'ian' and 'violet' records
- ✅ `portfolio_members` table (empty)
- ✅ RLS policies that require portfolio membership
- ❌ **No portfolio_members records** (SQL was commented out)

Result: RLS policies block access because there are no members.

## How RLS Works

```
User tries to insert resume
↓
RLS policy: "Portfolio managers can insert resume assets"
↓
Policy checks: can_manage_portfolio(portfolio_id)
↓
Function checks: Is there a portfolio_members record where:
  - user_id = auth.uid()  ← Your user UUID
  - portfolio_id = target portfolio
  - role in ('owner', 'admin', 'editor')
  - is_active = true
↓
NO RECORD FOUND ❌
↓
Access Denied
```

After adding portfolio_members record:

```
User tries to insert resume
↓
RLS policy checks can_manage_portfolio(portfolio_id)
↓
Function finds portfolio_members record ✅
↓
User has 'owner' role ✅
↓
Access Granted ✅
```

## Testing After Fix

1. **Logout and Login**
   - Clear cookies or logout: `/admin/logout`
   - Login again: `/admin/login`

2. **Select Portfolio**
   - You should now see 'ian' portfolio
   - Click to access it

3. **Try Resume Upload**
   - Go to Resume Manager
   - Upload a PDF
   - Should work without RLS errors

## Additional Users

To add more users (e.g., Violet, team members):

```sql
-- Add Violet as owner of 'violet' portfolio
insert into public.portfolio_members (portfolio_id, user_id, email, role, is_active)
select 
  p.id,
  u.id,
  u.email,
  'owner',
  true
from public.portfolios p
cross join auth.users u
where p.slug = 'violet'
  and u.email = 'violet@example.com'
on conflict (portfolio_id, user_id) do nothing;

-- Add a team member as editor to 'ian' portfolio
insert into public.portfolio_members (portfolio_id, user_id, email, role, is_active)
select 
  p.id,
  u.id,
  u.email,
  'editor',
  true
from public.portfolios p
cross join auth.users u
where p.slug = 'ian'
  and u.email = 'teammate@example.com'
on conflict (portfolio_id, user_id) do nothing;
```

## Summary

**The fix is simple**: Add a record to `portfolio_members` table linking your user to the 'ian' portfolio.

Run the SQL script in `FIX_PORTFOLIO_ACCESS.sql` via Supabase Dashboard SQL Editor, then refresh your app.

**Your access should now work!** 🎉

