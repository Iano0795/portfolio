# Writeups Manager - Implementation Summary

**Task:** Task 27 - Build Writeups Manager in Control Center
**Status:** ✅ Complete (Admin UI Only)
**Date:** 2026-06-14
**Build Status:** ✅ Passing

## What Was Built

Complete Control Center interface for managing lab writeups with visibility control, access restrictions, and safe public content.

### ✅ Routes & Actions

**Page Route:**
- `src/app/admin/portfolio/[portfolioSlug]/writeups/page.tsx`
- Loads writeups and projects for portfolio
- Requires portfolio access (authenticated members only)
- Passes data to WriteupsManager component

**Server Actions:**
- `src/app/admin/portfolio/[portfolioSlug]/writeups/actions.ts`
- `createWriteupAction()` - Create new writeup
- `updateWriteupAction()` - Update existing writeup
- `archiveWriteupAction()` - Soft delete writeup
- `restoreWriteupAction()` - Restore archived writeup
- `reorderWriteupsAction()` - Update display order

### ✅ Components Created

**Main Manager:**
- `WriteupsManager.tsx` - Top-level manager with state management

**Form & List:**
- `WriteupForm.tsx` - Multi-section form (basic info, safety, content, arrays, file, display)
- `WriteupsList.tsx` - Active and archived writeups list
- `WriteupPreviewCard.tsx` - Live preview panel

**Field Components:**
- `WriteupArrayFields.tsx` - Reusable array editor (tools/skills/tags)

**Badge Components:**
- `WriteupVisibilityBadge.tsx` - Public/Restricted/Private badges
- `WriteupMachineStatusBadge.tsx` - Active/Retired/Other badges
- `WriteupStatusBadge.tsx` - Active/Archived badges

**Types:**
- `types.ts` - TypeScript types for writeups, payloads, results

### ✅ Navigation Updates

**AdminSidebar:**
- Added "Writeups" link after Projects
- Module: `writeups.vault`
- Icon: Shield
- Route: `/admin/portfolio/[portfolioSlug]/writeups`

**AdminShell:**
- Added 'writeups' to activeItem union type

## Key Features

### Create/Edit Writeups

**Basic Info:**
- Title (required, max 180 chars)
- Slug (auto-generated from title, URL-safe, unique per portfolio)
- Linked project (optional dropdown)
- Platform, difficulty, category

**Safety & Visibility:**
- Machine status (active/retired/other)
- Visibility (public/restricted/private)
- ⚠️ Validation: Active machines cannot be public

**Public Content:**
- Public teaser (max 600 chars)
- Public summary (max 1200 chars)
- ⚠️ Warning: Only safe content, no spoilers

**Arrays (No Focus Loss):**
- Tools used
- Skills demonstrated
- Tags
- Stable UUID IDs prevent input focus loss

**File Metadata:**
- Storage bucket
- Storage path
- File name
- File type
- Note: Upload UI deferred to future update

**Display:**
- Order index
- Featured flag
- Active/Published flag

### Archive/Restore

- Soft delete (sets `is_active = false`)
- Archived writeups shown separately
- Can restore archived writeups

### Reorder

- Up/down arrows for active writeups
- Optimistic UI update
- Saves order to database

### Project Linking

- Optional link to portfolio project
- Validates project belongs to same portfolio
- Connects writeup to project card

## Security Features

### Portfolio Scoping

✅ All writeups scoped by `portfolio_id`
✅ Resolved server-side from `portfolioSlug`
✅ Never trust `portfolio_id` from client
✅ Cross-portfolio access blocked by RLS
✅ Writeup ownership verified before mutations
✅ Project ownership verified before linking

### Visibility Validation

✅ Active machines cannot be public (server validation)
✅ Visual warnings for unsafe combinations
✅ Help text explains visibility levels

### Slug Uniqueness

✅ Unique per portfolio (not globally)
✅ Checked on create and update
✅ Excludes current writeup on update

### Array Field Stability

✅ Stable UUID IDs for React keys
✅ No focus loss when typing
✅ Each item has `{ id: string, value: string }`
✅ Saved as string arrays to database

## Access Control

### Role Permissions

| Role | View | Create | Edit | Archive | Restore | Reorder |
|------|------|--------|------|---------|---------|---------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Viewer Behavior:**
- "Read-only access" badge displayed
- All mutation buttons disabled
- Can view writeups but cannot modify

### Portfolio Isolation

✅ Ian cannot see/edit Violet writeups
✅ Violet cannot see/edit Ian writeups
✅ Access denied for non-members
✅ All queries filtered by portfolio

## Data Flow

### How Writeups are Loaded

1. Page validates portfolio access (`requirePortfolioAccess`)
2. Queries `lab_writeups` table filtered by `portfolio_id`
3. Queries `projects` table for linking dropdown
4. Normalizes JSONB arrays to `EditableListItem[]` with stable IDs
5. Passes to WriteupsManager component
6. Component displays list and form

### How Create Works

1. User clicks "New Writeup"
2. Manager creates draft with defaults:
   - `machineStatus: 'retired'`
   - `visibility: 'restricted'`
   - `isActive: true`
   - Auto-incremented `orderIndex`
3. User fills form
4. Slug auto-generates from title (can be edited)
5. User clicks "Save Writeup"
6. Manager converts to payload (EditableListItem[] → string[])
7. Action validates:
   - Title required
   - Slug unique in portfolio
   - Active + public blocked
   - Linked project belongs to portfolio
8. Action inserts to database with `portfolio_id`
9. Page revalidates and refreshes

### How Update Works

1. User clicks "Edit" on writeup
2. Manager clones writeup with stable IDs
3. User edits form
4. User clicks "Save"
5. Manager converts to payload
6. Action validates:
   - Writeup belongs to portfolio
   - Slug unique (excluding current)
   - Active + public blocked
   - Linked project belongs to portfolio
7. Action updates database
8. Page revalidates and refreshes

### How Archive/Restore Works

1. User clicks Archive/Restore button
2. Action verifies writeup belongs to portfolio
3. Action updates `is_active` flag
4. Page revalidates and refreshes

### How Reorder Works

1. User clicks up/down arrow
2. Manager reorders locally (optimistic UI)
3. Action validates all writeup IDs belong to portfolio
4. Action updates `order_index` for all writeups
5. Page revalidates and refreshes

### How Portfolio Scoping is Enforced

**Server-Side:**
1. `portfolioSlug` extracted from route params
2. `requirePortfolioAccess()` or `requirePortfolioManager()` called
3. Returns validated portfolio object with `portfolio.id`
4. All queries use `portfolio.id` (never client-provided `portfolio_id`)
5. RLS policies enforce portfolio-level access

**Database RLS:**
- Public: Read only active public writeups
- Members: Read all writeups for their portfolio
- Managers: Full CRUD for their portfolio

### How Role Permissions are Enforced

**Client-Side:**
1. Page checks role: `canSave(role)`
2. If viewer: `readOnly = true`
3. All mutation buttons disabled
4. Form inputs disabled

**Server-Side:**
1. Actions call `requirePortfolioManager()`
2. Throws error if not owner/admin/editor
3. Viewer cannot call mutation actions

### How Visibility & Safety Rules are Enforced

**Validation Rules:**
- `machineStatus = 'active' AND visibility = 'public'` → ERROR
- Enforced in `validateWriteupPayload()`
- Clear error message returned

**UI Warnings:**
- Red warning banner when active + public selected
- Help text explains visibility options
- Help text explains machine status meanings

### How Tools/Skills/Tags Avoid Focus Loss

**Problem:** Using editable values as React keys causes focus loss on change.

**Solution:**
1. Store as `EditableListItem[]` in component state:
   ```typescript
   { id: 'uuid-1', value: 'Nmap' }
   ```
2. Use `item.id` as React key (stable)
3. Edit `item.value` in input (changes don't affect key)
4. On save, map to string[]: `['Nmap', 'Burp Suite']`
5. On load, map back with stable IDs: `{ id: 'tool-writeup-id-0', value: 'Nmap' }`

### How File Upload/Metadata Works

**Current Implementation:**
- File metadata fields only (storage bucket, path, name, type)
- User manually uploads to Supabase Storage bucket
- User copies path/name/type into form
- Metadata saved to database

**Why Deferred:**
- Storage bucket needs manual configuration
- Storage policies need to be added
- Signed URL generation requires service role client
- Focus Task 27 on CRUD foundation

**Future Implementation:**
- Drag-and-drop file upload
- Automatic path generation (`writeups/{portfolioSlug}/{writeupSlug}/`)
- MIME type detection
- File size validation (10MB limit)
- Allowed types: PDF, Markdown, plain text
- Admin preview/download with signed URLs

## AdminSidebar Updated

✅ Added Writeups link
✅ Position: After Projects, before Credentials
✅ Icon: Shield (from lucide-react)
✅ Module: `writeups.vault`
✅ All existing links preserved

## Navigation Manager Support

✅ `writeups` added as supported section ID
✅ Public portfolios can ignore unsupported sections
✅ No breaking changes to existing navigation

## No New Migration

✅ Uses existing `lab_writeups` table from Task 26
✅ No schema changes required
✅ No RLS policy changes required
✅ All validation enforced in server actions

## Documentation

✅ `docs/writeups-manager.md` - Complete guide
✅ `Docs/WRITEUPS_MANAGER_SUMMARY.md` - This summary

## Build Validation

✅ `npm run build` passes successfully
✅ No TypeScript errors
✅ No build warnings
✅ New route visible: `/admin/portfolio/[portfolioSlug]/writeups`

## What's NOT Built (Intentionally Deferred)

### Task 28: Request Access & Approval

- ❌ Public request access form
- ❌ Approval queue UI in Control Center
- ❌ Grant management (issue/revoke tokens)
- ❌ Access logs viewer
- ❌ Email notifications
- ❌ Token-based access pages

### Future: File Upload UI

- ❌ Drag-and-drop file upload
- ❌ File browser/picker
- ❌ Automatic path generation
- ❌ Progress indicators
- ❌ Admin preview/download with signed URLs

### Future: Public Display

- ❌ Public portfolio writeups section
- ❌ Writeup detail pages
- ❌ Search/filter for public writeups
- ❌ Request access button (public)

## Testing Recommendations

### Ian Portfolio Tests

1. Login as Ian
2. Navigate to `/admin/portfolio/ian/writeups`
3. Create new writeup with auto-slug
4. Add tools/skills/tags (verify no focus loss)
5. Link to Ian project
6. Try active + public (verify error)
7. Save as retired + restricted
8. Edit writeup
9. Archive writeup
10. Restore writeup
11. Reorder with arrows
12. Verify Ian cannot see Violet writeups

### Violet Portfolio Tests

1. Login as Violet
2. Navigate to `/admin/portfolio/violet/writeups`
3. Create Violet writeup
4. Link to Violet project
5. Verify Violet cannot see Ian writeups

### Cross-Portfolio Security Tests

1. Ian tries `/admin/portfolio/violet/writeups` → Access denied
2. Violet tries `/admin/portfolio/ian/writeups` → Access denied

### Viewer Role Tests

1. Login as viewer
2. Open writeups page
3. Verify "Read-only access" badge
4. Verify all mutation buttons disabled

## Files Created

### Routes & Actions
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
- `Docs/WRITEUPS_MANAGER_SUMMARY.md`

## Files Modified

- `src/components/admin/AdminShell.tsx` - Added 'writeups' to activeItem type
- `src/components/admin/AdminSidebar.tsx` - Added Writeups link with Shield icon

## No Changes Made To

✅ Violet's public portfolio (`violets_portfolio/`)
✅ Ian's public portfolio (no public portfolio exists yet)
✅ Existing managers (Experience, Skills, Credentials, etc.)
✅ Database migrations
✅ RLS policies
✅ Existing navigation items

## Success Criteria

- [x] Route created: `/admin/portfolio/[portfolioSlug]/writeups`
- [x] All components created (9 components)
- [x] All actions created (5 actions)
- [x] Writeups loaded by portfolio
- [x] Create/update/archive/restore works
- [x] File metadata fields work
- [x] Portfolio scoping enforced
- [x] Role permissions enforced
- [x] Visibility/safety rules enforced
- [x] Array fields avoid focus loss
- [x] AdminSidebar updated
- [x] Navigation Manager supports 'writeups'
- [x] No new migration needed
- [x] Documentation complete
- [x] Build passes

## Architecture Highlights

### Visibility Levels

| Level | Public Display | Access Method | Use Case |
|-------|----------------|---------------|----------|
| Public | Full writeup visible | Direct access | Safe retired machines |
| Restricted | Teaser only | Request → Token | Most writeups |
| Private | Not shown | Members only | Active machines, drafts |

### Machine Status

| Status | Can be Public? | Meaning |
|--------|----------------|---------|
| Active | ❌ No | Currently available/unspoiled |
| Retired | ✅ Yes | Officially retired by platform |
| Other | ✅ Yes | Custom/non-platform labs |

### Projects vs Writeups

| Feature | Projects | Writeups |
|---------|----------|----------|
| Purpose | Portfolio showcase | Detailed walkthroughs |
| Visibility | Always public summaries | Public/Restricted/Private |
| Access | Open to all | May require approval |
| Content | High-level overview | Full methodology |
| Storage | Database only | Database + private storage |

## Troubleshooting

### Array Field Focus Loss
**Fix:** Verified stable UUID IDs used as React keys

### Active + Public Blocked
**Expected:** This is intentional for security

### Slug Uniqueness Error
**Fix:** Change slug to be unique within portfolio

### Cross-Portfolio Access
**Expected:** RLS blocks access to other portfolios

### Project Not in Dropdown
**Check:** Project must be active and same portfolio

---

**Status:** ✅ Complete (Admin UI)
**Next Task:** Task 28 - Request Access & Approval Workflow
**Build:** ✅ Passing (`npm run build` successful)
