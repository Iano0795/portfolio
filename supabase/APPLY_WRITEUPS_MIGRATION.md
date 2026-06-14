# Apply Restricted Writeups Foundation Migration

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `migrations/011_restricted_writeups_foundation.sql`
5. Paste and run

### Option 2: Supabase CLI

```bash
# From the portfolio/ directory
supabase db push
```

This will apply all pending migrations including `011_restricted_writeups_foundation.sql`.

### Option 3: Direct psql

```bash
# Using connection string from Supabase dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/011_restricted_writeups_foundation.sql
```

## Verification

After applying the migration, run these verification queries:

### 1. Verify Tables Created

```sql
select table_name from information_schema.tables
where table_schema = 'public'
and table_name in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
);
```

**Expected:** 4 rows

### 2. Verify RLS Enabled

```sql
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
and tablename in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
);
```

**Expected:** All should show `rowsecurity = t`

### 3. Verify Indexes

```sql
select schemaname, tablename, indexname 
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

**Expected:** Multiple indexes per table

### 4. Verify Constraints

```sql
select 
  conrelid::regclass as table_name,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid::regclass::text in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
)
order by table_name, constraint_name;
```

**Expected:** Check constraints for visibility, status, etc.

### 5. Test Public Access (Should Return Empty)

```sql
-- Switch to anon role
set role anon;

-- Should return no rows (no public writeups yet)
select * from lab_writeups;

-- Reset role
reset role;
```

### 6. Test Admin Access

```sql
-- As authenticated user with portfolio access
-- Should be able to insert (if you have can_manage_portfolio access)
-- This is just a dry-run test - don't actually insert:
-- select public.can_manage_portfolio('<your-portfolio-id>');
```

## Storage Bucket Setup

After migration, manually create the storage bucket:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `writeups`
4. **Privacy: Private** (important!)
5. Click **Create bucket**

### Add Storage Policies (Optional for now)

Storage policies can be added later in Task 27 when file upload is implemented.

For now, the private bucket with no policies is secure by default.

## Rollback (If Needed)

To rollback this migration:

```sql
-- Drop tables in reverse order (handles foreign keys)
drop table if exists public.writeup_access_logs cascade;
drop table if exists public.writeup_access_grants cascade;
drop table if exists public.writeup_access_requests cascade;
drop table if exists public.lab_writeups cascade;
```

**Warning:** This will delete all writeup data. Only use for development/testing.

## Next Steps

1. ✅ Apply migration
2. ✅ Verify tables and RLS
3. ✅ Create storage bucket
4. ✅ Confirm build passes (`npm run build`)
5. ⏭️ Ready for Task 27: Writeups Manager UI

## Troubleshooting

### Migration Fails: "function set_updated_at() does not exist"

This migration assumes `public.set_updated_at()` exists from previous migrations.

**Fix:** Check migration `001_initial_cms_schema.sql` and ensure the function is created:

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### Migration Fails: "function can_manage_portfolio() does not exist"

**Fix:** Check migration `003_multi_portfolio_access.sql` and ensure helper functions exist.

### RLS Policies Blocking Admin Access

**Issue:** Even as owner, cannot read writeups.

**Debug:**
```sql
-- Check your user's portfolio membership
select * from portfolio_members 
where user_id = auth.uid();

-- Check if helper functions work
select public.can_view_portfolio_admin('<portfolio-id>');
select public.can_manage_portfolio('<portfolio-id>');
```

If functions return false, check your user's role in `portfolio_members`.

---

**Migration File:** `supabase/migrations/011_restricted_writeups_foundation.sql`
**Documentation:** `docs/restricted-writeups-foundation.md`
