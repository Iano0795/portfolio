# Public Writeup Request Flow Documentation

**Component:** Public Request Access for Restricted Writeups
**Migration:** `012_public_writeup_request_flow.sql`
**Status:** ✅ Complete (Request Flow Only)
**Task:** Task 28

## Overview

The Public Writeup Request Flow allows visitors on Violet's public portfolio to view safe teasers of restricted writeups and submit access requests for review. This creates a controlled, ethical approach to sharing sensitive security content.

## Purpose

### Problem
- Lab writeups contain detailed security analysis that should not be freely accessible
- Active machine content must not be exposed publicly
- Need a way for interested parties to request access responsibly

### Solution
- Display safe teaser metadata for restricted writeups
- Provide request form for collecting requester information
- Validate all requests server-side through RPC functions
- Log all request activity for audit trail
- Prevent duplicate pending requests

## Architecture

### Database Layer (portfolio/)

Two new RPC functions added:

#### 1. `get_requestable_lab_writeups(p_portfolio_slug text)`

**Purpose:** Return only safe teaser metadata for restricted writeups that can be requested publicly.

**Returns:**
- `id` - Writeup UUID
- `title` - Writeup title
- `slug` - URL-safe slug
- `platform` - Platform name (e.g., HackTheBox)
- `difficulty` - Difficulty level
- `category` - Challenge category
- `machine_status` - Status (active/retired/other)
- `visibility` - Always 'restricted' for requestable writeups
- `public_summary` - Safe overview content
- `public_teaser` - Brief description
- `tools` - Tools used (JSONB array)
- `skills` - Skills demonstrated (JSONB array)
- `tags` - Tags (JSONB array)
- `is_featured` - Featured flag
- `order_index` - Display order

**Does NOT Return:**
- `storage_bucket` - Storage location (private)
- `storage_path` - File path (private)
- `file_name` - File name (private)
- `file_type` - MIME type (private)
- Full restricted content
- Existing requests
- Access grants
- Logs

**Filters:**
- Portfolio slug matches `p_portfolio_slug`
- Portfolio is active
- Writeup is active
- Visibility = 'restricted' (not public or private)
- Machine status != 'active' (no active machines)

**Ordering:**
- Featured writeups first
- Then by order_index ascending
- Then by created_at descending

**Security:**
- `SECURITY DEFINER` - runs with function owner's privileges
- `STABLE` - result doesn't change within transaction
- Granted to `anon` and `authenticated` roles

#### 2. `create_writeup_access_request(...)`

**Purpose:** Safely create a pending access request with full validation.

**Parameters:**
- `p_portfolio_slug` (text) - Portfolio identifier
- `p_writeup_slug` (text) - Writeup identifier
- `p_requester_name` (text) - Full name (required)
- `p_requester_email` (text) - Email address (required)
- `p_requester_reason` (text) - Reason for access (required, max 1000 chars)
- `p_requester_organization` (text, optional) - Organization/affiliation

**Returns:**
- UUID of created request (on success)
- Raises exception with user-friendly message (on error)

**Validation Rules:**
1. **Input Validation:**
   - All text inputs trimmed
   - Email normalized to lowercase
   - Name cannot be empty
   - Email cannot be empty
   - Email must match basic format: `^[^@]+@[^@]+\.[^@]+$`
   - Reason cannot be empty
   - Reason max 1000 characters

2. **Portfolio Validation:**
   - Portfolio must exist
   - Portfolio must be active

3. **Writeup Validation:**
   - Writeup must exist in specified portfolio
   - Writeup must be active
   - Visibility must be 'restricted' (not public or private)
   - Machine status must not be 'active'

4. **Duplicate Prevention:**
   - Check for existing pending request with same email + writeup
   - If found, return friendly error message

**Actions:**
1. Insert into `writeup_access_requests`:
   - Resolved `portfolio_id` (never trusted from client)
   - Resolved `writeup_id` (never trusted from client)
   - Requester information
   - Status = 'pending'

2. Insert into `writeup_access_logs`:
   - Log event_type = 'request_created'
   - Actor email
   - Metadata: source, requester info

**Error Messages:**
- "Name is required."
- "Email is required."
- "Invalid email format."
- "Reason for access is required."
- "Reason must be 1000 characters or fewer."
- "Portfolio not found or inactive."
- "Writeup not found in this portfolio."
- "This writeup is not currently available for requests."
- "Public writeups do not require access requests."
- "This writeup is private and cannot be requested."
- "Access requests for active machines are not available at this time."
- "You already have a pending request for this writeup. Please wait for review."

**Security:**
- `SECURITY DEFINER` - runs with elevated privileges to insert
- Portfolio and writeup IDs resolved by slug (never from client)
- All business rules enforced at database level
- Granted to `anon` and `authenticated` roles

## Public App Layer (violets_portfolio/)

### Types Added

**RequestableWriteup:**
```typescript
{
  id: string;
  title: string;
  slug: string;
  platform?: string | null;
  difficulty?: string | null;
  category?: string | null;
  machine_status: "retired" | "other" | "active";
  visibility: "restricted";
  public_summary?: string | null;
  public_teaser?: string | null;
  tools: string[];
  skills: string[];
  tags: string[];
  is_featured: boolean;
  order_index: number;
}
```

**WriteupAccessRequestPayload:**
```typescript
{
  writeupSlug: string;
  requesterName: string;
  requesterEmail: string;
  requesterReason: string;
  requesterOrganization?: string;
}
```

**WriteupAccessRequestResult:**
```typescript
{
  success?: boolean;
  error?: string;
  requestId?: string;
}
```

### Query Functions

**getRequestableWriteups():**
- Calls `get_requestable_lab_writeups` RPC
- Hardcodes `p_portfolio_slug = "violet"`
- Normalizes JSONB arrays to string[]
- Returns empty array on error (graceful degradation)
- Never exposes storage paths

### Server Actions

**submitWriteupAccessRequest(payload):**
- Calls `create_writeup_access_request` RPC
- Hardcodes `p_portfolio_slug = "violet"`
- Passes validated payload
- Returns success/error result
- User-friendly error handling

### UI Components

**WriteupsSection:**
- Main section component
- Loads requestable writeups server-side
- Displays info banner about access requirements
- Shows grid of WriteupCard components
- Manages modal state for request form
- Hidden if no requestable writeups

**WriteupCard:**
- Individual writeup display card
- Shows safe teaser information
- Displays platform, difficulty, category
- Shows tools, skills, tags
- "Request Access" button
- Matches Violet's visual style

**WriteupRequestModal:**
- Modal overlay for request form
- Escape key to close
- Click outside to close
- Prevents body scroll when open
- Passes selected writeup to form

**WriteupRequestForm:**
- Request submission form
- Fields: name, email, organization (optional), reason
- Honeypot field for bot detection
- Form validation
- Loading state during submission
- Success state with confirmation message
- Error state with user-friendly messages
- Character counter for reason (1000 max)
- Auto-closes modal after successful submission (3s delay)

## Security Features

### Why Public Users Don't Read Restricted Rows Directly

**Problem:** Direct table access would expose:
- Storage paths (security risk)
- Private/active machine writeups (ethical concern)
- All portfolio data (isolation concern)

**Solution:** RPC functions provide:
- Controlled field selection
- Business rule enforcement
- Portfolio isolation
- Safe error messages

### Why Storage Paths Are Excluded

**Security Concerns:**
1. Direct storage URLs could be guessed/enumerated
2. Bypasses access control and audit logging
3. No way to track who accessed what
4. Cannot revoke access once URL is known

**Correct Flow:**
1. User requests access via form
2. Admin approves (Task 29)
3. System generates time-limited signed URL
4. Access logged for audit
5. URL expires automatically

### How Request Creation Is Validated

**Server-Side Validation:**
1. Input sanitization (trim, lowercase email)
2. Required field checking
3. Email format validation
4. Portfolio existence and active status
5. Writeup existence in portfolio
6. Writeup active status
7. Writeup visibility (must be 'restricted')
8. Writeup machine status (cannot be 'active')
9. Duplicate pending request prevention

**Client Never Controls:**
- Portfolio ID
- Writeup ID
- Request ID generation
- Status assignment

**Everything Resolved Server-Side:**
- Portfolio slug → portfolio_id
- Writeup slug → writeup_id
- Validation → insertable data

## What's Still Deferred

### Task 29: Approval Queue & Email Notifications

**NOT Built in This Task:**
- ❌ Admin approval queue UI
- ❌ Approve/reject actions
- ❌ Grant creation
- ❌ Email notifications (request received, approved, rejected)
- ❌ Token generation
- ❌ Token-based access pages
- ❌ Signed URL generation for file access
- ❌ View/download restricted writeups

**What IS Built:**
- ✅ Safe public display of requestable writeups
- ✅ Request form with validation
- ✅ Request creation with logging
- ✅ Duplicate prevention
- ✅ RPC functions for safe access

## Data Flow

### Loading Requestable Writeups

1. Violet's page loads
2. Calls `getRequestableWriteups()`
3. Function calls RPC with `p_portfolio_slug = "violet"`
4. RPC queries `lab_writeups` with filters:
   - Portfolio = Violet
   - Active writeups only
   - Visibility = restricted
   - Machine status != active
5. Returns safe fields only (no storage paths)
6. Normalized to TypeScript types
7. Passed to WriteupsSection component
8. If empty, section hidden

### Submitting Access Request

1. User clicks "Request Access" on writeup card
2. Modal opens with WriteupRequestForm
3. User fills form:
   - Name (required)
   - Email (required)
   - Organization (optional)
   - Reason (required, max 1000 chars)
4. User clicks "Submit Request"
5. Form validates client-side
6. Calls `submitWriteupAccessRequest()` server action
7. Action calls RPC with:
   - `p_portfolio_slug = "violet"` (hardcoded)
   - `p_writeup_slug = writeup.slug`
   - Form data
8. RPC validates:
   - Input format
   - Portfolio existence
   - Writeup requestability
   - No duplicate pending
9. RPC inserts request + log entry
10. Returns request ID or error
11. Form shows success/error state
12. Success: auto-close modal after 3s

### How Active/Private Writeups Are Blocked

**Active Machines:**
- RPC filter: `machine_status != 'active'`
- RPC validation: raises error if status = 'active'
- Never appear in requestable list
- Cannot be requested even with direct slug

**Private Writeups:**
- RPC filter: `visibility = 'restricted'`
- RPC validation: raises error if visibility = 'private'
- Never appear in requestable list
- Cannot be requested even with direct slug

**Public Writeups:**
- RPC filter: excludes public writeups
- RPC validation: raises error "do not require requests"
- Public writeups accessible directly (no request needed)

### How Storage Metadata Is Kept Private

**RPC SELECT Statement:**
```sql
select
  w.id,
  w.title,
  w.slug,
  -- ... safe fields ...
  -- NOTE: storage_bucket NOT selected
  -- NOTE: storage_path NOT selected
  -- NOTE: file_name NOT selected
  -- NOTE: file_type NOT selected
```

**Result:**
- Storage fields never returned by RPC
- Client never receives storage metadata
- No way to construct direct storage URLs
- Access must go through token + signed URL (Task 29)

### How Duplicate Requests Are Handled

**Check Query:**
```sql
select id from writeup_access_requests
where portfolio_id = v_portfolio_id
  and writeup_id = v_writeup_id
  and requester_email = v_normalized_email
  and status = 'pending';
```

**If Found:**
- Raise exception with friendly message
- User sees: "You already have a pending request for this writeup. Please wait for review."
- No duplicate request created
- Original request ID preserved

**If Not Found:**
- Proceed with insertion
- New request created
- Log entry added

## Testing Guide

### Manual SQL Tests

**1. Verify RPC functions exist:**
```sql
select proname from pg_proc
where proname in (
  'get_requestable_lab_writeups',
  'create_writeup_access_request'
);
-- Expected: 2 rows
```

**2. Test requestable writeups query:**
```sql
select * from public.get_requestable_lab_writeups('violet');
-- Expected: Only restricted, non-active writeups
-- Expected: NO storage_bucket, storage_path, file_name, file_type columns
```

**3. Create a test request:**
```sql
select public.create_writeup_access_request(
  'violet',
  'test-writeup-slug',  -- Replace with real slug
  'Test Requester',
  'test@example.com',
  'I would like access for learning purposes.',
  'Personal'
);
-- Expected: UUID returned
```

**4. Verify request created:**
```sql
select
  p.slug,
  w.title,
  r.requester_email,
  r.status,
  r.created_at
from writeup_access_requests r
join portfolios p on p.id = r.portfolio_id
join lab_writeups w on w.id = r.writeup_id
where p.slug = 'violet'
order by r.created_at desc;
```

**5. Verify log created:**
```sql
select
  p.slug,
  l.event_type,
  l.actor_email,
  l.created_at
from writeup_access_logs l
join portfolios p on p.id = l.portfolio_id
where p.slug = 'violet'
order by l.created_at desc;
-- Expected: 'request_created' event
```

**6. Test duplicate prevention:**
```sql
-- Run same request again
select public.create_writeup_access_request(
  'violet',
  'test-writeup-slug',
  'Test Requester',
  'test@example.com',
  'Another reason.',
  'Personal'
);
-- Expected: Error "You already have a pending request..."
```

### Manual App Tests

**1. Basic Load:**
- Open Violet's portfolio
- Confirm normal sections load
- Confirm Writeups section appears (if writeups exist)
- Confirm no build errors

**2. View Writeups:**
- Confirm restricted writeups display
- Confirm active machine writeups do NOT appear
- Confirm private writeups do NOT appear
- Confirm storage paths NOT visible in:
  - UI display
  - Browser DevTools Network tab
  - Page source

**3. Request Access:**
- Click "Request Access" button
- Confirm modal opens
- Fill out form with valid data
- Click "Submit Request"
- Confirm success message appears
- Confirm modal auto-closes after 3s

**4. Duplicate Request:**
- Request same writeup again with same email
- Confirm friendly error: "already have a pending request"

**5. Form Validation:**
- Try submitting without name → error
- Try submitting without email → error
- Try submitting without reason → error
- Try submitting with invalid email → error

**6. Cross-Portfolio Isolation:**
- Confirm only Violet writeups appear
- Confirm no Ian writeups visible
- Verify network requests use `p_portfolio_slug = 'violet'`

## Troubleshooting

### RPC Functions Not Found

**Issue:** Error "function does not exist"

**Fix:** Run migration `012_public_writeup_request_flow.sql`

### Storage Paths Visible

**Issue:** Storage metadata appears in response

**Fix:** Verify RPC SELECT statement excludes storage fields

### Active Machines Appearing

**Issue:** Active machine writeups show in list

**Fix:** Check RPC filter: `machine_status != 'active'`

### Cannot Submit Request

**Issue:** RPC raises error on valid data

**Debug:**
```sql
-- Check portfolio exists
select * from portfolios where slug = 'violet' and is_active = true;

-- Check writeup exists
select * from lab_writeups
where portfolio_id = (select id from portfolios where slug = 'violet')
  and slug = 'your-writeup-slug'
  and is_active = true;

-- Check writeup visibility
select visibility, machine_status from lab_writeups where slug = 'your-writeup-slug';
```

### Duplicate Error When No Duplicate Exists

**Issue:** "already have a pending request" but no request found

**Debug:**
```sql
select * from writeup_access_requests
where requester_email = 'your-email@example.com'
  and status = 'pending';
```

---

**Created:** Task 28 - Public Writeup Request Flow
**Status:** ✅ Complete (Request Flow Only)
**Next:** Task 29 - Approval Queue & Email Notifications
