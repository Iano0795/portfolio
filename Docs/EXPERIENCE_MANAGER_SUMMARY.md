# Experience Manager Implementation Summary

## Overview
Successfully built a complete Experience Manager for the portfolio-aware admin system. The implementation follows the same patterns as the Projects and Skills managers with proper portfolio scoping, role-based access control, achievements editor with stable IDs, and the retro Control Center aesthetic.

## Files Created

### 1. Route
- **`src/app/admin/portfolio/[portfolioSlug]/experience/page.tsx`**
  - Server-rendered page component
  - Loads experience entries for the selected portfolio
  - Enforces authentication and portfolio access
  - Passes bound server actions to client component
  - Normalizes achievements from jsonb to EditableListItem[]

### 2. Server Actions
- **`src/app/admin/portfolio/[portfolioSlug]/experience/actions.ts`**
  - `createExperienceEntryAction` - Creates a new experience entry
  - `updateExperienceEntryAction` - Updates an existing entry
  - `archiveExperienceEntryAction` - Archives an entry (sets is_active = false)
  - `restoreExperienceEntryAction` - Restores an archived entry (sets is_active = true)
  - `reorderExperienceEntriesAction` - Reorders entries using order_index

### 3. Components (6 components)
- **`src/components/admin/experience/ExperienceManager.tsx`** - Main manager component with state management
- **`src/components/admin/experience/ExperienceForm.tsx`** - Form for creating/editing entries with all fields
- **`src/components/admin/experience/ExperienceList.tsx`** - List view with search, filter, and show archived toggle
- **`src/components/admin/experience/ExperienceAchievementsFields.tsx`** - Dynamic achievements editor with stable IDs
- **`src/components/admin/experience/ExperiencePreviewCard.tsx`** - Live preview of the entry as user types
- **`src/components/admin/experience/ExperienceStatusBadge.tsx`** - Visual status indicator (Active/Archived)
- **`src/components/admin/experience/types.ts`** - TypeScript type definitions

### 4. Navigation Updates
- **`src/components/admin/AdminSidebar.tsx`** - Added Experience link with href='/experience'
- **`src/components/admin/AdminShell.tsx`** - Updated activeItem type to include 'experience'

## How Experience Entries Are Loaded

1. **Page Load**: `experience/page.tsx` calls `requirePortfolioAccess(portfolioSlug)`
2. **Access Control**: Validates user is an active member of the portfolio
3. **Query**: Loads experience entries filtered by `portfolio_id`, ordered by order_index
4. **Normalization**: 
   - Converts database records to `ExperienceEditorValue` format
   - Transforms achievements from `string[]` jsonb to `EditableListItem[]` with stable IDs
   - Each achievement gets a unique ID: `achievement-${experienceId}-${index}`
5. **Render**: Passes entries to `ExperienceManager` with bound server actions

## How Experience Operations Work

### Create
1. User clicks "New Experience Entry" → opens form with draft entry
2. User fills:
   - Stage label (optional) - e.g., "Current", "Recent"
   - Title (required) - e.g., "Senior Full-Stack Engineer"
   - Organization (optional) - e.g., "Tech Corp"
   - Period (optional) - e.g., "Jan 2023 - Present"
   - Description (optional) - textarea, max 1000 chars
   - Achievements (optional) - dynamic list with Add/Remove
   - Order index
   - Active/published toggle
3. On save, validates required field (title)
4. Server action resolves `portfolioSlug` → `portfolio_id`
5. Validates user is owner/admin/editor
6. Auto-assigns `order_index` if not provided (next available)
7. Saves achievements as string[] jsonb array
8. Inserts with `portfolio_id` from server-side resolution
9. Revalidates paths and refreshes UI

### Update
1. User clicks Edit on an entry → populates form
2. Form clones achievements with new stable IDs to avoid React key issues
3. User modifies fields and/or achievements
4. On save, validates payload
5. Server action verifies entry belongs to portfolio
6. Converts achievements back to string[] for storage
7. Updates only if user has manager role AND entry.portfolio_id matches
8. Revalidates and refreshes

### Archive/Restore
1. User clicks Archive → sets `is_active = false`
2. User clicks Restore (on archived entry) → sets `is_active = true`
3. Both verify entry ownership and portfolio membership
4. Archived entries shown only when "Show archived entries" is toggled

### Reorder
1. User clicks up/down arrow on an entry
2. Client optimistically updates local state for immediate feedback
3. Server action:
   - Verifies all entry IDs belong to the portfolio
   - Updates order_index for each entry in sequence
   - Uses atomic updates
4. Revalidates and refreshes
5. Only active entries can be reordered

## Portfolio Scoping Enforcement

### Server-Side (Actions)
- `getMutationContext(portfolioSlug)` calls `requirePortfolioManager(portfolioSlug)`
- Returns validated `portfolio.id` from `portfolios` table
- Never trusts `portfolio_id` from client
- All queries include `.eq('portfolio_id', access.portfolio.id)`
- `ensureExperienceBelongsToPortfolio()` validates before update/archive/restore

### Database (RLS)
Migration 003 created policies:
- `can_manage_portfolio(uuid)` function checks active membership + role (owner/admin/editor)
- `"Portfolio managers can insert experience"` - blocks insert unless manager
- `"Portfolio managers can update experience"` - blocks update unless manager AND portfolio_id matches
- `"Portfolio managers can delete experience"` - blocks delete unless manager AND portfolio_id matches
- Public can only read active experience for active portfolios

## Role Permissions Enforcement

### Client-Side UI
- `canSave(role)` returns true only for owner/admin/editor
- Viewer role shows "Read-only access" badge
- All mutation buttons disabled when `readOnly = true`
- Form is disabled for viewers

### Server-Side Actions
- `requirePortfolioManager(portfolioSlug)` validates role is owner/admin/editor
- Throws error if user is viewer or not a member
- RLS policies double-check at database level

### Role Behavior
| Role | View | Create | Edit | Archive | Restore | Reorder |
|------|------|--------|------|---------|---------|---------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| editor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## How Achievements Are Edited and Saved

### Stable IDs for React Keys

**Problem Avoided**: Using the achievement string value as a React key causes input focus loss when the user types (each keystroke changes the key).

**Solution Implemented**: Use stable, unique IDs for React keys.

### Internal Editable Shape
```typescript
type EditableListItem = {
  id: string;        // Stable UUID, doesn't change when value changes
  value: string;     // The actual achievement text
};
```

### Data Flow

**1. Loading from Database:**
```typescript
// Database stores: ["Achievement 1", "Achievement 2"]
// Normalized to:
[
  { id: 'achievement-uuid-1-0', value: 'Achievement 1' },
  { id: 'achievement-uuid-1-1', value: 'Achievement 2' }
]
```

**2. Editing in UI:**
- React keys use `item.id` (stable, never changes)
- User types in textarea → only `item.value` changes
- Input maintains focus because key didn't change

**3. Adding New Achievement:**
```typescript
const createItem = (value: string) => ({
  id: crypto.randomUUID(),  // Fresh stable ID
  value
});
```

**4. Cloning for Edit:**
```typescript
function cloneExperience(experience: ExperienceEditorValue) {
  return {
    ...experience,
    achievements: experience.achievements.map((item) => 
      createItem(item.value)  // New IDs prevent stale closures
    ),
  };
}
```

**5. Saving to Database:**
```typescript
// Convert back to string array for jsonb storage
achievements: experience.achievements.map((item) => item.value)
// Saves as: ["Achievement 1", "Achievement 2"]
```

### Key Implementation Details

**ExperienceAchievementsFields.tsx:**
- Each textarea uses `key={item.id}` (stable)
- `onChange` handler updates the value by matching ID
- Add button creates new items with fresh UUIDs
- Remove button filters by ID

**ExperienceManager.tsx:**
- `cloneExperience()` generates new IDs when opening editor
- Prevents React state issues with stale object references
- `experienceToPayload()` extracts just the values for server

**Result**: User can type in achievement fields without losing focus. No one-letter input bug.

## New Migration

**No new migration was required.** The `experience` table already has:
- `portfolio_id uuid not null` (added in migration 003)
- `stage_label text`
- `title text not null`
- `organization text`
- `period text`
- `description text`
- `achievements jsonb` - stores string array
- `order_index integer default 0`
- `is_active boolean default true`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

RLS policies for portfolio-scoped access already exist from migration 003.

## Build Status

✅ **`npm run build` passes successfully**

```
Route (app)
├ ƒ /admin/portfolio/[portfolioSlug]/experience
```

No TypeScript errors, no compilation errors.

## Manual Test Steps

### Test 1: Ian Creates and Manages Experience

1. **Login as Ian**
   - Navigate to `/admin/login`
   - Enter Ian's credentials
   - Should redirect to `/admin/select-portfolio`

2. **Select Ian Portfolio**
   - Click on Ian's portfolio
   - Should redirect to `/admin/portfolio/ian`

3. **Navigate to Experience Manager**
   - Click "Experience" in sidebar
   - URL should be `/admin/portfolio/ian/experience`
   - Should see "Experience Manager" header
   - Should see portfolio name "IanOS Portfolio" and role badge

4. **View Existing Entries (if any)**
   - Entries should be listed in order
   - Each entry should show stage label, title, organization, period, status

5. **Create New Experience Entry**
   - Click "New Experience Entry" button
   - Form should open on the left, preview on the right
   - Fill in:
     - Stage Label: "Current"
     - Title: "Senior Full-Stack Engineer"
     - Organization: "Tech Corp"
     - Period: "Jan 2023 - Present"
     - Description: "Leading development of cloud-native applications..."
     - Click "Add Achievement"
     - Enter achievement: "Designed and implemented microservices architecture"
     - Click "Add Achievement" again
     - Enter another: "Reduced API latency by 40%"
     - Order Index: 0
     - Active: checked
   - Preview should update as you type
   - Click "Create Entry"
   - Should see success message "Experience entry created."
   - Entry should appear in list

6. **Test Achievement Input Focus**
   - Click Edit on the entry
   - Click in first achievement textarea
   - Type continuously: "Testing focus stability"
   - **Expected**: Input should NOT lose focus between keystrokes
   - **Expected**: Can type normally without interruption
   - This confirms stable ID solution works

7. **Add/Remove Achievements**
   - Click "Add Achievement" in form
   - New empty textarea should appear
   - Type something in it
   - Click the remove button (trash icon) next to an achievement
   - Achievement should be removed
   - Click "Save Changes"
   - Changes should persist

8. **Create Another Entry**
   - Click "New Experience Entry"
   - Fill in:
     - Stage Label: "Recent"
     - Title: "Product Designer"
     - Organization: "Startup Inc"
     - Period: "2020 - 2022"
     - Description: "Led UX design for mobile app..."
     - Add 2-3 achievements
   - Click "Create Entry"
   - Both entries should appear in list

9. **Edit an Entry**
   - Click Edit button on first entry
   - Change Period to "Feb 2023 - Present"
   - Add one more achievement
   - Click "Save Changes"
   - Should see success message
   - Changes should persist

10. **Reorder Entries**
    - Click down arrow on first entry
    - Entries should swap positions
    - Click up arrow
    - Should swap back to original position
    - Refresh page - order should persist

11. **Search Entries**
    - Type "Engineer" in search box
    - Should filter to matching entries
    - Type "Startup"
    - Should filter to entries from Startup Inc
    - Clear search
    - All entries should reappear

12. **Archive an Entry**
    - Click Archive (trash icon) on an entry
    - Should see success message "Experience entry archived."
    - Entry should disappear from main list

13. **View Archived Entries**
    - Toggle "Show archived entries" checkbox
    - Archived entry should appear with strikethrough and "Archived" badge
    - Should be in an "Archived Entries" section

14. **Restore Archived Entry**
    - Click "Restore" button on archived entry
    - Should see success message "Experience entry restored."
    - Entry should return to active list

15. **Test Validation**
    - Click "New Experience Entry"
    - Leave Title blank
    - Try to save
    - "Create Entry" button should be disabled
    - Fill Title
    - Button should become enabled

16. **Refresh Page**
    - Press F5 or reload
    - All changes should persist
    - Entries should load correctly

17. **Test Preview Card**
    - Click Edit on an entry
    - Preview card on right should show formatted view
    - Modify title → preview updates
    - Add achievement → preview updates
    - Shows stage label badge, organization, period, achievements with bullets

18. **Logout**
    - Navigate to `/admin/logout`

### Test 2: Violet Creates Separate Experience

1. **Login as Violet**
   - Navigate to `/admin/login`
   - Enter Violet's credentials

2. **Select Violet Portfolio**
   - Click on Violet's portfolio
   - Should redirect to `/admin/portfolio/violet`

3. **Navigate to Experience Manager**
   - Click "Experience" in sidebar
   - URL should be `/admin/portfolio/violet/experience`
   - Should show Violet's portfolio name and role

4. **Verify Empty State (if no entries)**
   - Should see message "No experience entries found. Create your first entry to get started."

5. **Create Violet Experience Entry**
   - Click "New Experience Entry"
   - Fill in:
     - Stage Label: "Current"
     - Title: "Security Researcher"
     - Organization: "CyberSec Labs"
     - Period: "2022 - Present"
     - Description: "Conducting penetration testing and vulnerability assessments..."
     - Add achievements related to security work
   - Click "Create Entry"
   - Entry should appear

6. **Create Another Violet Entry**
   - Click "New Experience Entry"
   - Fill in different security/research role
   - Click "Create Entry"
   - Both entries should appear

7. **Verify Isolation**
   - Violet should NOT see Ian's Tech Corp or Startup Inc entries
   - Only Violet's CyberSec Labs entries should appear

8. **Test Achievement Editor**
   - Click Edit on an entry
   - Click in an achievement field
   - Type continuously without pauses
   - Verify focus doesn't break
   - Add and remove achievements
   - Save changes

9. **Logout**
   - Navigate to `/admin/logout`

### Test 3: Cross-Portfolio Access Control

1. **Login as Ian**
   - Navigate to `/admin/login`

2. **Attempt to Access Violet's Experience**
   - Manually navigate to `/admin/portfolio/violet/experience`
   - Expected: Redirect to `/admin/login?error=access_denied`
   - OR: Access denied error if Ian is not a member of Violet's portfolio

3. **Login as Violet**
   - Navigate to `/admin/login`

4. **Attempt to Access Ian's Experience**
   - Manually navigate to `/admin/portfolio/ian/experience`
   - Expected: Redirect to `/admin/login?error=access_denied`
   - OR: Access denied error if Violet is not a member of Ian's portfolio

### Test 4: Viewer Role Restrictions

1. **Setup: Create a Viewer Member** (if you have SQL access)
   ```sql
   -- Add a test user as viewer to Ian's portfolio
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

3. **Navigate to Experience Manager**
   - Go to `/admin/portfolio/ian/experience`
   - Should see "Read-only access" badge

4. **Verify UI is Disabled**
   - "New Experience Entry" button should be disabled
   - All Edit/Archive buttons should be disabled
   - All reorder arrows should be disabled

5. **Verify Server Actions Fail**
   - Try to manually trigger a mutation (requires dev tools)
   - Expected: Server action should return error "User does not have manage access"

### Test 5: Achievement Focus Stability

**Critical Test - Verifies Stable ID Solution**

1. **Login as Ian**

2. **Go to Experience Manager**
   - Navigate to `/admin/portfolio/ian/experience`

3. **Create or Edit Entry with Achievement**
   - Click "New Experience Entry" or Edit existing
   - Click "Add Achievement"
   - Click in the achievement textarea

4. **Type Continuously**
   - Type: "This is a test of focus stability"
   - Type without pausing between letters
   - **Expected**: Can type entire sentence without input losing focus
   - **Expected**: Cursor stays in the same field
   - **Bug Would Be**: Input loses focus after each letter, requires clicking back in

5. **Add Multiple Achievements**
   - Click "Add Achievement" 3 times
   - Type in first achievement field
   - Switch to second field
   - Type there
   - Switch back to first field
   - Continue typing
   - **Expected**: Can switch between fields and type normally

6. **Save and Re-edit**
   - Click "Save Changes"
   - Click Edit again on the same entry
   - Achievements should be editable
   - Type in any achievement field
   - **Expected**: Focus remains stable

**If this test passes, the stable ID solution is working correctly.**

## Known Gaps Before Building Contact Manager

1. **No Public Portfolio Integration Yet**
   - Experience Manager is admin-only
   - Public portfolio components not updated to read from `experience` table
   - `ExperienceSection.tsx` (if it exists) still uses mock data or old structure
   - **Action needed**: Update public portfolio to query experience by portfolio_id

2. **No Rich Text Editor**
   - Description is plain textarea
   - No markdown or formatting support
   - **Decision**: Plain text sufficient for MVP, rich text is future enhancement

3. **No Date Picker**
   - Period field is free text
   - No calendar picker or date validation
   - **Decision**: Free text gives flexibility (e.g., "Q1 2023", "Summer 2022")

4. **No Bulk Operations**
   - Cannot select multiple entries to archive/reorder/delete at once
   - **Decision**: MVP uses individual actions, bulk operations are future enhancement

5. **No Activity Log**
   - No audit trail of who created/edited/archived entries
   - **Decision**: Activity logging is a future enhancement

6. **No Import/Export**
   - Cannot bulk import from LinkedIn or CSV
   - Cannot export resume/CV
   - **Decision**: Manual entry sufficient for MVP

7. **No Drag-and-Drop Reordering**
   - Current reorder is up/down arrows only
   - Drag-and-drop could be added later with `@dnd-kit`
   - **Decision**: Keep simple MVP, add drag-and-drop as enhancement

8. **No Company Logo Upload**
   - Entries only have text fields
   - No organization logo or image
   - **Decision**: Logo support is a future enhancement

9. **No Duration Calculation**
   - Period is free text, not parsed
   - No automatic "2 years 3 months" calculation
   - **Decision**: Free text gives more control

10. **No Skills Tagging**
    - No way to link experience entries to skills from Skills Manager
    - No tag system
    - **Decision**: Flat list sufficient for MVP

## Architecture Notes

### Why Stable IDs for Achievements?

**Problem**: React uses keys to track component identity. If the key changes, React destroys and recreates the component, losing input focus.

**Bad Approach (causes bug)**:
```typescript
achievements.map((value) => (
  <input key={value} /> // Key changes every keystroke!
))
```

**Good Approach (our implementation)**:
```typescript
achievements.map((item) => (
  <input key={item.id} /> // Key is stable UUID
))
```

**Why This Works**:
- ID never changes, only value changes
- React keeps the same component instance
- Input focus is preserved
- User can type normally

### Why Clone with New IDs on Edit?

When opening the editor, we clone the experience and generate new IDs for achievements:

```typescript
function cloneExperience(experience: ExperienceEditorValue) {
  return {
    ...experience,
    achievements: experience.achievements.map((item) => 
      createItem(item.value)
    ),
  };
}
```

**Reasons**:
1. **Avoid stale references**: Ensures fresh object identity for React
2. **Prevent key conflicts**: Old and new editor instances don't share IDs
3. **Clean state**: Each edit session has its own isolated state

### Why Store as string[] in Database?

**Database Storage**:
```json
{
  "achievements": [
    "Achievement 1",
    "Achievement 2"
  ]
}
```

**Reasons**:
- Simpler schema (jsonb array of strings vs array of objects)
- Easier to query and filter
- IDs are only needed for UI editing, not persistence
- On load, we generate IDs from index (stable across loads)

### Why Not Use Index as Key?

```typescript
// BAD - don't do this
achievements.map((item, index) => (
  <input key={index} /> // Breaks when reordering or removing
))
```

**Problems with index as key**:
- Add/remove item → all subsequent keys shift → React recreates all following components
- Reorder items → keys no longer match correct items → state mismatches
- Can cause subtle bugs with controlled inputs

**Our solution**: Use stable UUIDs that persist for the lifetime of the editing session.

## Success Metrics

✅ Route created: `/admin/portfolio/[portfolioSlug]/experience`  
✅ All server actions implemented with validation  
✅ Portfolio scoping enforced server-side  
✅ Role permissions enforced (owner/admin/editor can mutate, viewer read-only)  
✅ Achievements editor with stable IDs (no focus loss bug)  
✅ Archive/restore functionality  
✅ Reorder with up/down arrows  
✅ Search and filter  
✅ Live preview card  
✅ Retro Control Center aesthetic maintained  
✅ No migration required (existing schema sufficient)  
✅ `npm run build` passes  
✅ TypeScript types defined and enforced  
✅ Matches Projects and Skills Manager patterns  
✅ EditableListItem used with stable crypto.randomUUID() for React keys  

**Implementation Status: COMPLETE** ✅

## Next Steps

1. **Update Public Portfolio** (if experience is displayed publicly)
   - Update `ExperienceSection.tsx` to query experience from Supabase
   - Filter by `portfolio_id` and `is_active = true`
   - Order by order_index
   - Display stage labels, achievements, etc.

2. **Test with Real Users**
   - Ian and Violet should test with their actual portfolios
   - Verify data isolation and access control
   - Verify achievement editor works smoothly (no focus loss)

3. **Build Contact Manager**
   - Follow same patterns as Experience, Skills, and Projects managers
   - Portfolio-scoped contact links
   - Role-based access control
   - Archive/restore functionality
   - Order management

4. **Build Other Managers as Needed**
   - Capabilities Manager
   - Process Steps Manager
   - Resume Assets Manager
   - Navigation Manager
   - Theme/Settings Manager
