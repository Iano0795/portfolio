# Task 28: Public Writeup Request Flow - COMPLETE ✅

**Status:** ✅ Complete  
**Migration:** `012_public_writeup_request_flow.sql`  
**Date:** 2026-06-14  
**Build Status:** ✅ Both projects build successfully

---

## What Was Built

### Database Layer (portfolio/)

Two secure RPC functions for safe public access:

**1. `get_requestable_lab_writeups(p_portfolio_slug text)`**
- Returns ONLY safe teaser metadata for restricted writeups
- Filters out active machines, private writeups, and public writeups
- **Excludes all storage metadata** (bucket, path, filename, type)
- Security: `SECURITY DEFINER`, granted to `anon` and `authenticated`
- Ordering: featured first, then by order_index, then by created_at

**2. `create_writeup_access_request(...)`**
- Safely creates pending access requests with full validation
- All portfolio/writeup IDs resolved server-side (never from client)
- Prevents duplicate pending requests (same email + writeup)
- Inserts log entry for audit trail
- Returns request UUID on success, raises exception with friendly error message on failure
- Security: `SECURITY DEFINER`, granted to `anon` and `authenticated`

### Public App Layer (violets_portfolio/)

**Types Added:**
- `RequestableWriteup` - Safe writeup metadata
- `WriteupAccessRequestPayload` - Request form data
- `WriteupAccessRequestResult` - Success/error response

**Query Functions:**
- `getRequestableWriteups()` - Fetches requestable writeups via RPC
- Hardcodes portfolio slug "violet"
- Normalizes JSONB arrays to string[]

**Server Actions:**
- `submitWriteupAccessRequest()` - Submits access request via RPC
- Hardcodes portfolio slug "violet"
- Returns user-friendly success/error result

**UI Components:**
1. **WriteupsSection** - Main section component
   - Loads writeups server-side
   - Displays info banner about access requirements
   - Grid layout for WriteupCard components
   - Manages modal state

2. **WriteupCard** - Individual writeup display
   - Shows title, platform, difficulty, category
   - Displays tools, skills, tags badges
   - "Request Access" button

3. **WriteupRequestModal** - Modal overlay
   - Escape/click-outside to close
   - Prevents body scroll when open

4. **WriteupRequestForm** - Request submission form
   - Fields: name*, email*, organization, reason* (*required)
   - Honeypot field for bot detection
   - Client-side validation
   - Loading/success/error states
   - Character counter (1000 max for reason)
   - Auto-closes on success after 3s

**Page Integration:**
- Updated `src/app/page.tsx` to load and display writeups section

---

## Security Features

### Why RPC Functions Are Required

**Problem:** Direct table access would expose:
- Storage paths (security vulnerability)
- Private/active writeups (ethical concern)
- All portfolio data (isolation breach)

**Solution:** RPC functions provide:
- Controlled field selection
- Business rule enforcement at database level
- Portfolio-scoped queries
- Safe error messages without leaking internal state

### Storage Path Protection

**Why Storage Paths Are Excluded:**
1. Direct URLs could be guessed/enumerated
2. Bypasses access control and audit logging
3. Cannot track who accessed content
4. Cannot revoke access once URL is known

**Correct Access Flow (Task 29):**
1. User submits request → 2. Admin approves → 3. System generates time-limited signed URL → 4. Access logged → 5. URL expires

### Server-Side Validation (RPC Function)

**Input Validation:**
- Trim all text inputs
- Normalize email to lowercase
- Check required fields (name, email, reason)
- Validate email format: `^[^@]+@[^@]+\.[^@]+$`
- Enforce reason max length: 1000 characters

**Business Rules Enforced:**
1. Portfolio must exist and be active
2. Writeup must exist in specified portfolio
3. Writeup must be active
4. Visibility must be 'restricted' (not public or private)
5. Machine status must not be 'active'
6. No duplicate pending requests (same email + writeup)

**Security Guarantees:**
- Portfolio/writeup IDs resolved from slugs (never from client)
- All validation at database level (client cannot bypass)
- Atomic insert with log entry
- No raw SQL injection points

---

## Key Design Decisions

### 1. Hardcoded Portfolio Slug

**Decision:** `violets_portfolio` always uses `p_portfolio_slug = "violet"`

**Why:**
- Single-tenant public app architecture
- No risk of accessing other portfolio data
- Simplifies client code
- Clear security boundary

### 2. No Storage Metadata in Public Response

**Decision:** RPC SELECT explicitly excludes `storage_bucket`, `storage_path`, `file_name`, `file_type`

**Why:**
- Prevents direct file access attempts
- Forces use of controlled access flow
- Enables audit logging
- Supports time-limited access (Task 29)

### 3. Duplicate Pending Request Prevention

**Decision:** One pending request per email + writeup combination

**Why:**
- Prevents spam/abuse
- Reduces admin approval queue noise
- Clear user expectation: wait for review
- User can resubmit after approval/rejection

### 4. Friendly Error Messages

**Decision:** RPC raises exceptions with user-readable messages

**Examples:**
- "You already have a pending request for this writeup. Please wait for review."
- "Access requests for active machines are not available at this time."
- "This writeup is private and cannot be requested."

**Why:**
- Better UX than generic database errors
- Guides users to correct action
- No internal implementation details leaked

---

## What's Intentionally NOT Built (Deferred to Task 29)

This task focuses ONLY on the public request submission flow. The following are explicitly deferred:

### Admin Approval Features
- ❌ Approval queue UI in Control Center
- ❌ Approve/reject actions
- ❌ Bulk approval operations
- ❌ Admin notes/comments on requests

### Access Grant Features
- ❌ Grant creation with token generation
- ❌ Token-based access pages
- ❌ Signed URL generation for file access
- ❌ View/download restricted writeups
- ❌ Token expiration handling

### Email Notifications
- ❌ Request received confirmation email
- ❌ Approval notification email with access link
- ❌ Rejection notification email
- ❌ Email templates/service integration

### Analytics/Reporting
- ❌ Request metrics dashboard
- ❌ Popular writeups analysis
- ❌ Request approval rates
- ❌ Access log reports

---

## Files Created/Modified

### Database (portfolio/)
- ✅ `supabase/migrations/012_public_writeup_request_flow.sql` - RPC functions
- ✅ `docs/public-writeup-request-flow.md` - Technical documentation
- ✅ `Docs/PUBLIC_WRITEUP_REQUEST_FLOW_SUMMARY.md` - This summary

### Public App (violets_portfolio/)

**Types & Queries:**
- ✅ `src/lib/cms/types.ts` - Added RequestableWriteup, WriteupAccessRequestPayload, WriteupAccessRequestResult
- ✅ `src/lib/cms/queries.ts` - Added getRequestableWriteups()
- ✅ `src/lib/cms/actions.ts` - Added submitWriteupAccessRequest()

**Components:**
- ✅ `src/components/sections/WriteupsSection.tsx` - Main section
- ✅ `src/components/ui/WriteupCard.tsx` - Writeup display card
- ✅ `src/components/ui/WriteupRequestModal.tsx` - Modal overlay
- ✅ `src/components/ui/WriteupRequestForm.tsx` - Request form

**Page:**
- ✅ `src/app/page.tsx` - Integrated WriteupsSection

**Documentation:**
- ✅ `docs/writeup-request-flow.md` - Implementation guide

---

## Testing Completed

### Build Validation
- ✅ `portfolio/` - Build passes (no TypeScript errors)
- ✅ `violets_portfolio/` - Build passes (no TypeScript errors)

### Manual Testing Recommended

**Database Layer:**
```sql
-- 1. Verify RPC functions exist
select proname from pg_proc
where proname in ('get_requestable_lab_writeups', 'create_writeup_access_request');

-- 2. Test requestable writeups query
select * from public.get_requestable_lab_writeups('violet');
-- Confirm: NO storage_bucket, storage_path, file_name, file_type columns

-- 3. Create test request
select public.create_writeup_access_request(
  'violet',
  'test-writeup-slug',
  'Test User',
  'test@example.com',
  'Testing access request flow.',
  'Personal'
);

-- 4. Verify request created
select r.*, w.title, p.slug
from writeup_access_requests r
join lab_writeups w on w.id = r.writeup_id
join portfolios p on p.id = r.portfolio_id
where p.slug = 'violet'
order by r.created_at desc;

-- 5. Verify log entry
select * from writeup_access_logs
where event_type = 'request_created'
order by created_at desc;

-- 6. Test duplicate prevention
-- Run same request again - should raise exception
```

**UI Testing:**
1. Open Violet's portfolio in browser
2. Navigate to Writeups section (if writeups exist)
3. Confirm restricted writeups display
4. Confirm active/private writeups do NOT appear
5. Click "Request Access" button
6. Fill form and submit
7. Confirm success message
8. Confirm modal auto-closes
9. Try submitting duplicate request - should show error
10. Inspect network requests - confirm no storage paths visible

---

## Data Flow

### Loading Writeups
1. Page loads → `getRequestableWriteups()` called
2. Supabase RPC: `get_requestable_lab_writeups('violet')`
3. Database returns filtered, safe metadata (no storage paths)
4. Response normalized to TypeScript types
5. Passed to `WriteupsSection` component
6. Section hidden if empty array

### Submitting Request
1. User fills form → clicks "Submit Request"
2. Client-side validation
3. Server action: `submitWriteupAccessRequest(payload)`
4. Supabase RPC: `create_writeup_access_request(...)`
5. Database validates business rules
6. Insert request + log entry (atomic)
7. Return request UUID
8. Form shows success state
9. Modal auto-closes after 3s

---

## Next Steps (Task 29)

### Admin Approval Queue
- Build admin UI at `/admin/portfolio/[portfolioSlug]/writeups/requests`
- List pending requests with filtering
- Approve/reject actions
- Admin notes/comments

### Grant Creation & Token Generation
- Generate secure random tokens on approval
- Hash tokens before storage
- Create grants in `writeup_access_grants` table
- Send approval email with access link

### Token-Based Access Pages
- Build public access page: `/writeups/access/[token]`
- Validate token and check expiration
- Generate signed URL for storage file
- Track access in logs
- Handle expired/invalid tokens

### Email Notifications
- Set up email service (SendGrid, Resend, etc.)
- Create email templates
- Send confirmation on request submission
- Send approval/rejection notifications
- Include access links for approved requests

---

## Troubleshooting

### RPC Functions Not Found
**Symptom:** "function does not exist" error  
**Fix:** Run migration `012_public_writeup_request_flow.sql` in portfolio database

### Storage Paths Appearing in Response
**Symptom:** Client receives storage_bucket, storage_path fields  
**Fix:** Verify RPC SELECT statement excludes storage fields - they should NOT be in the column list

### Active Machines Showing
**Symptom:** Active machine writeups appear in public list  
**Fix:** Check RPC WHERE clause includes `machine_status != 'active'`

### Cannot Submit Valid Request
**Symptom:** RPC raises exception on valid data  
**Debug:**
```sql
-- Check portfolio
select * from portfolios where slug = 'violet' and is_active = true;

-- Check writeup
select * from lab_writeups
where portfolio_id = (select id from portfolios where slug = 'violet')
  and slug = 'YOUR_SLUG'
  and is_active = true;

-- Check visibility/status
select visibility, machine_status from lab_writeups where slug = 'YOUR_SLUG';
```

### Duplicate Error When No Duplicate Exists
**Symptom:** "already have a pending request" but no request found  
**Debug:**
```sql
select * from writeup_access_requests
where requester_email = 'YOUR_EMAIL'
  and writeup_id = (select id from lab_writeups where slug = 'YOUR_SLUG')
  and status = 'pending';
```

---

## Key Achievements

✅ **Secure Public Access:** RPC functions enforce all security rules at database level  
✅ **Storage Path Protection:** No storage metadata exposed to public clients  
✅ **Portfolio Isolation:** Violet's app only sees Violet's writeups  
✅ **Duplicate Prevention:** One pending request per email + writeup  
✅ **Audit Logging:** All requests logged for compliance  
✅ **User-Friendly Errors:** Clear messages guide users to correct action  
✅ **Build Validation:** Both projects compile without errors  
✅ **Type Safety:** Full TypeScript coverage for all new code  
✅ **Component Composition:** Modular, reusable UI components  
✅ **Accessibility:** Proper ARIA labels, focus management, keyboard navigation  

---

**Task 28 Status:** ✅ COMPLETE  
**Ready for Task 29:** Yes - approval queue, grants, and notifications can now be built
