# Restricted Writeups Foundation

## Overview

The Restricted Writeup Access System provides secure, controlled access to detailed lab writeups (e.g., HackTheBox, TryHackMe, or similar security challenge walkthroughs) while protecting active machine content from public disclosure.

This foundation establishes the database schema, security policies, type system, and server-side utilities needed to support the full writeup access workflow.

## Purpose

**Problem:** Portfolio projects show high-level summaries, but detailed technical writeups may need to be:
- **Public** - Safe for anyone to read (retired machines, approved content)
- **Restricted** - Available only after request/approval (sensitive but shareable)
- **Private** - Not publicly accessible (active machines, internal notes)

**Solution:** A token-based access control system that:
1. Separates public summaries from detailed writeups
2. Requires approval workflow for restricted content
3. Issues time-limited or view-limited access tokens
4. Tracks all access events for audit and compliance
5. Stores restricted files in private Supabase Storage with signed URL access

## Architecture

### Projects vs Lab Writeups

| Aspect | Projects | Lab Writeups |
|--------|----------|--------------|
| **Purpose** | Portfolio showcase cards | Detailed technical writeups |
| **Visibility** | Always public summaries | Public/Restricted/Private |
| **Content** | High-level description, stack, role | Full methodology, commands, screenshots |
| **Access** | Open to all visitors | May require request/approval |
| **Storage** | Metadata in database | Metadata + files in private storage |

**Relationship:** A `lab_writeup` can optionally reference a `project` via `project_id` to link the detailed writeup to its portfolio card.

## Database Schema

### Tables Added

#### 1. `lab_writeups`

Core writeup metadata and access control settings.

**Key Fields:**
- `portfolio_id` - Owner of the writeup
- `project_id` - Optional link to portfolio project card
- `visibility` - `public`, `restricted`, or `private`
- `machine_status` - `active`, `retired`, or `other`
- `storage_bucket`, `storage_path` - Location of full writeup file
- `public_summary`, `public_teaser` - Safe content for public display
- `tools`, `skills`, `tags` - JSONB arrays for filtering/categorization

**Access Rules:**
- Public users see only active `public` writeups
- Portfolio members see all writeups
- Only managers can create/edit/delete writeups

#### 2. `writeup_access_requests`

User requests to access restricted writeups.

**Key Fields:**
- `requester_name`, `requester_email` - Who is requesting
- `requester_reason`, `requester_organization` - Why they want access
- `status` - `pending`, `approved`, `rejected`, `cancelled`
- `reviewer_user_id`, `reviewer_note` - Who approved/rejected and why

**Access Rules:**
- Public users cannot list/read requests directly
- Public request creation will use a secure server action (Task 27)
- Portfolio members can read requests
- Managers can approve/reject requests

#### 3. `writeup_access_grants`

Issued access tokens for approved requests.

**Key Fields:**
- `token_hash` - SHA-256 hash of access token (never stores raw token)
- `requester_email` - Who has access
- `expires_at` - Optional expiration date
- `max_views`, `views_used` - Optional view limit tracking
- `revoked_at`, `revoke_reason` - Manual revocation

**Access Rules:**
- Public users cannot read grants directly
- Token validation uses secure server routes
- Portfolio members can read grants for auditing
- Managers can create/update/revoke grants

#### 4. `writeup_access_logs`

Audit log of all access-related events.

**Key Fields:**
- `event_type` - Type of event (see Event Types below)
- `actor_email`, `actor_user_id` - Who performed the action
- `metadata` - Additional context (JSONB)

**Event Types:**
- `request_created` - New access request submitted
- `request_approved` / `request_rejected` - Request decision
- `grant_created` - Token issued
- `grant_viewed` - Token used to access content
- `grant_revoked` - Token manually revoked
- `grant_expired` - Token expired naturally
- `file_signed_url_created` - Signed URL generated
- `access_denied` - Invalid/expired token attempt

**Access Rules:**
- Only portfolio members can read logs
- Server routes insert logs using service role client

## Security Model

### Token Security

**Never store raw tokens in the database.** Only token hashes are persisted.

**Token Flow:**
1. Generate: `generateAccessToken()` creates a cryptographically random token
2. Hash: `hashAccessToken(token)` produces SHA-256 hash for storage
3. Store: Only the hash is saved in `writeup_access_grants.token_hash`
4. Verify: `verifyAccessToken(token, hash)` validates token on access

**Future Enhancement:** For production, use HMAC with `WRITEUP_TOKEN_SECRET` env var for additional security against rainbow table attacks.

### Storage Security

**Bucket:** `writeups` (private)

**Path Pattern:** `writeups/{portfolioSlug}/{writeupSlug}/{timestamp}-{safe-file-name}`

**Access Control:**
- Bucket is **private** - no public read access
- Public users never receive raw storage paths
- Authenticated portfolio managers can upload/update/delete their portfolio's files
- Restricted content access requires:
  1. Valid access token
  2. Server-side token validation
  3. Server-generated short-lived signed URL (15-60 minutes)
  4. Log event for audit trail

**Storage Policies:** (Manual setup in Supabase Dashboard - see migration file comments)

### Row Level Security (RLS)

All tables have RLS enabled with policies based on:
- `public.can_view_portfolio_admin(portfolio_id)` - Portfolio member check
- `public.can_manage_portfolio(portfolio_id)` - Owner/admin/editor check

**Public Access:**
- `lab_writeups`: Read only active, public writeups
- `writeup_access_requests`: No direct read/write (use server actions)
- `writeup_access_grants`: No direct read/write (use server actions)
- `writeup_access_logs`: No access

## TypeScript Types

**Location:** `src/types/portfolio.ts`

**Added Types:**
- `LabWriteupVisibility` - Union type for visibility levels
- `LabWriteupMachineStatus` - Union type for machine status
- `LabWriteup` - Main writeup type
- `WriteupAccessRequest` - Request type
- `WriteupAccessGrant` - Grant type
- `WriteupAccessLog` - Log type

**CMS Types:** `src/lib/cms/queries.ts`
- `CmsLabWriteup`, `CmsWriteupAccessRequest`, etc.

## Query Helpers

**Location:** `src/lib/cms/queries.ts`

### Public Queries

```typescript
getPublicLabWriteups({ portfolioSlug })
```
Returns only active, public writeups for display on public portfolio.

```typescript
getLabWriteupBySlug(slug, { portfolioSlug })
```
Returns a specific writeup if user has access (public for all, or portfolio member for restricted/private).

### Admin Queries (Require Authentication)

```typescript
getAdminLabWriteups({ portfolioSlug })
```
Returns all writeups (including restricted/private) for CMS management.

```typescript
getWriteupAccessRequests({ portfolioSlug })
```
Returns all access requests for the portfolio.

```typescript
getWriteupAccessGrants({ portfolioSlug })
```
Returns all issued access grants for the portfolio.

```typescript
getWriteupAccessLogs({ portfolioSlug })
```
Returns recent access logs (limited to 100 most recent).

## Server-Side Token Utilities

**Location:** `src/lib/writeups/tokens.ts`

**CRITICAL:** Never expose these functions to client components. Use only in:
- Server actions
- API routes
- Server components

### Core Functions

```typescript
generateAccessToken(): string
```
Generates a 32-byte cryptographically secure random token (base64url encoded).

```typescript
hashAccessToken(token: string): string
```
Hashes a token using SHA-256 (hex encoded). TODO: Use HMAC with `WRITEUP_TOKEN_SECRET` for production.

```typescript
verifyAccessToken(token: string, storedHash: string): boolean
```
Timing-safe comparison of token against stored hash.

### Helper Functions

```typescript
getAccessTokenExpiry(days?: number): string
```
Generates ISO 8601 timestamp for token expiration (default: 30 days).

```typescript
isTokenExpired(expiresAt: string | null): boolean
```
Checks if a token has passed its expiration date.

```typescript
isGrantValid(grant): { isValid: boolean; reason?: string }
```
Validates a grant against expiration, revocation, and view limits.

```typescript
generateTokenLabel(token: string): string
```
Creates human-readable label for displaying partial tokens (e.g., `a7fE2mN9...eX8`).

## Environment Variables

**Added to `.env.example`:**

```bash
WRITEUP_TOKEN_SECRET=
```

**Optional:** HMAC secret for enhanced token security. Recommended for production.

**Generate with:**
```bash
openssl rand -base64 32
```

## Visibility Levels Explained

| Visibility | Machine Status | Public Display | Access Method |
|------------|----------------|----------------|---------------|
| `public` | `retired` | Full writeup visible | Direct access |
| `public` | `active` | ⚠️ Rare - only if verified safe | Direct access |
| `restricted` | `retired` | Summary only | Request → Approval → Token |
| `restricted` | `active` | Summary only | Request → Approval → Token |
| `private` | `retired` | Not shown publicly | Portfolio member only |
| `private` | `active` | Not shown publicly | Portfolio member only |

**Default Behavior:**
- `machine_status = 'active'` → Default to `restricted` or `private`
- Never make active machine writeups `public` unless explicitly verified safe

## Machine Status Levels

- **`active`** - Challenge is currently available and unsolved by most users
- **`retired`** - Challenge has been officially retired by platform
- **`other`** - Custom challenges, expired CTFs, or special cases

## What's NOT Built Yet (Intentionally Deferred to Task 27)

This foundation provides the database, types, and utilities. The following UI/workflow features are **not included** and will be built in Task 27:

### Deferred to Task 27: Writeups Manager UI

- ❌ Admin Control Center sidebar link to "Writeups"
- ❌ Writeup CRUD manager (create/edit/delete writeups)
- ❌ File upload UI for writeup documents
- ❌ Access request approval queue UI
- ❌ Grant management UI (issue/revoke tokens)
- ❌ Access log viewer
- ❌ Public request form (for users to request access)
- ❌ Token access page (for users to view granted writeups)
- ❌ Email notifications for requests/approvals
- ❌ Public portfolio writeups display section

### What IS Built (This Task)

- ✅ Database tables and constraints
- ✅ RLS policies
- ✅ Indexes and triggers
- ✅ TypeScript types
- ✅ CMS query helpers
- ✅ Server-side token utilities
- ✅ Storage bucket documentation
- ✅ Security foundation
- ✅ Documentation

## Storage Bucket Setup

**Manual Setup Required:** Create the `writeups` bucket in Supabase Dashboard.

### Steps:

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `writeups`
3. Set as **Private** (uncheck "Public bucket")
4. Add storage policies (see migration file for examples)

**Policy Guidelines:**
- Allow authenticated portfolio managers to INSERT/UPDATE/DELETE their own files
- No SELECT policy (or set to false) for private bucket
- Access controlled via server-generated signed URLs only

## Signed URL Workflow (Future Implementation)

When a user provides a valid token:

1. Server validates token hash against `writeup_access_grants`
2. Server checks grant validity (expiration, revocation, view limits)
3. Server increments `views_used` if applicable
4. Server generates short-lived signed URL (15-60 minutes)
5. Server logs `grant_viewed` event
6. Server returns signed URL to client
7. Client displays/downloads file using signed URL

**Security:** Signed URLs expire quickly and are generated on-demand per request.

## Migration Instructions

### Apply Migration

```bash
# In Supabase Dashboard SQL Editor or via CLI
psql <connection-string> -f supabase/migrations/011_restricted_writeups_foundation.sql
```

### Verify Tables

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

Should return 4 rows.

### Verify RLS

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

All should have `rowsecurity = t` (true).

### Verify Indexes

```sql
select indexname from pg_indexes
where schemaname = 'public'
and tablename = 'lab_writeups';
```

Should show multiple indexes including `lab_writeups_portfolio_id_idx`.

## Testing Checklist

### Database Tests
- [ ] Migration applies without errors
- [ ] All 4 tables created
- [ ] RLS enabled on all tables
- [ ] Triggers attached (updated_at)
- [ ] Indexes created
- [ ] Constraints enforced (visibility, status values)

### Type Tests
- [ ] TypeScript types compile without errors
- [ ] `npm run build` passes

### Query Tests
- [ ] `getPublicLabWriteups()` returns empty array (no data yet)
- [ ] `getAdminLabWriteups()` requires authentication
- [ ] Queries respect RLS policies

### Token Tests
- [ ] `generateAccessToken()` produces unique tokens
- [ ] `hashAccessToken()` produces consistent hashes
- [ ] `verifyAccessToken()` validates correctly
- [ ] Token utilities are server-side only (not bundled in client)

## Next Steps: Task 27

Once this foundation is validated, Task 27 will build:

1. **Writeups Manager UI** - Admin interface for CRUD operations
2. **File Upload** - UI for uploading writeup documents to storage
3. **Request Approval Queue** - Review and approve/reject access requests
4. **Grant Management** - Issue and revoke access tokens
5. **Public Request Form** - Allow users to request access
6. **Token Access Page** - Allow users to view granted writeups
7. **Public Writeups Section** - Display public writeups on portfolio
8. **Email Notifications** - Notify on request/approval events

## Security Considerations

### Active Machine Protection

**Critical:** Never expose writeups for `machine_status = 'active'` with `visibility = 'public'` unless explicitly verified safe.

**Best Practice:**
- Default active machines to `restricted` or `private`
- Wait for official retirement before making `public`
- Review writeup content to ensure no spoilers for active challenges

### Token Revocation

Tokens can be revoked by setting:
```sql
UPDATE writeup_access_grants
SET revoked_at = now(),
    revoked_by = <admin_user_id>,
    revoke_reason = 'Reason for revocation'
WHERE id = <grant_id>;
```

### Audit Trail

All access events are logged to `writeup_access_logs` for compliance and security auditing.

**Log Retention:** Current implementation keeps all logs. Consider adding a retention policy for production (e.g., 90 days).

## Troubleshooting

### Build Errors

If `npm run build` fails with type errors:
- Ensure `src/types/portfolio.ts` exports new types
- Check for JSONB normalization in query helpers (should convert to `string[]`)

### RLS Policy Errors

If queries return empty despite data existing:
- Check authentication status
- Verify `portfolio_id` matches current user's portfolio
- Test with service role client to bypass RLS

### Token Validation Fails

If tokens don't validate:
- Ensure token is hashed before storage
- Check for whitespace/encoding issues
- Verify timing-safe comparison is working

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Created:** Task 26 - Restricted Writeups Foundation
**Next:** Task 27 - Writeups Manager UI & Public Access
