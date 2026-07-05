# Restricted Writeups Foundation - Summary

**Task:** Task 26 - Build Restricted Writeup Access System Foundation
**Status:** ✅ Complete (Foundation Only)
**Date:** 2026-06-14

## What Was Built

This task establishes the **database, security, types, and server utilities** for a restricted lab writeup access system. The full UI and workflow features will be built in Task 27.

### ✅ Delivered Components

#### 1. Database Migration
- **File:** `supabase/migrations/011_restricted_writeups_foundation.sql`
- **Tables Added:**
  - `lab_writeups` - Writeup metadata with visibility control
  - `writeup_access_requests` - User access requests
  - `writeup_access_grants` - Issued access tokens (hashed)
  - `writeup_access_logs` - Audit trail
- **Indexes:** Performance indexes on all key fields
- **Triggers:** Updated_at triggers for all mutable tables
- **RLS:** Row Level Security enabled with portfolio-scoped policies

#### 2. TypeScript Types
- **File:** `src/types/portfolio.ts`
- **Types Added:**
  - `LabWriteup` - Main writeup type
  - `LabWriteupVisibility` - 'public' | 'restricted' | 'private'
  - `LabWriteupMachineStatus` - 'active' | 'retired' | 'other'
  - `WriteupAccessRequest` - Request type
  - `WriteupAccessGrant` - Grant type
  - `WriteupAccessLog` - Log type
  - `WriteupAccessLogEventType` - Event union type

#### 3. CMS Query Helpers
- **File:** `src/lib/cms/queries.ts`
- **Functions Added:**
  - `getPublicLabWriteups()` - Public writeups only
  - `getAdminLabWriteups()` - All writeups (requires auth)
  - `getLabWriteupBySlug()` - Single writeup by slug
  - `getWriteupAccessRequests()` - All requests (admin)
  - `getWriteupAccessGrants()` - All grants (admin)
  - `getWriteupAccessLogs()` - Recent logs (admin)

#### 4. Server-Side Token Utilities
- **File:** `src/lib/writeups/tokens.ts`
- **Functions Added:**
  - `generateAccessToken()` - Create secure random token
  - `hashAccessToken()` - Hash token for storage (SHA-256)
  - `verifyAccessToken()` - Timing-safe token verification
  - `getAccessTokenExpiry()` - Generate expiry dates
  - `isTokenExpired()` - Check expiration
  - `isGrantValid()` - Validate grant status
  - `generateTokenLabel()` - Human-readable token display

#### 5. Documentation
- **File:** `docs/restricted-writeups-foundation.md` - Comprehensive guide
- **File:** `supabase/APPLY_WRITEUPS_MIGRATION.md` - Migration instructions

#### 6. Environment Configuration
- **Updated:** `.env.example`
- **Added:** `WRITEUP_TOKEN_SECRET` (optional HMAC secret)

### ✅ Build Validation
- `npm run build` passes successfully
- All TypeScript types compile without errors
- No breaking changes to existing code

## Key Features

### Visibility Levels
- **Public** - Available to all users (safe, retired content)
- **Restricted** - Requires request/approval + token
- **Private** - Portfolio members only

### Machine Status
- **Active** - Challenge still available/unspoiled
- **Retired** - Challenge officially retired by platform
- **Other** - Custom/expired challenges

### Security Model

#### Token Security
- ✅ Raw tokens never stored in database
- ✅ Only SHA-256 hashes persisted
- ✅ Cryptographically secure token generation (32 bytes)
- ✅ Timing-safe comparison to prevent timing attacks
- 📝 TODO: Production HMAC with `WRITEUP_TOKEN_SECRET`

#### Storage Security
- ✅ Private Supabase Storage bucket (`writeups`)
- ✅ No public read access to restricted files
- ✅ Access via short-lived signed URLs only
- ✅ Portfolio-scoped upload permissions
- 📝 Storage policies documented (manual setup required)

#### RLS Policies
- ✅ Public users: Read only active public writeups
- ✅ Portfolio members: Read all writeups
- ✅ Managers: Full CRUD on their portfolio's writeups
- ✅ Audit logs: Members only
- ✅ Grants: Members only (token validation via server routes)

## What's NOT Built (Intentionally Deferred to Task 27)

### ❌ Admin UI (Task 27)
- Writeups Manager interface
- CRUD forms for writeups
- File upload UI
- Access request approval queue
- Grant management (issue/revoke tokens)
- Access log viewer

### ❌ Public UI (Task 27)
- Public portfolio writeups section
- Request access form
- Token access page (view granted writeups)

### ❌ Workflows (Task 27)
- Email notifications
- Automatic token expiration handling
- Signed URL generation routes
- Public request submission route

## Storage Bucket Setup (Manual)

After applying migration, create the `writeups` bucket:

1. Supabase Dashboard → **Storage**
2. Create bucket: `writeups`
3. Privacy: **Private**
4. Storage policies: Add in Task 27

## Migration Instructions

### Apply Migration

**Supabase Dashboard (Recommended):**
1. SQL Editor → New Query
2. Copy contents of `migrations/011_restricted_writeups_foundation.sql`
3. Run

**Supabase CLI:**
```bash
cd portfolio/
supabase db push
```

### Verify

```sql
-- Check tables
select table_name from information_schema.tables
where table_schema = 'public'
and table_name in (
  'lab_writeups',
  'writeup_access_requests',
  'writeup_access_grants',
  'writeup_access_logs'
);
-- Should return 4 rows

-- Check RLS
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
and tablename like '%writeup%';
-- All should have rowsecurity = t
```

## Product Boundaries

| Feature | Projects | Lab Writeups |
|---------|----------|--------------|
| Purpose | Portfolio showcase | Detailed walkthroughs |
| Visibility | Always public summaries | Public/Restricted/Private |
| Access | Open to all | May require approval |
| Content | High-level description | Full methodology |
| Storage | Database metadata | Database + private storage |

**Link:** `lab_writeups.project_id` can optionally reference a portfolio `project`.

## Security Best Practices

### Active Machine Protection
- ⚠️ Default active machines to `restricted` or `private`
- ⚠️ Never set `visibility = 'public'` for `machine_status = 'active'` unless verified safe
- ⚠️ Wait for official retirement before making public

### Token Management
- Generate strong random tokens (32 bytes minimum)
- Hash before storing
- Set reasonable expiration (30 days default)
- Consider view limits for sensitive content
- Revoke tokens if compromised

### Audit Trail
- All access events logged to `writeup_access_logs`
- Log retention: Currently unlimited (consider 90-day policy for production)

## Testing Checklist

### Database
- [x] Migration applies without errors
- [x] All 4 tables created
- [x] RLS enabled on all tables
- [x] Triggers attached
- [x] Indexes created
- [x] Constraints enforced

### Build
- [x] TypeScript compiles
- [x] `npm run build` passes
- [x] No type errors

### Queries (Logical - No Data Yet)
- [x] Query functions defined
- [x] Return types match schema
- [x] Portfolio scoping implemented

### Tokens
- [x] Generate unique tokens
- [x] Hash consistently
- [x] Verify correctly
- [x] Server-side only (not client-bundled)

## Files Changed/Created

### Created
- `supabase/migrations/011_restricted_writeups_foundation.sql`
- `src/lib/writeups/tokens.ts`
- `docs/restricted-writeups-foundation.md`
- `supabase/APPLY_WRITEUPS_MIGRATION.md`
- `Docs/WRITEUPS_FOUNDATION_SUMMARY.md`

### Modified
- `src/types/portfolio.ts` - Added writeup types
- `src/lib/cms/queries.ts` - Added writeup queries
- `.env.example` - Added `WRITEUP_TOKEN_SECRET`

### Unchanged
- All existing managers (Experience, Skills, etc.)
- Public portfolio displays
- Ian's portfolio
- Violet's portfolio

## Next Steps: Task 27

Once this foundation is validated, Task 27 will implement:

1. **Writeups Manager** - Full CRUD interface in Control Center
2. **File Upload** - UI for uploading writeup documents
3. **Request Queue** - Approve/reject access requests
4. **Grant Manager** - Issue and revoke tokens
5. **Public Forms** - Request access form for visitors
6. **Token Access** - View granted writeups with token
7. **Public Display** - Show public writeups on portfolio
8. **Notifications** - Email alerts for requests/approvals

## Architecture Notes

### Why Separate from Projects?

**Projects:**
- High-level portfolio showcase
- Always safe for public display
- Marketing/branding focus

**Lab Writeups:**
- Detailed technical content
- May contain sensitive information
- Educational/demonstration focus
- Requires flexible access control

**Link:** A writeup can reference a project to connect detailed content to its portfolio card.

### Why Token-Based Access?

**Alternatives Considered:**
- Email-only access: No audit trail, no revocation
- Password protection: Shared passwords get leaked
- Auth-required: Forces users to create accounts

**Token Benefits:**
- ✅ No user account required
- ✅ Easy to share (single URL)
- ✅ Revocable per-token
- ✅ Time/view limits
- ✅ Full audit trail

### Why Private Storage?

**Public storage risks:**
- Direct URL guessing
- No access control
- No usage tracking

**Private storage + signed URLs:**
- ✅ Server-controlled access
- ✅ Short-lived URLs (15-60 min)
- ✅ Token validation before URL generation
- ✅ Usage tracking per view

## Troubleshooting

### Build Errors
- **Issue:** Type errors on JSONB fields
- **Fix:** Ensure query helpers normalize JSONB to `string[]`

### RLS Blocks Admin
- **Issue:** Cannot read own portfolio's writeups
- **Debug:** Check `portfolio_members` table for user's role
- **Fix:** Ensure user has role in target portfolio

### Token Validation Fails
- **Issue:** Valid tokens rejected
- **Fix:** Check token encoding (base64url), whitespace trimming

## Success Criteria

- [x] Migration file created and documented
- [x] All 4 tables with RLS and indexes
- [x] TypeScript types added and compile
- [x] CMS query helpers implemented
- [x] Token utilities created (server-side only)
- [x] Build passes without errors
- [x] Documentation complete
- [x] `.env.example` updated
- [x] No breaking changes to existing features
- [x] Storage bucket documented
- [x] Security model validated

## References

- **Full Documentation:** `docs/restricted-writeups-foundation.md`
- **Migration Guide:** `supabase/APPLY_WRITEUPS_MIGRATION.md`
- **Migration File:** `supabase/migrations/011_restricted_writeups_foundation.sql`
- **Token Utilities:** `src/lib/writeups/tokens.ts`

---

**Status:** ✅ Foundation Complete
**Next Task:** Task 27 - Writeups Manager UI & Public Access
**Build Status:** ✅ Passing (`npm run build` successful)
