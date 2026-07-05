# Access Request Queue Documentation

**Component:** Control Center Access Request Queue  
**Task:** Task 29  
**Status:** ✅ Complete

---

## Overview

The Access Request Queue is a Control Center module that allows portfolio owners, admins, and editors to review restricted writeup access requests submitted from public portfolios. It provides a complete approval workflow including grant creation, token management, and revocation.

## Purpose

### Problem
- Public users submit access requests for restricted writeups
- Requests are stored in the database but need administrative review
- Admins need tools to approve/reject requests
- Approved requests need access grants with tokens
- Grants need management (view limits, expiry, revocation)

### Solution
- Centralized admin interface for all access requests
- Approval workflow with grant creation
- Rejection workflow with notes
- Revocation capability for active grants
- Portfolio-scoped access (each portfolio owner only sees their requests)
- Role-based permissions (viewer = read-only)

---

## Architecture

### Routes

**Main Route:**
- `/admin/portfolio/[portfolioSlug]/access-requests`

**Examples:**
- `/admin/portfolio/violet/access-requests`
- `/admin/portfolio/ian/access-requests`

### Components

**Location:** `src/components/admin/access-requests/`

1. **AccessRequestsManager.tsx** - Main container component
2. **AccessRequestsList.tsx** - List view with filtering and search
3. **AccessRequestDetailPanel.tsx** - Modal with full request details
4. **AccessRequestActions.tsx** - Action buttons for approve/reject/revoke
5. **AccessRequestStatusBadge.tsx** - Status badge (pending/approved/rejected/cancelled)
6. **GrantStatusBadge.tsx** - Grant status badge (active/expired/revoked/view limit)
7. **ApprovalForm.tsx** - Approval form with grant configuration
8. **RejectionForm.tsx** - Rejection form with reason field

### Server Actions

**Location:** `src/app/admin/portfolio/[portfolioSlug]/access-requests/actions.ts`

1. **approveAccessRequest** - Approve request and create grant
2. **rejectAccessRequest** - Reject request with reason
3. **revokeAccessGrant** - Revoke an active grant
4. **cancelAccessRequest** - Cancel pending request (optional)

### Query Helpers

**Location:** `src/lib/cms/writeup-access.ts`

1. **getAccessRequestsForAdmin** - Load all requests for portfolio
2. **getAccessRequestDetail** - Load single request with details
3. **getAccessGrantsForAdmin** - Load all grants for portfolio
4. **getAccessLogsForAdmin** - Load access logs with filtering

---

## Request Statuses

### Pending
- Initial status when request is created
- Awaiting admin review
- Can be approved or rejected

### Approved
- Request has been approved
- Grant has been created
- Token generated and displayed once
- Cannot be approved again

### Rejected
- Request has been rejected
- No grant created
- Cannot be approved (request stays rejected)

### Cancelled
- Request manually cancelled by admin
- No grant created
- Optional status (not heavily used)

---

## Approval Workflow

### User Action
1. Admin clicks "Approve Request" button
2. Approval form displays with configuration options

### Form Fields
- **Reviewer Note** (optional, max 1000 chars) - Internal note about approval
- **Expires In Days** (default: 14, range: 1-365) - Grant expiration
- **Max Views** (default: 5, range: 1-100) - View limit
- **Token Label** (optional, max 120 chars) - Custom token identifier

### Server-Side Validation

**Authentication & Authorization:**
- User must be authenticated
- User must have portfolio access
- User role must be owner/admin/editor (not viewer)

**Request Validation:**
- Request ID must be valid UUID
- Request must belong to selected portfolio
- Request status must be 'pending'

**Writeup Validation:**
- Associated writeup must exist
- Writeup must be active
- Writeup visibility must be 'restricted' (not public or private)
- Writeup machine status must not be 'active'

**Duplicate Prevention:**
- No existing grant for this request

### Grant Creation Process

1. **Calculate Expiry:**
   - Use provided `expiresAt` if given
   - Otherwise use `expiresInDays` to calculate
   - Default: 14 days from now

2. **Generate Token:**
   - Generate cryptographically secure random token (256 bits)
   - Hash token using SHA-256 before storage
   - Generate token label (first 8 + last 4 chars)

3. **Insert Grant:**
   ```sql
   INSERT INTO writeup_access_grants (
     portfolio_id,
     writeup_id,
     request_id,
     requester_email,
     token_hash,     -- HASHED, never raw
     token_label,
     expires_at,
     max_views,
     views_used,     -- starts at 0
     created_by
   )
   ```

4. **Update Request:**
   ```sql
   UPDATE writeup_access_requests SET
     status = 'approved',
     reviewer_user_id = current_user,
     reviewer_note = note,
     reviewed_at = now()
   ```

5. **Log Events:**
   - Insert `request_approved` log entry
   - Insert `grant_created` log entry

6. **Return Raw Token:**
   - Token returned ONCE to admin user
   - Never stored raw in database
   - Never logged
   - Admin must copy and send to requester

### Post-Approval

**Success Panel Displays:**
- ✅ Request approved successfully
- 🔐 Raw access token (displayed once)
- ⚠️ Security warning: token will not be shown again
- 📋 Copy button for token
- ℹ️ Note: Email delivery and access page coming in future tasks

**Admin Responsibility:**
- Copy the raw token
- Send it to the requester via email manually
- Token cannot be retrieved after closing the panel

---

## Rejection Workflow

### User Action
1. Admin clicks "Reject Request" button
2. Rejection form displays

### Form Fields
- **Rejection Reason** (optional, max 1000 chars) - Internal note

### Server-Side Validation
- User authenticated and authorized
- Request ID valid UUID
- Request belongs to portfolio
- Request status is 'pending'

### Rejection Process

1. **Update Request:**
   ```sql
   UPDATE writeup_access_requests SET
     status = 'rejected',
     reviewer_user_id = current_user,
     reviewer_note = reason,
     reviewed_at = now()
   ```

2. **Log Event:**
   - Insert `request_rejected` log entry

3. **No Grant Created:**
   - Rejection does not create a grant
   - User must submit a new request if needed

---

## Revocation Workflow

### User Action
1. Admin views approved request with active grant
2. Admin clicks "Revoke Grant" button
3. Confirmation dialog appears
4. Admin confirms revocation

### Form Fields (Optional)
- **Revoke Reason** (optional, max 1000 chars) - Why grant was revoked

### Server-Side Validation
- User authenticated and authorized
- Grant ID valid UUID
- Grant belongs to portfolio
- Grant not already revoked

### Revocation Process

1. **Update Grant:**
   ```sql
   UPDATE writeup_access_grants SET
     revoked_at = now(),
     revoked_by = current_user,
     revoke_reason = reason
   ```

2. **Log Event:**
   - Insert `grant_revoked` log entry

3. **Grant Still Exists:**
   - Grant row is not deleted
   - Revoked flag prevents future access
   - Audit trail preserved

---

## Grant Status Logic

### Active
- Not revoked (`revoked_at` is null)
- Not expired (`expires_at` is null or in future)
- View limit not reached (`views_used < max_views`)

### Expired
- `expires_at` is in the past
- Grant exists but cannot be used

### View Limit Reached
- `views_used >= max_views`
- Grant exists but cannot be used

### Revoked
- `revoked_at` is set
- Grant explicitly revoked by admin
- Cannot be un-revoked

---

## Security Features

### Raw Token Handling

**Why Tokens Are Shown Once:**
1. Tokens are cryptographically secure secrets
2. Storing raw tokens is a security risk
3. Hashing tokens prevents theft if database is compromised
4. Only the admin who approves sees the raw token

**Token Generation:**
- 32 bytes (256 bits) of cryptographic entropy
- URL-safe base64 encoding
- Example: `a7fE2mN9pQxR8vK3jL6nM1wS4yT7zC0bV5hD9gF2eX8`

**Token Storage:**
- Only hash stored in database (`token_hash` column)
- SHA-256 hash algorithm
- Original token never logged
- Original token never persisted

**Token Delivery:**
- Displayed once in approval success panel
- Admin copies manually
- Admin sends via email manually
- Email automation planned for Task 30

### Portfolio Isolation

**Portfolio ID Resolution:**
- Never trust `portfolio_id` from client
- Always resolve `portfolioSlug → portfolio_id` server-side
- Use `requirePortfolioAccess(slug)` for authentication + resolution

**Data Scoping:**
- All queries filter by `portfolio_id`
- Ian cannot see Violet's requests
- Violet cannot see Ian's requests
- RLS policies enforce database-level isolation

### Role-Based Access Control

| Role   | View Requests | Approve | Reject | Revoke |
|--------|---------------|---------|--------|--------|
| Owner  | ✅            | ✅      | ✅     | ✅     |
| Admin  | ✅            | ✅      | ✅     | ✅     |
| Editor | ✅            | ✅      | ✅     | ✅     |
| Viewer | ✅            | ❌      | ❌     | ❌     |

**Viewer Restrictions:**
- Can view requests and grants
- Cannot approve, reject, revoke, or cancel
- UI shows "Read-only access" banner
- Action buttons hidden
- Server actions return error if viewer attempts mutation

---

## UI Features

### Summary Cards
- **Pending** - Yellow - Count of pending requests
- **Approved** - Green - Count of approved requests
- **Rejected** - Red - Count of rejected requests
- **Total** - Gray - Total request count

### Filters
- **Status Filter** - All / Pending / Approved / Rejected
- **Search** - Search by requester name, email, or writeup title

### Request List
Each request card shows:
- Status badge (pending/approved/rejected)
- Grant status badge (active/expired/revoked/view limit)
- Writeup title and slug
- Requester name and email
- Request date
- Review date (if reviewed)
- Reason preview (first 2 lines)
- "View" button

### Detail Panel
Full modal with:
- Request status and grant status badges
- Writeup information (title, slug, visibility, machine status)
- Requester information (name, email, organization, reason)
- Timestamps (created, reviewed)
- Reviewer note (if present)
- Grant details (if approved):
  - Token label
  - Created date
  - Expires date
  - Views used / max views
  - Revoked status
- Action buttons based on status and role
- Approval form (if pending and authorized)
- Rejection form (if pending and authorized)

### Approval Success Panel
- ✅ Success confirmation
- 🔐 Raw token display (selectable text)
- 📋 Copy button with feedback
- ⚠️ Security warning: "Token will only be shown once"
- ℹ️ Feature note: "Email delivery and secure access page are planned for upcoming tasks"

---

## Data Flow

### Loading Requests
1. Page loads → `requirePortfolioAccess(portfolioSlug)`
2. Resolve `portfolio.id` from slug
3. Call `getAccessRequestsForAdmin(portfolio.id)`
4. Query `writeup_access_requests` with `portfolio_id` filter
5. Join `lab_writeups` for writeup details
6. Load related grants if requests are approved
7. Return typed `AccessRequestWithDetails[]`
8. Pass to `AccessRequestsManager` component

### Approving Request
1. User fills approval form → clicks "Approve & Create Grant"
2. Client calls `onApprove()` with form data
3. Server action `approveAccessRequest(portfolioSlug, requestId, payload)`
4. Authenticate user and require portfolio access
5. Validate inputs (note length, expiry range, view limit range)
6. Load request with writeup details (join query)
7. Validate request status, writeup status, no duplicate grant
8. Generate raw token, hash token, create token label
9. Insert grant with hashed token
10. Update request status to 'approved'
11. Insert log entries (request_approved, grant_created)
12. Revalidate page path
13. Return `{ success: true, rawToken, grantId }`
14. Client displays success panel with raw token
15. User copies token
16. User sends token to requester manually

### Rejecting Request
1. User fills rejection form → clicks "Reject Request"
2. Client calls `onReject()` with reason
3. Server action `rejectAccessRequest(portfolioSlug, requestId, payload)`
4. Authenticate and authorize
5. Validate request exists and is pending
6. Update request status to 'rejected'
7. Insert log entry (request_rejected)
8. Revalidate page path
9. Return `{ success: true }`
10. Client closes modal

### Revoking Grant
1. User clicks "Revoke Grant" → confirms
2. Client calls `onRevoke()` with grant ID
3. Server action `revokeAccessGrant(portfolioSlug, grantId, payload)`
4. Authenticate and authorize
5. Validate grant exists and not already revoked
6. Update grant: set `revoked_at`, `revoked_by`, `revoke_reason`
7. Insert log entry (grant_revoked)
8. Revalidate page path
9. Return `{ success: true }`
10. Grant status badge updates to "Revoked"

---

## What's Intentionally Deferred

### Task 30: Email Notifications (Not Built Yet)
- ❌ Email confirmation when request is received
- ❌ Email notification when request is approved (with token link)
- ❌ Email notification when request is rejected
- ❌ Email service integration (SendGrid, Resend, etc.)
- ❌ Email templates

### Task 31: Token Access Page (Not Built Yet)
- ❌ Public route: `/writeups/access/[token]`
- ❌ Token validation
- ❌ Signed URL generation for file access
- ❌ View count tracking
- ❌ Expiry checking
- ❌ Access denied page for invalid/expired/revoked tokens
- ❌ Writeup display page

### Current State
**Manual Token Delivery:**
- Admin approves request
- Admin copies raw token from success panel
- Admin sends token to requester via email manually
- Requester receives token but has no access page yet

**No Automated Emails:**
- Requesters don't get confirmation emails
- Requesters don't get approval/rejection notifications
- Admins must communicate manually

**Future Token Access:**
- Once Task 31 is complete, tokens can be used at `/writeups/access/{token}`
- Signed URLs will provide time-limited file access
- Access will be logged for audit
- Expired/revoked tokens will show appropriate error messages

---

## Testing Guide

### Prerequisites
1. At least one restricted writeup exists in portfolio
2. At least one access request submitted from public portfolio
3. Authenticated as portfolio member (owner/admin/editor/viewer)

### Test: Load Access Requests Queue
1. Login as Violet
2. Navigate to `/admin/portfolio/violet/access-requests`
3. **Expected:**
   - Page loads successfully
   - Summary cards show counts
   - Request list displays Violet's requests only
   - No Ian requests visible

### Test: View Request Detail
1. Click "View" on any request
2. **Expected:**
   - Modal opens
   - Request details displayed
   - Writeup info shown
   - Requester info shown
   - Status badges correct
   - Actions available based on status

### Test: Approve Request (Success Path)
1. Select pending request
2. Click "Approve Request"
3. Fill approval form:
   - Reviewer note: "Approved for educational use"
   - Expires in days: 14
   - Max views: 5
4. Click "Approve & Create Grant"
5. **Expected:**
   - Success panel displays
   - Raw token shown
   - Copy button works
   - Security warning shown
   - Feature note shown
   - Close modal
   - Request status = approved
   - Grant created in database
   - Logs recorded

### Test: Approve Request (Validation)
1. Try approving with expires_in_days = 500
2. **Expected:** Error "Expiry days must be between 1 and 365"
3. Try approving with max_views = 200
4. **Expected:** Error "Max views must be between 1 and 100"
5. Try approving with reviewer_note > 1000 chars
6. **Expected:** Error "Reviewer note must be 1000 characters or less"

### Test: Reject Request
1. Select pending request
2. Click "Reject Request"
3. Fill rejection form:
   - Reason: "Insufficient justification"
4. Click "Reject Request"
5. **Expected:**
   - Modal closes
   - Request status = rejected
   - No grant created
   - Log recorded

### Test: Revoke Grant
1. Select approved request with active grant
2. Click "Revoke Grant"
3. Confirm revocation
4. **Expected:**
   - Grant revoked_at timestamp set
   - Grant status badge = "Revoked"
   - Log recorded
   - Cannot revoke again

### Test: Viewer Read-Only Mode
1. Login as user with viewer role
2. Navigate to access-requests
3. **Expected:**
   - Requests visible
   - "Read-only access" banner shown
   - No approve/reject/revoke buttons
   - Detail panel shows "Read-only access" message

### Test: Cross-Portfolio Isolation
1. Login as Ian
2. Navigate to `/admin/portfolio/violet/access-requests`
3. **Expected:** Redirect to login with access_denied error
4. Navigate to `/admin/portfolio/ian/access-requests`
5. **Expected:**
   - Page loads successfully
   - Only Ian's requests visible
   - No Violet requests

### Test: Status Filters
1. Click "Pending" filter
2. **Expected:** Only pending requests shown
3. Click "Approved" filter
4. **Expected:** Only approved requests shown
5. Click "All" filter
6. **Expected:** All requests shown

### Test: Search
1. Enter requester email in search
2. **Expected:** Only matching requests shown
3. Enter writeup title in search
4. **Expected:** Only matching requests shown
5. Clear search
6. **Expected:** All requests shown

### Test: Token Copy
1. Approve a request
2. Click "Copy" button on raw token
3. Paste into text editor
4. **Expected:** Full token pasted correctly
5. **Expected:** Button shows "Copied" for 2 seconds

### Test: Grant Status Badges
1. Find approved request with active grant
2. **Expected:** Badge = "Active" (green)
3. Find approved request with expired grant
4. **Expected:** Badge = "Expired" (orange)
5. Find approved request with revoked grant
6. **Expected:** Badge = "Revoked" (red)
7. Find approved request with view limit reached
8. **Expected:** Badge = "View Limit Reached" (orange)

---

## Database Queries

### Check Request Counts by Portfolio
```sql
SELECT
  p.slug,
  COUNT(*) FILTER (WHERE r.status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE r.status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE r.status = 'rejected') AS rejected,
  COUNT(*) AS total
FROM writeup_access_requests r
JOIN portfolios p ON p.id = r.portfolio_id
GROUP BY p.slug;
```

### Check Grant Details
```sql
SELECT
  p.slug,
  w.title AS writeup,
  g.requester_email,
  g.token_label,
  g.expires_at,
  g.max_views,
  g.views_used,
  g.revoked_at,
  g.created_at
FROM writeup_access_grants g
JOIN portfolios p ON p.id = g.portfolio_id
JOIN lab_writeups w ON w.id = g.writeup_id
ORDER BY g.created_at DESC;
```

### Check Recent Logs
```sql
SELECT
  p.slug,
  l.event_type,
  l.actor_email,
  l.created_at,
  l.metadata
FROM writeup_access_logs l
JOIN portfolios p ON p.id = l.portfolio_id
ORDER BY l.created_at DESC
LIMIT 20;
```

---

## Troubleshooting

### "Request not found"
**Cause:** Request ID invalid or doesn't belong to portfolio  
**Fix:** Verify request exists and portfolio_id matches

### "Writeup is not active"
**Cause:** Associated writeup archived  
**Fix:** Restore writeup or reject request

### "Only restricted writeups can have access grants"
**Cause:** Writeup visibility changed to public or private  
**Fix:** Change writeup visibility back to restricted or reject request

### "Cannot grant access to active machines"
**Cause:** Writeup machine_status = 'active'  
**Fix:** Change machine status to 'retired' or 'other', or reject request

### "Grant already exists for this request"
**Cause:** Request was already approved  
**Fix:** View existing grant, revoke if needed, then can re-approve

### "Viewers cannot approve requests"
**Cause:** User role is 'viewer'  
**Fix:** Request owner/admin to upgrade role or have authorized user handle approval

### Token Not Showing After Approval
**Cause:** Page refreshed or modal closed  
**Fix:** Token cannot be retrieved. Admin must revoke grant and re-approve to generate new token

---

## Key Achievements

✅ **Centralized Admin Interface** - Single queue for all requests  
✅ **Approval Workflow** - Create grants with tokens  
✅ **Rejection Workflow** - Reject with internal notes  
✅ **Revocation Capability** - Revoke active grants  
✅ **Portfolio Isolation** - Each portfolio sees only their requests  
✅ **Role-Based Access** - Viewer read-only mode  
✅ **Token Security** - Raw tokens shown once, hashed in storage  
✅ **Audit Logging** - All actions logged  
✅ **Search & Filters** - Find requests quickly  
✅ **Grant Status** - Active/expired/revoked/view limit tracking  
✅ **Validation** - Server-side validation for all actions  
✅ **Type Safety** - Full TypeScript coverage  

---

**Task 29 Status:** ✅ COMPLETE  
**Next Tasks:**  
- Task 30: Email notifications for request status updates  
- Task 31: Public token access page with signed URL generation
