# Migration 011: Restricted Writeups Foundation - Pre-Flight Checklist

## Before Applying Migration

### 1. Backup Current Database
```bash
# Export current schema
pg_dump -s <connection-string> > backup_schema_before_011.sql

# Or use Supabase Dashboard: Database → Backups
```

### 2. Verify Prerequisites
- [ ] Migration 010 (credentials) has been applied
- [ ] Function `public.set_updated_at()` exists
- [ ] Functions `public.can_view_portfolio_admin()` and `public.can_manage_portfolio()` exist
- [ ] At least one active portfolio exists in `portfolios` table

**Verify Prerequisites SQL:**
```sql
-- Check functions exist
select proname from pg_proc
where pronamespace = 'public'::regnamespace
and proname in ('set_updated_at', 'can_view_portfolio_admin', 'can_manage_portfolio');
-- Should return 3 rows

-- Check active portfolios
select slug from portfolios where is_active = true;
-- Should return at least 'ian' or 'violet'
```

### 3. Review Migration File
- [ ] Read `migrations/011_restricted_writeups_foundation.sql`
- [ ] Understand what tables will be created
- [ ] Review RLS policies
- [ ] Note storage bucket requirements

## Apply Migration

### Option A: Supabase Dashboard
1. [ ] Open Supabase Dashboard
2. [ ] Go to SQL Editor
3. [ ] Create new query
4. [ ] Copy entire contents of `011_restricted_writeups_foundation.sql`
5. [ ] Click Run
6. [ ] Verify no errors in output

### Option B: Supabase CLI
```bash
cd portfolio/
supabase db push
```

### Option C: Direct psql
```bash
psql "<connection-string>" \
  -f supabase/migrations/011_restricted_writeups_foundation.sql
```

## Post-Migration Verification

### 1. Tables Created
```sql
select table_name, table_type
from information_schema.tables
where table_schema = 'public'
and table_name in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by table_name;
```
**Expected:** 4 rows, all `table_type = 'BASE TABLE'`

- [ ] `lab_writeups` exists
- [ ] `writeup_access_requests` exists
- [ ] `writeup_access_grants` exists
- [ ] `writeup_access_logs` exists

### 2. RLS Enabled
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by tablename;
```
**Expected:** All 4 rows with `rowsecurity = t`

- [ ] All tables have RLS enabled

### 3. Indexes Created
```sql
select tablename, indexname
from pg_indexes
where schemaname = 'public'
and tablename in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by tablename, indexname;
```
**Expected:** Multiple indexes (at least 10 total)

- [ ] `lab_writeups_portfolio_id_idx`
- [ ] `lab_writeups_portfolio_visibility_idx`
- [ ] `lab_writeups_portfolio_order_idx`
- [ ] `writeup_access_requests_portfolio_idx`
- [ ] `writeup_access_requests_writeup_idx`
- [ ] `writeup_access_grants_portfolio_idx`
- [ ] `writeup_access_grants_writeup_idx`
- [ ] `writeup_access_grants_token_hash_idx`
- [ ] `writeup_access_logs_portfolio_idx`
- [ ] `writeup_access_logs_grant_idx`

### 4. Triggers Attached
```sql
select trigger_name, event_object_table, action_timing, event_manipulation
from information_schema.triggers
where event_object_schema = 'public'
and event_object_table in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants'
)
order by event_object_table;
```
**Expected:** 3 triggers (one per table, not on logs)

- [ ] `set_lab_writeups_updated_at`
- [ ] `set_writeup_access_requests_updated_at`
- [ ] `set_writeup_access_grants_updated_at`

### 5. Constraints Valid
```sql
select
  conrelid::regclass as table_name,
  conname as constraint_name,
  contype as constraint_type
from pg_constraint
where conrelid::regclass::text in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
and contype in ('c', 'u', 'f')  -- check, unique, foreign key
order by table_name, constraint_type, constraint_name;
```

- [ ] `lab_writeups_visibility_check` (check)
- [ ] `lab_writeups_machine_status_check` (check)
- [ ] `lab_writeups_slug_unique_per_portfolio` (unique)
- [ ] `writeup_access_requests_status_check` (check)
- [ ] `writeup_access_grants_token_hash_unique` (unique)
- [ ] `writeup_access_grants_max_views_check` (check)
- [ ] `writeup_access_grants_views_used_check` (check)
- [ ] `writeup_access_logs_event_type_check` (check)
- [ ] Foreign key constraints to `portfolios`, `projects`, `auth.users`

### 6. RLS Policies Exist
```sql
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
and tablename in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by tablename, policyname;
```

**lab_writeups (5 policies):**
- [ ] "Public can read active public writeups"
- [ ] "Portfolio members can read all writeups"
- [ ] "Portfolio managers can insert writeups"
- [ ] "Portfolio managers can update writeups"
- [ ] "Portfolio managers can delete writeups"

**writeup_access_requests (2 policies):**
- [ ] "Portfolio members can read access requests"
- [ ] "Portfolio managers can update access requests"

**writeup_access_grants (3 policies):**
- [ ] "Portfolio members can read grants"
- [ ] "Portfolio managers can insert grants"
- [ ] "Portfolio managers can update grants"

**writeup_access_logs (1 policy):**
- [ ] "Portfolio members can read logs"

### 7. Test Public Access (Should Be Restricted)
```sql
-- Switch to anonymous role
set role anon;

-- Try to read writeups (should return empty, no public writeups yet)
select count(*) from lab_writeups;
-- Expected: 0

-- Try to insert (should fail)
insert into lab_writeups (portfolio_id, title, slug)
values ('00000000-0000-0000-0000-000000000000', 'Test', 'test');
-- Expected: ERROR: new row violates row-level security policy

-- Reset role
reset role;
```

- [ ] Anonymous users cannot insert writeups
- [ ] Anonymous users see only public active writeups (none yet)

### 8. Verify Foreign Key Cascades
```sql
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
and tc.table_schema = 'public'
and tc.table_name in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by tc.table_name, kcu.column_name;
```

**Verify delete rules:**
- [ ] `portfolio_id` → `portfolios(id)` = CASCADE
- [ ] `project_id` → `projects(id)` = SET NULL
- [ ] `writeup_id` → `lab_writeups(id)` = CASCADE
- [ ] Other foreign keys have appropriate rules

## Storage Setup

### Create Writeups Bucket
1. [ ] Open Supabase Dashboard → Storage
2. [ ] Click "New bucket"
3. [ ] Name: `writeups`
4. [ ] **IMPORTANT:** Uncheck "Public bucket" (must be private)
5. [ ] Click "Create bucket"
6. [ ] Verify bucket appears in list with lock icon (private)

### Verify Bucket Settings
```sql
-- Check bucket exists
select id, name, public from storage.buckets where name = 'writeups';
-- Expected: 1 row with public = false
```

- [ ] Bucket `writeups` exists
- [ ] Bucket is private (`public = false`)

## Application Validation

### TypeScript Build
```bash
cd portfolio/
npm run build
```

- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No missing dependency warnings

### Type Imports Test
```typescript
// In any server component (temporary test)
import type { LabWriteup, WriteupAccessRequest } from '@/types/portfolio';
import { getPublicLabWriteups } from '@/lib/cms/queries';
import { generateAccessToken, hashAccessToken } from '@/lib/writeups/tokens';

// If this compiles, types are working
```

- [ ] Types import successfully
- [ ] Query functions import successfully
- [ ] Token utilities import successfully

### Query Test (Optional - No Data Yet)
```typescript
// In a server component or API route
import { getPublicLabWriteups } from '@/lib/cms/queries';

const writeups = await getPublicLabWriteups({ portfolioSlug: 'ian' });
console.log('Public writeups:', writeups); // Should be []
```

- [ ] Query runs without errors
- [ ] Returns empty array (no data yet)

### Token Generation Test (Optional)
```typescript
// In a server route/action only!
import { generateAccessToken, hashAccessToken, verifyAccessToken } from '@/lib/writeups/tokens';

const token = generateAccessToken();
const hash = hashAccessToken(token);
const valid = verifyAccessToken(token, hash);

console.log('Token test:', { token, hash, valid }); // valid should be true
```

- [ ] Token generation works
- [ ] Hash is deterministic
- [ ] Verification works

## Rollback Plan (Emergency Only)

If something goes wrong and you need to rollback:

```sql
-- WARNING: This deletes all writeup data
-- Only use in development/testing

drop table if exists public.writeup_access_logs cascade;
drop table if exists public.writeup_access_grants cascade;
drop table if exists public.writeup_access_requests cascade;
drop table if exists public.lab_writeups cascade;

-- Delete storage bucket manually in dashboard
```

- [ ] Have database backup ready before applying migration
- [ ] Know how to restore from backup if needed

## Success Criteria

All checkboxes above should be checked before considering migration successful:

- [ ] All 4 tables created
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] All triggers attached
- [ ] All constraints valid
- [ ] All RLS policies created
- [ ] Public access properly restricted
- [ ] Foreign key cascades configured
- [ ] Storage bucket created (private)
- [ ] TypeScript build passes
- [ ] Types import successfully
- [ ] Queries run without errors

## Next Steps After Success

1. [ ] Document migration completion in team channel
2. [ ] Update `.env` with `WRITEUP_TOKEN_SECRET` if using HMAC (optional)
3. [ ] Test queries return expected results
4. [ ] Prepare for Task 27: Writeups Manager UI

## Troubleshooting

### Migration Fails: Missing Function
**Error:** `function public.set_updated_at() does not exist`

**Fix:** Apply earlier migrations first (001-010)

### Migration Fails: Missing Helper Functions
**Error:** `function public.can_manage_portfolio(uuid) does not exist`

**Fix:** Apply migration 003 (multi_portfolio_access)

### RLS Blocks All Access
**Issue:** Even admins can't read writeups

**Debug:**
```sql
-- Check your user's portfolio access
select * from portfolio_members where user_id = auth.uid();

-- Test helper functions
select public.can_view_portfolio_admin('<portfolio-id>');
```

### Build Fails: Type Errors
**Issue:** TypeScript can't find new types

**Fix:**
1. Restart TypeScript server in IDE
2. Clear `.next` directory: `rm -rf .next`
3. Rebuild: `npm run build`

### Storage Bucket Not Private
**Issue:** Bucket created as public by mistake

**Fix:**
1. Go to Storage → Buckets
2. Click `writeups` bucket settings (gear icon)
3. Toggle "Public bucket" to OFF
4. Save changes

---

**Migration File:** `supabase/migrations/011_restricted_writeups_foundation.sql`
**Documentation:** `docs/restricted-writeups-foundation.md`
**Quick Guide:** `supabase/APPLY_WRITEUPS_MIGRATION.md`
