# Writeups Manager Documentation

**Component:** Control Center - Writeups Manager
**Route:** `/admin/portfolio/[portfolioSlug]/writeups`
**Status:** ✅ Complete (Admin UI Only)
**Task:** Task 27

## Overview

The Writeups Manager is the Control Center interface for managing lab writeups (HackTheBox, TryHackMe, custom challenges, etc.) with visibility control, access restrictions, and safe public summaries.

## Purpose

### Projects vs Lab Writeups

| Feature | Projects | Lab Writeups |
|---------|----------|--------------|
| **Purpose** | Portfolio showcase cards | Detailed technical writeups |
| **Visibility** | Always public summaries | Public/Restricted/Private |
| **Content** | High-level overview | Full methodology & exploitation |
| **Access** | Open to all visitors | May require approval |
| **Management** | Projects Manager | Writeups Manager |

**Key Difference:** Projects show what you've built. Writeups show how you solved challenges with detailed steps that may need access control.

## Access Control

### Who Can Access

- **Owner/Admin/Editor:** Full CRUD access (create, edit, archive, restore, reorder)
- **Viewer:** Read-only access (can see writeups but cannot modify)
- **Non-members:** No access to admin interface

### Portfolio Scoping

- All writeups are scoped to a specific portfolio
- Users can only see/edit writeups for portfolios they're members of
- Ian cannot see/edit Violet's writeups and vice versa
- `portfolio_id` is resolved server-side from `portfolioSlug` (never trusted from client)

## Visibility Levels

### Public
- **Behavior:** Visible to all website visitors
- **Use Case:** Safe, retired machine writeups with no spoilers
- **Restriction:** Active machines CANNOT be public (enforced by validation)
- **Content:** Only safe summaries and teasers

### Restricted (Default)
- **Behavior:** Listed publicly but requires access request/approval
- **Use Case:** Most writeups (retired but still sensitive content)
- **Access:** Token-based access after approval (built in Task 28)
- **Content:** Public teaser + restricted full writeup file

### Private
- **Behavior:** Not shown publicly at all
- **Use Case:** Internal notes, active machines, incomplete writeups
- **Access:** Portfolio members only
- **Content:** Fully hidden from public

## Machine Status

### Active
- **Meaning:** Challenge is currently available and unspoiled
- **Safety Rule:** Cannot be set to public visibility
- **Validation:** System prevents active + public combination
- **Recommendation:** Use "restricted" or "private"

### Retired
- **Meaning:** Challenge has been officially retired by platform
- **Safety Rule:** Can be any visibility level
- **Recommendation:** "public" if content is safe, "restricted" if detailed

### Other
- **Meaning:** Custom challenges, expired CTFs, or non-platform labs
- **Safety Rule:** No specific restrictions
- **Use Case:** Personal projects, training exercises

## Features

### Create/Edit Writeups

**Basic Info:**
- Title (required, max 180 chars)
- Slug (required, auto-generated from title, URL-safe)
- Linked project (optional, connects to portfolio project card)
- Platform (e.g., HackTheBox, TryHackMe)
- Difficulty (e.g., Easy, Medium, Hard)
- Category (e.g., Web, Linux, Windows)

**Safety & Visibility:**
- Machine status (active/retired/other)
- Visibility (public/restricted/private)
- Safety validation: active + public = blocked

**Public Content:**
- Public teaser (brief description, max 600 chars)
- Public summary (safe overview, max 1200 chars)
- ⚠️ Warning: Only include safe content here

**Tools, Skills & Tags:**
- Tools used (array, e.g., Nmap, Burp Suite)
- Skills demonstrated (array, e.g., Web Exploitation)
- Tags (array, e.g., SQLi, Linux, Buffer Overflow)
- Uses stable IDs to prevent input focus loss

**File Metadata:**
- Storage bucket (default: "writeups")
- Storage path (private bucket path)
- File name
- File type (MIME type)
- Note: File upload UI deferred to future update

**Display Settings:**
- Order index (manual sort order)
- Featured flag (highlight special writeups)
- Active/Published flag (archive vs active)

### Archive/Restore

- **Archive:** Marks writeup as inactive (soft delete)
- **Restore:** Reactivates archived writeup
- Archived writeups shown separately in list
- Can edit and restore archived writeups

### Reorder

- Active writeups can be reordered with up/down arrows
- Order saved immediately to database
- Archived writeups excluded from reordering

### Project Linking

- Optional connection to existing portfolio project
- Dropdown shows active projects from same portfolio
- Validates project belongs to same portfolio
- Useful for connecting detailed writeup to project card

## Security Features

### Validation Rules

**Server-Side Only:**
- Title required, max 180 chars
- Slug required, lowercase alphanumeric + hyphens
- Slug unique per portfolio (not globally)
- Active machines cannot be public
- All inputs sanitized and validated

**Client-Side:**
- Visual warnings for unsafe combinations
- Input length counters
- Format hints and help text

### Portfolio Scoping Enforcement

1. All queries filtered by `portfolio_id`
2. `portfolio_id` resolved from `portfolioSlug` server-side
3. Writeup ownership verified before mutations
4. Linked project ownership verified before linking
5. Cross-portfolio access blocked by RLS

### Array Fields Stability

**Problem:** Using editable string values as React keys causes input focus loss.

**Solution:** Each array item has a stable UUID `id` + editable `value`:
```typescript
{
  id: string;      // Stable UUID for React key
  value: string;   // Editable content
}
```

Saved to database as simple string arrays:
```json
["Nmap", "Burp Suite", "Linux"]
```

## File Storage (Metadata Only)

### Current Implementation

**Metadata fields only:**
- Storage bucket (text input)
- Storage path (text input)
- File name (text input)
- File type (text input)

**Manual workflow:**
1. Upload file to Supabase Storage `writeups` bucket manually
2. Copy path/name/type to writeup form
3. Save writeup with file metadata

### Future: File Upload UI

**Deferred to future update:**
- Drag-and-drop file upload
- Automatic path generation
- MIME type detection
- File size validation (10MB limit)
- Allowed types: PDF, Markdown, plain text
- Signed URL generation for admin preview

**Why deferred:**
- Storage bucket setup needs manual configuration
- Storage policies need to be added
- Signed URL generation requires service role client
- Focus Task 27 on CRUD foundation

## UI Components

### WriteupsManager (Main Component)
- Top-level manager with state management
- Handles create/edit/archive/restore/reorder
- Passes data to child components

### WriteupsList
- Displays active and archived writeups
- Shows badges (visibility, status, featured)
- Reorder controls (up/down arrows)
- Edit/archive/restore actions

### WriteupForm
- Multi-section form with all writeup fields
- Auto-slug generation from title
- Safety validation warnings
- Array field editors (tools/skills/tags)
- Project linking dropdown

### WriteupPreviewCard
- Live preview of writeup as it's edited
- Shows badges, metadata, arrays
- File attachment indicator

### Badge Components
- WriteupVisibilityBadge (public/restricted/private)
- WriteupMachineStatusBadge (active/retired/other)
- WriteupStatusBadge (active/archived)

### WriteupArrayFields
- Reusable component for tools/skills/tags
- Add/remove items
- Stable IDs prevent focus loss

## Data Flow

### Page Load

1. Server validates portfolio access
2. Queries writeups for portfolio
3. Queries projects for portfolio (linking dropdown)
4. Normalizes data to editor format
5. Passes to WriteupsManager component

### Create Writeup

1. User clicks "New Writeup"
2. Manager creates draft with defaults
3. User fills form
4. User clicks "Save"
5. Manager converts to payload
6. Action validates payload
7. Action checks slug uniqueness
8. Action validates project ownership
9. Action inserts to database
10. Page refreshes with new writeup

### Update Writeup

1. User clicks "Edit" on writeup
2. Manager clones writeup (stable IDs)
3. User edits form
4. User clicks "Save"
5. Manager converts to payload
6. Action validates payload
7. Action verifies writeup ownership
8. Action checks slug uniqueness (excluding current)
9. Action validates project ownership
10. Action updates database
11. Page refreshes

### Archive/Restore

1. User clicks archive/restore button
2. Action verifies writeup ownership
3. Action updates `is_active` flag
4. Page refreshes

### Reorder

1. User clicks up/down arrow
2. Manager reorders locally (optimistic)
3. Action validates all writeup IDs belong to portfolio
4. Action updates `order_index` for all writeups
5. Page refreshes

## Server Actions

### createWriteupAction(portfolioSlug, payload)
- Validates payload
- Checks slug uniqueness in portfolio
- Validates linked project belongs to portfolio
- Auto-generates order index if not provided
- Inserts writeup with `portfolio_id`

### updateWriteupAction(portfolioSlug, writeupId, payload)
- Validates payload
- Verifies writeup belongs to portfolio
- Checks slug uniqueness (excluding current writeup)
- Validates linked project belongs to portfolio
- Updates writeup

### archiveWriteupAction(portfolioSlug, writeupId)
- Verifies writeup belongs to portfolio
- Sets `is_active = false`

### restoreWriteupAction(portfolioSlug, writeupId)
- Verifies writeup belongs to portfolio
- Sets `is_active = true`

### reorderWriteupsAction(portfolioSlug, orderedWriteupIds)
- Validates all writeup IDs belong to portfolio
- Updates `order_index` for all writeups in order

## What's NOT Built Yet

### Deferred to Task 28: Access Request & Approval

- ❌ Public request access form
- ❌ Approval queue UI
- ❌ Grant management (issue/revoke tokens)
- ❌ Access logs viewer
- ❌ Email notifications
- ❌ Token-based access pages
- ❌ Signed URL generation for restricted files

### Deferred to Future: File Upload UI

- ❌ Drag-and-drop file upload
- ❌ File browser/picker
- ❌ Automatic path generation
- ❌ Progress indicators
- ❌ Admin preview/download with signed URLs

### Deferred to Future: Public Display

- ❌ Public portfolio writeups section
- ❌ Writeup detail pages
- ❌ Search/filter for public writeups
- ❌ Request access button (public)

## Testing Checklist

### Ian Portfolio

- [ ] Login as Ian
- [ ] Navigate to `/admin/portfolio/ian/writeups`
- [ ] Confirm page loads successfully
- [ ] Create a new writeup
- [ ] Auto-slug generates from title
- [ ] Add tools/skills/tags without focus loss
- [ ] Link to an Ian project
- [ ] Try setting active + public (should show error)
- [ ] Save with retired + restricted
- [ ] Writeup appears in list
- [ ] Edit writeup and change details
- [ ] Archive writeup
- [ ] Confirm appears in archived section
- [ ] Restore writeup
- [ ] Reorder with up/down arrows
- [ ] Confirm Ian cannot see Violet writeups

### Violet Portfolio

- [ ] Login as Violet
- [ ] Navigate to `/admin/portfolio/violet/writeups`
- [ ] Confirm page loads successfully
- [ ] Create a Violet writeup
- [ ] Link to a Violet project
- [ ] Save and verify
- [ ] Confirm Violet cannot see Ian writeups

### Cross-Portfolio Security

- [ ] Ian tries accessing `/admin/portfolio/violet/writeups`
- [ ] Expected: Access denied or redirect
- [ ] Violet tries accessing `/admin/portfolio/ian/writeups`
- [ ] Expected: Access denied or redirect

### Viewer Role

- [ ] Login as viewer role user
- [ ] Open writeups page
- [ ] Confirm "Read-only access" badge shows
- [ ] Confirm New/Edit/Archive/Restore buttons disabled
- [ ] Confirm can view writeups but not modify

### Build Validation

- [ ] Run `npm run build` in portfolio/
- [ ] Confirm no TypeScript errors
- [ ] Confirm no build warnings

## Database Schema

Uses table `lab_writeups` from Task 26:

```sql
create table public.lab_writeups (
  id uuid primary key,
  portfolio_id uuid references public.portfolios(id),
  project_id uuid references public.projects(id),
  title text not null,
  slug text not null,
  platform text,
  difficulty text,
  category text,
  machine_status text not null default 'retired',
  visibility text not null default 'restricted',
  public_summary text,
  public_teaser text,
  tools jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  storage_bucket text,
  storage_path text,
  file_name text,
  file_type text,
  is_featured boolean default false,
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint lab_writeups_slug_unique_per_portfolio
    unique (portfolio_id, slug)
);
```

## Row Level Security

RLS policies from Task 26:
- Public users: Read only active public writeups
- Portfolio members: Read all writeups
- Portfolio managers: Full CRUD on their portfolio's writeups

No changes to RLS policies required.

## Sidebar Navigation

**Added:** Writeups link in AdminSidebar

**Position:** After Projects, before Credentials

**Module:** `writeups.vault`

**Icon:** Shield

**Route:** `/admin/portfolio/[portfolioSlug]/writeups`

## Navigation Manager Support

**Section ID:** `writeups`

**Behavior:**
- Navigation Manager now supports `writeups` as a section ID
- Public portfolios can ignore unsupported section IDs
- No breaking changes to existing navigation

## Files Created

### Route & Actions
- `src/app/admin/portfolio/[portfolioSlug]/writeups/page.tsx`
- `src/app/admin/portfolio/[portfolioSlug]/writeups/actions.ts`

### Components
- `src/components/admin/writeups/WriteupsManager.tsx`
- `src/components/admin/writeups/WriteupForm.tsx`
- `src/components/admin/writeups/WriteupsList.tsx`
- `src/components/admin/writeups/WriteupPreviewCard.tsx`
- `src/components/admin/writeups/WriteupArrayFields.tsx`
- `src/components/admin/writeups/WriteupVisibilityBadge.tsx`
- `src/components/admin/writeups/WriteupMachineStatusBadge.tsx`
- `src/components/admin/writeups/WriteupStatusBadge.tsx`
- `src/components/admin/writeups/types.ts`

### Documentation
- `docs/writeups-manager.md`

### Modified
- `src/components/admin/AdminShell.tsx` (added 'writeups' to activeItem type)
- `src/components/admin/AdminSidebar.tsx` (added Writeups link with Shield icon)

## Next Steps: Task 28

Once this manager is validated, Task 28 will build:

1. **Public Request Form** - Allow visitors to request access to restricted writeups
2. **Approval Queue UI** - Review and approve/reject access requests in Control Center
3. **Grant Management** - Issue and revoke access tokens
4. **Access Logs Viewer** - View audit trail of access events
5. **Token Access Page** - Public page for viewing granted writeups with token
6. **Email Notifications** - Notify on request/approval events

## Troubleshooting

### Build Errors

**Issue:** TypeScript errors on writeup types

**Fix:** Ensure all types are exported from `types.ts` and imported correctly

### Array Field Focus Loss

**Issue:** Inputs lose focus when typing in tools/skills/tags

**Fix:** Verify each item has stable UUID `id` field used as React key

### Slug Uniqueness Error

**Issue:** "Slug already exists" when creating new writeup

**Fix:** Change slug to be unique within the portfolio

### Active + Public Validation

**Issue:** Can't save active machine as public

**Fix:** This is intentional. Change status to "retired" or visibility to "restricted"

### Cross-Portfolio Access

**Issue:** Can see other portfolio's writeups

**Fix:** Verify RLS policies are enabled and portfolio_id scoping is correct

### Project Linking Not Working

**Issue:** Cannot select project from dropdown

**Fix:** Ensure project is active and belongs to the same portfolio

---

**Created:** Task 27 - Writeups Manager (Admin UI)
**Status:** ✅ Complete
**Next:** Task 28 - Request Access & Approval Workflow
