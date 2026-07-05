# Resume Manager Implementation Summary

## Overview
Successfully built a complete Resume Manager for the portfolio-aware admin system with Supabase Storage integration. The implementation follows the same patterns as previous managers with proper portfolio scoping, role-based access control, file upload handling, active resume management, and the retro Control Center aesthetic.

## Files Created

### 1. Route
- **`src/app/admin/portfolio/[portfolioSlug]/resume/page.tsx`**
  - Server-rendered page component
  - Loads resume assets for the selected portfolio
  - Enforces authentication and portfolio access
  - Passes bound server actions to client component

### 2. Server Actions
- **`src/app/admin/portfolio/[portfolioSlug]/resume/actions.ts`**
  - `uploadResumeAction` - Uploads PDF to Supabase Storage and creates database record
  - `setActiveResumeAction` - Sets one resume as active (deactivates all others)
  - `archiveResumeAction` - Deactivates a resume (sets is_active = false)

### 3. Components (5 components)
- **`src/components/admin/resume/ResumeManager.tsx`** - Main manager component with state management
- **`src/components/admin/resume/ResumeUploadForm.tsx`** - File upload form with validation
- **`src/components/admin/resume/ResumeList.tsx`** - List view with open/download/activate/deactivate actions
- **`src/components/admin/resume/ResumePreviewCard.tsx`** - Active resume preview with download options
- **`src/components/admin/resume/ResumeStatusBadge.tsx`** - Visual status indicator (Active/Inactive)
- **`src/components/admin/resume/types.ts`** - TypeScript type definitions

### 4. Migration
- **`supabase/migrations/007_resume_storage_setup.sql`**
  - Creates `resumes` storage bucket (public)
  - Sets up storage policies for portfolio-scoped access
  - Adds unique partial index to ensure only one active resume per portfolio

### 5. Navigation Updates
- **`src/components/admin/AdminSidebar.tsx`** - Added Resume link with href='/resume'
- **`src/components/admin/AdminShell.tsx`** - Updated activeItem type to include 'resume'

## How Resume Assets Are Loaded

1. **Page Load**: `resume/page.tsx` calls `requirePortfolioAccess(portfolioSlug)`
2. **Access Control**: Validates user is an active member of the portfolio
3. **Query**: Loads resume_assets filtered by `portfolio_id`, ordered by uploaded_at desc
4. **Normalization**: Converts database records to `ResumeAssetEditorValue` format
5. **Render**: Passes assets to `ResumeManager` with bound server actions

## How Upload Works

### Upload Flow

1. **Client-Side Validation**:
   - User selects PDF file (`.pdf` only)
   - File type checked: must be `application/pdf`
   - File size checked: max 10MB
   - Optional version label (max 120 chars)

2. **FormData Preparation**:
   - File object added to FormData
   - Version label added to FormData
   - Submitted to server action

3. **Server-Side Processing**:
   ```typescript
   uploadResumeAction(portfolioSlug, formData)
   ```

4. **Server Action Steps**:
   - Validate user is owner/admin/editor
   - Validate file type and size again (server-side)
   - Sanitize filename (remove unsafe characters)
   - Generate unique storage path: `{portfolioSlug}/{timestamp}-{sanitized-filename}`
   - Upload to Supabase Storage bucket `resumes`
   - Get public URL from storage
   - Check if first resume for portfolio
   - Insert record into `resume_assets` table with `is_active = true` if first
   - If database insert fails, delete uploaded file (cleanup)
   - Revalidate paths

5. **Storage Path Pattern**:
   ```
   resumes/
     ian/
       1703001234567-John_Doe_Resume.pdf
       1703005678901-John_Doe_Resume_2024.pdf
     violet/
       1703009012345-Violet_Achieng_CV.pdf
   ```

### File Sanitization

**Input**: `John Doe's Resume (2024)!.pdf`

**Process**:
- Trim whitespace
- Replace non-alphanumeric characters with underscore: `[^a-zA-Z0-9._-]` → `_`
- Collapse multiple underscores: `_{2,}` → `_`
- Limit to 180 characters

**Output**: `John_Doe_s_Resume_2024_.pdf`

## Which Supabase Storage Bucket/Path Is Used

### Bucket Configuration

**Bucket Name**: `resumes`

**Bucket Type**: Public

**Why Public?**
- Resumes are meant to be downloadable publicly
- Simplifies URL handling (no signed URLs needed)
- Public URL can be directly embedded in public portfolio

**Path Pattern**:
```
resumes/{portfolioSlug}/{timestamp}-{sanitized-filename}
```

**Example Paths**:
```
resumes/ian/1703001234567-Ian_Kipkorir_Resume.pdf
resumes/violet/1703009012345-Violet_Security_CV.pdf
```

### Storage Policies

**Policy 1: Upload Policy**
```sql
"Portfolio managers can upload resumes to their folder"
- authenticated users only
- can upload to resumes bucket
- only to folders matching their managed portfolios
```

**Policy 2: Read Policy (Authenticated)**
```sql
"Portfolio managers can read their portfolio resumes"
- authenticated users only
- can read from folders of portfolios they can view/admin
```

**Policy 3: Delete Policy**
```sql
"Portfolio managers can delete their portfolio resumes"
- authenticated users only
- can delete from folders of portfolios they can manage
```

**Policy 4: Read Policy (Public)**
```sql
"Public can read resumes"
- anyone can read from resumes bucket
- enables public resume downloads
```

### Folder Scoping

**Enforcement**:
- Upload action generates path: `{portfolioSlug}/{filename}`
- Storage policies check folder name matches managed portfolio slug
- Cannot upload to another portfolio's folder
- Cannot cross-contaminate portfolio folders

## How Active Resume Selection Works

### Active Resume Logic

**Rule**: Only ONE active resume per portfolio at any time.

**Database Constraint**:
```sql
create unique index resume_assets_one_active_per_portfolio
on public.resume_assets (portfolio_id)
where is_active = true;
```

This index ensures database-level enforcement that only one resume can have `is_active = true` for a given `portfolio_id`.

### Set Active Flow

1. **User Action**: Click "Set Active" button on an inactive resume

2. **Server Action**:
   ```typescript
   setActiveResumeAction(portfolioSlug, resumeId)
   ```

3. **Steps**:
   - Validate user is owner/admin/editor
   - Verify resume belongs to portfolio
   - **Deactivate all** resumes for the portfolio:
     ```sql
     UPDATE resume_assets 
     SET is_active = false 
     WHERE portfolio_id = {portfolio_id}
     ```
   - **Activate selected** resume:
     ```sql
     UPDATE resume_assets 
     SET is_active = true 
     WHERE id = {resume_id} AND portfolio_id = {portfolio_id}
     ```
   - Revalidate paths

4. **Result**: 
   - Selected resume becomes active
   - All others become inactive
   - UI updates to reflect new active state

### First Upload Auto-Activation

**Special Case**: When uploading the first resume for a portfolio:
- Check if any existing resumes exist
- If zero resumes exist, set new resume `is_active = true`
- User doesn't need to manually activate the first resume
- Success message: "Resume uploaded and set as active."

## How Archive/Deactivate Works

### Archive (Deactivate) Flow

1. **User Action**: Click "Deactivate" button on active resume

2. **Server Action**:
   ```typescript
   archiveResumeAction(portfolioSlug, resumeId)
   ```

3. **Steps**:
   - Validate user is owner/admin/editor
   - Verify resume belongs to portfolio
   - Set `is_active = false`
   - **Important**: File NOT deleted from storage
   - Record remains in database
   - Revalidate paths

4. **Result**:
   - Resume becomes inactive
   - No longer shown in "Active Resume" preview
   - Still appears in list as inactive
   - Can be reactivated later with "Set Active"

### No Hard Delete (MVP)

**Design Decision**: Files are NOT permanently deleted in MVP.

**Reasons**:
1. **Safety**: Prevents accidental data loss
2. **Version History**: Can revert to old resume if needed
3. **Simplicity**: No complex file deletion logic
4. **Future Enhancement**: Can add permanent delete with confirmation dialog later

**Future Enhancement**:
```typescript
// Future: Add optional hard delete
deleteResumeAction(portfolioSlug, resumeId) {
  // 1. Verify resume belongs to portfolio
  // 2. Get file path from resume record
  // 3. Delete from Supabase Storage
  // 4. Delete database record
  // 5. Require confirmation in UI
}
```

## Portfolio Scoping Enforcement

### Server-Side (Actions)
- `getMutationContext(portfolioSlug)` calls `requirePortfolioManager(portfolioSlug)`
- Returns validated `portfolio.id` from `portfolios` table
- Never trusts `portfolio_id` from client
- All queries include `.eq('portfolio_id', access.portfolio.id)`
- `ensureResumeBelongsToPortfolio()` validates before mutations
- Storage path includes `portfolioSlug` to prevent cross-portfolio access

### Database (RLS)
Migration 003 created policies:
- `can_manage_portfolio(uuid)` function checks active membership + role (owner/admin/editor)
- `"Portfolio managers can insert resume_assets"` - blocks insert unless manager
- `"Portfolio managers can update resume_assets"` - blocks update unless manager AND portfolio_id matches
- Public can only read active resume assets for active portfolios

### Storage (Bucket Policies)
Migration 007 created storage policies:
- Upload: Can only upload to folder matching managed portfolio slug
- Read (authenticated): Can only read from managed portfolio folders
- Delete: Can only delete from managed portfolio folders
- Read (public): Can read any file (resumes are public by design)

## Role Permissions Enforcement

### Client-Side UI
- `canSave(role)` returns true only for owner/admin/editor
- Viewer role shows "Read-only access" message
- Upload form hidden for viewers
- All mutation buttons disabled when `readOnly = true`

### Server-Side Actions
- `requirePortfolioManager(portfolioSlug)` validates role is owner/admin/editor
- Throws error if user is viewer or not a member
- RLS policies double-check at database level
- Storage policies enforce authenticated access for uploads

### Role Behavior
| Role | View | Upload | Set Active | Archive |
|------|------|--------|------------|---------|
| owner | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |
| editor | ✅ | ✅ | ✅ | ✅ |
| viewer | ✅ | ❌ | ❌ | ❌ |

## New Migration Added

**File**: `supabase/migrations/007_resume_storage_setup.sql`

**Contents**:

1. **Storage Bucket Creation**:
   - Creates `resumes` bucket with public access
   - Uses `on conflict do nothing` for idempotency

2. **Storage Policies** (4 policies):
   - Portfolio managers can upload to their folder
   - Portfolio managers can read their portfolio resumes
   - Portfolio managers can delete their portfolio resumes
   - Public can read resumes (for public downloads)

3. **Unique Constraint**:
   - Partial unique index on `(portfolio_id) WHERE is_active = true`
   - Ensures only ONE active resume per portfolio
   - Database-level enforcement

**To Apply**:
```bash
# If using Supabase CLI
supabase db push

# Or manually via Supabase dashboard SQL editor
# Copy and run the migration SQL
```

## Build Status

✅ **`npm run build` passes successfully**

```
Route (app)
├ ƒ /admin/portfolio/[portfolioSlug]/resume
```

No TypeScript errors, no compilation errors.

## Manual Test Steps

### Test 1: Ian Uploads and Manages Resumes

1. **Login as Ian**
   - Navigate to `/admin/login`
   - Enter Ian's credentials
   - Should redirect to `/admin/select-portfolio`

2. **Select Ian Portfolio**
   - Click on Ian's portfolio
   - Should redirect to `/admin/portfolio/ian`

3. **Navigate to Resume Manager**
   - Click "Resume" in sidebar
   - URL should be `/admin/portfolio/ian/resume`
   - Should see "Resume Manager" header
   - Should see portfolio name "IanOS Portfolio" and role badge

4. **View Empty State (if no resumes)**
   - Should see message "No resumes uploaded yet. Upload your first resume to get started."
   - Should see upload form
   - Should see "No active resume" in preview card

5. **Upload First Resume**
   - Click "Choose File" in upload form
   - Select a PDF file (e.g., `Ian_Kipkorir_Resume.pdf`)
   - **Test validation**: Try selecting a .docx file
     - Expected: Alert "Only PDF files are allowed."
   - **Test validation**: Try selecting a 15MB PDF
     - Expected: Alert "File size must be 10MB or less."
   - Select valid PDF under 10MB
   - Enter version label: "2024 - Senior Engineer"
   - Click "Upload Resume"
   - Should see "Uploading..." state
   - Should see success message: "Resume uploaded and set as active."
   - Resume should appear in list with "Active" badge
   - Preview card should show the active resume

6. **Verify File in Storage**
   - Open Supabase dashboard
   - Navigate to Storage → resumes bucket
   - Should see folder: `ian/`
   - Should see file: `{timestamp}-Ian_Kipkorir_Resume.pdf`

7. **Test Download**
   - Click "Download" button in list
   - PDF should download
   - Click "Open in New Tab" in preview card
   - PDF should open in new tab

8. **Upload Second Resume**
   - Click "Choose File"
   - Select another PDF
   - Enter version label: "2025 - Updated"
   - Click "Upload Resume"
   - Should see success message: "Resume uploaded successfully."
   - Second resume should appear in list
   - Second resume should be **inactive** (not auto-activated)
   - First resume should still be active

9. **Set Second Resume Active**
   - Click "Set Active" button (checkmark icon) on second resume
   - Should see success message: "Active resume updated."
   - Second resume should now have "Active" badge
   - First resume should now show as "Inactive"
   - Preview card should show second resume

10. **Deactivate Active Resume**
    - Click "Deactivate" button (archive icon) on active resume
    - Should see success message: "Resume deactivated."
    - Resume should become inactive
    - Preview card should show "No active resume"

11. **Reactivate Resume**
    - Click "Set Active" on any inactive resume
    - Should see success message
    - Resume should become active again

12. **Verify Public URL**
    - In preview card, see "Public URL" section
    - Copy the URL
    - Open in incognito/private window
    - PDF should download/open (public access)

13. **Refresh Page**
    - Press F5 or reload
    - All changes should persist
    - Active resume should still be active

14. **Logout**
    - Navigate to `/admin/logout`

### Test 2: Violet Uploads Separate Resumes

1. **Login as Violet**
   - Navigate to `/admin/login`
   - Enter Violet's credentials

2. **Select Violet Portfolio**
   - Click on Violet's portfolio
   - Should redirect to `/admin/portfolio/violet`

3. **Navigate to Resume Manager**
   - Click "Resume" in sidebar
   - URL should be `/admin/portfolio/violet/resume`
   - Should show Violet's portfolio name and role

4. **Upload Violet Resume**
   - Select PDF file
   - Enter version label: "Security Researcher CV"
   - Click "Upload Resume"
   - Resume should upload successfully and become active

5. **Verify Storage Isolation**
   - Open Supabase dashboard Storage
   - Should see `violet/` folder
   - Violet's resume should be in `violet/` folder
   - Ian's resumes should be in `ian/` folder
   - **Folders should be separate**

6. **Verify UI Isolation**
   - Violet should NOT see Ian's resumes in the list
   - Only Violet's resumes should appear

7. **Logout**
   - Navigate to `/admin/logout`

### Test 3: Cross-Portfolio Access Control

1. **Login as Ian**
   - Navigate to `/admin/login`

2. **Attempt to Access Violet's Resume Manager**
   - Manually navigate to `/admin/portfolio/violet/resume`
   - Expected: Redirect to `/admin/login?error=access_denied`
   - OR: Access denied error if Ian is not a member of Violet's portfolio

3. **Verify Storage Access**
   - Try to craft a URL to Violet's resume file
   - Expected: Can read (bucket is public)
   - Try to upload to Violet's folder via API (if testing programmatically)
   - Expected: Storage policy blocks upload (not authorized for Violet's portfolio)

4. **Login as Violet**
   - Navigate to `/admin/login`

5. **Attempt to Access Ian's Resume Manager**
   - Manually navigate to `/admin/portfolio/ian/resume`
   - Expected: Redirect to `/admin/login?error=access_denied`

### Test 4: Viewer Role Restrictions

1. **Setup: Create a Viewer Member** (if you have SQL access)
   ```sql
   insert into public.portfolio_members (portfolio_id, user_id, email, role)
   select 
     (select id from public.portfolios where slug = 'ian'),
     'test-viewer-user-id',
     'viewer@example.com',
     'viewer';
   ```

2. **Login as Viewer**
   - Navigate to `/admin/login`
   - Login with viewer credentials

3. **Navigate to Resume Manager**
   - Go to `/admin/portfolio/ian/resume`
   - Should see "Read-only access" badge

4. **Verify UI is Disabled**
   - Upload form should NOT be visible
   - Should see message: "Read-only access: You cannot upload or manage resumes."
   - "Set Active" buttons should be disabled (if visible)
   - "Deactivate" buttons should be disabled

5. **Verify Can View**
   - Can see resume list
   - Can click "Download" and "Open in New Tab"
   - Cannot upload or modify

### Test 5: Unique Active Constraint

1. **Login as Ian**

2. **Go to Resume Manager**
   - Ensure at least 2 resumes exist

3. **Test via Database (SQL)**
   ```sql
   -- Try to manually set multiple resumes as active
   UPDATE resume_assets 
   SET is_active = true 
   WHERE portfolio_id = (SELECT id FROM portfolios WHERE slug = 'ian');
   ```
   - Expected: Error due to unique constraint
   - Error message: "duplicate key value violates unique constraint"

4. **Test via UI**
   - Set one resume active
   - Try setting another active immediately
   - Expected: Works correctly (previous one deactivates first)
   - Only one resume should be active at a time

## Known Gaps Before Building Capabilities/Process Manager

1. **No Public Portfolio Integration Yet**
   - Resume Manager is admin-only
   - Public portfolio not updated to read active resume from database
   - ContactSection or ResumeDownload components still use mock/static data
   - **Action needed**: Update public portfolio to query active resume by portfolio_id

2. **No Hard Delete**
   - Cannot permanently delete resumes and files
   - Deactivate/archive only (soft delete)
   - **Decision**: Safety first, add delete with confirmation later

3. **No File Size in UI**
   - File size not stored or displayed
   - Only shows "PDF" label
   - **Decision**: File type sufficient for MVP, size tracking is enhancement

4. **No File Preview**
   - No embedded PDF viewer in preview card
   - Only download or open in new tab
   - **Decision**: Browser native PDF viewer sufficient

5. **No Version Comparison**
   - Cannot compare two resume versions side-by-side
   - No diff view
   - **Decision**: Version labels provide context, comparison is future enhancement

6. **No Upload Progress Bar**
   - Shows "Uploading..." text only
   - No percentage or visual progress bar
   - **Decision**: Simple text sufficient for MVP, most resumes upload quickly

7. **No File Type Expansion**
   - Only PDF supported
   - No DOC/DOCX support
   - **Decision**: PDF is universal standard, other formats are future enhancement

8. **No Resume Templates**
   - No template generation or formatting tools
   - Users must upload pre-formatted PDFs
   - **Decision**: Out of scope, this is asset management not document creation

9. **No Download Statistics**
   - No tracking of how many times resume was downloaded
   - No analytics
   - **Decision**: Analytics is future enhancement

10. **No Email Integration**
    - Cannot email resume directly from manager
    - No "Share via Email" button
    - **Decision**: Users can share public URL manually

11. **No Automatic Backup**
    - No automated backup of resume files
    - Relies on Supabase Storage durability
    - **Decision**: Supabase provides storage durability, additional backup is future enhancement

12. **No Resume Parsing**
    - No extraction of text/data from PDF
    - No automatic skill detection
    - **Decision**: Asset storage only, parsing is out of scope

## Architecture Notes

### Why Public Storage Bucket?

**Decision**: Use public bucket for resumes.

**Pros**:
- Simpler URL handling (direct public URLs)
- No signed URL generation needed
- Can embed URL directly in public portfolio
- Resumes are meant to be public/downloadable anyway

**Cons**:
- Anyone with URL can access (mitigated: resumes are public by design)

**Alternative**: Private bucket with signed URLs
- More complex
- Would require signed URL generation for every access
- Adds latency and complexity
- Not needed for public-facing resumes

### Why Timestamp in Filename?

**Pattern**: `{timestamp}-{original-filename}`

**Reasons**:
1. **Uniqueness**: Prevents filename collisions
2. **Ordering**: Files naturally sort by upload time
3. **Versioning**: Clear history of uploads
4. **No Overwrites**: Can upload same filename multiple times

**Example**:
```
1703001234567-Resume.pdf  (uploaded first)
1703005678901-Resume.pdf  (uploaded later, same name)
```

### Why Unique Partial Index?

**Constraint**:
```sql
create unique index resume_assets_one_active_per_portfolio
on public.resume_assets (portfolio_id)
where is_active = true;
```

**Why Needed**:
- Prevents data inconsistency
- Database-level enforcement (not just app logic)
- Catches race conditions
- Protects against bugs in application code

**Without This**:
- Multiple resumes could be marked active simultaneously
- Public portfolio wouldn't know which to display
- Inconsistent state

**Partial Index**:
- Only enforces uniqueness WHERE `is_active = true`
- Multiple inactive resumes allowed (good)
- Only one active resume per portfolio (enforced)

### Why Sanitize Filenames?

**Input**: `John's "Best" Resume (2024)!.pdf`

**Without Sanitization**: Could cause issues:
- URL encoding problems
- Storage path errors
- Security risks (path traversal)

**After Sanitization**: `John_s_Best_Resume_2024_.pdf`
- Safe for URLs
- Safe for file systems
- No injection risks

### Why First Upload Auto-Activates?

**UX Consideration**: When uploading the first resume:
- User expects it to be active immediately
- Don't make user manually activate first resume
- Subsequent uploads stay inactive (user chooses which to activate)

**Implementation**:
```typescript
const isFirstResume = existingResumes.length === 0;
is_active: isFirstResume
```

## Success Metrics

✅ Route created: `/admin/portfolio/[portfolioSlug]/resume`  
✅ All server actions implemented with validation  
✅ Portfolio scoping enforced server-side  
✅ Role permissions enforced (owner/admin/editor can mutate, viewer read-only)  
✅ Supabase Storage integration (resumes bucket)  
✅ File upload with PDF validation  
✅ Filename sanitization for security  
✅ Active resume management (only one active per portfolio)  
✅ Archive/deactivate functionality (soft delete)  
✅ Storage policies for portfolio-scoped access  
✅ Unique constraint for active resume  
✅ Public URL generation for resume downloads  
✅ First upload auto-activation  
✅ Retro Control Center aesthetic maintained  
✅ Migration added for storage and constraints  
✅ `npm run build` passes  
✅ TypeScript types defined and enforced  
✅ Matches previous manager patterns  

**Implementation Status: COMPLETE** ✅

## Next Steps

1. **Apply Migration**
   ```bash
   # Via Supabase CLI
   supabase db push
   
   # Or manually via Supabase dashboard
   # Copy 007_resume_storage_setup.sql and run in SQL editor
   ```

2. **Verify Storage Bucket**
   - Open Supabase dashboard
   - Navigate to Storage
   - Verify `resumes` bucket exists
   - Verify bucket is public
   - Test uploading a file

3. **Update Public Portfolio** (if resume is displayed publicly)
   - Update components to query active resume from database
   - Filter by `portfolio_id` and `is_active = true`
   - Use `file_url` for download link
   - Display `version_label` if available

4. **Test with Real Users**
   - Ian and Violet should test with their actual portfolios
   - Verify data isolation and access control
   - Verify file uploads and downloads work
   - Verify active resume switching works

5. **Build Remaining Managers**
   - Capabilities Manager
   - Process Steps Manager
   - Navigation Manager
   - Theme/Settings Manager
   - Media Library Manager

All follow the same proven patterns! 🚀

## Summary

You now have **6 complete content managers**:
- ✅ Profile Editor
- ✅ Projects Manager
- ✅ Skills Manager
- ✅ Experience Manager
- ✅ Contact Manager  
- ✅ **Resume Manager** (NEW - with file uploads!)

The Resume Manager adds **Supabase Storage** capabilities to your admin system, enabling:
- PDF file uploads
- Portfolio-scoped storage folders
- Active resume management
- Public resume downloads
- Version control

This is your first manager with **file handling** - a foundation for future file-based managers (Media Library, etc.)!
