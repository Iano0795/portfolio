# Capabilities & Process Managers - Quick Reference

## Access URLs

### Capabilities Manager
- Ian: `http://localhost:3000/admin/portfolio/ian/capabilities`
- Violet: `http://localhost:3000/admin/portfolio/violet/capabilities`

### Process Manager
- Ian: `http://localhost:3000/admin/portfolio/ian/process`
- Violet: `http://localhost:3000/admin/portfolio/violet/process`

## Capabilities Fields

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| Title | Text | Yes | 160 chars | Capability name |
| Description | Textarea | No | 600 chars | What this capability involves |
| Icon | Dropdown | No | 80 chars | String key (e.g., 'layers', 'network') |
| Order Index | Number | Auto | - | Display order, auto-increments |
| Active | Checkbox | Yes | - | Show/hide on public portfolio |

## Process Steps Fields

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| Title | Text | Yes | 160 chars | Step name |
| Label | Text | No | 120 chars | E.g., "Step 01", "Phase 1" |
| Command | Text | No | 200 chars | E.g., "run discovery.sh" |
| Description | Textarea | No | 800 chars | What happens in this step |
| Order Index | Number | Auto | - | Pipeline order, auto-increments |
| Active | Checkbox | Yes | - | Show/hide on public portfolio |

## Icon Options

Available icon keys for capabilities:
- `layers` - Layers
- `network` - Network
- `workflow` - Workflow
- `shield` - Shield
- `code` - Code
- `cpu` - CPU
- `map` - Map
- `wrench` - Wrench
- `zap` - Zap
- `lock` - Lock
- `globe` - Globe
- `box` - Box

## Actions Available

### For Owner/Admin/Editor:
- ✅ Create new records
- ✅ Edit existing records
- ✅ Archive records (soft delete)
- ✅ Restore archived records
- ✅ Reorder records (up/down)
- ✅ Search/filter records
- ✅ Toggle archived visibility

### For Viewer:
- ✅ View records
- ✅ Search/filter records
- ❌ Cannot create/edit/archive/restore/reorder

## Server Actions

### Capabilities
```typescript
createCapabilityAction(portfolioSlug, payload)
updateCapabilityAction(portfolioSlug, capabilityId, payload)
archiveCapabilityAction(portfolioSlug, capabilityId)
restoreCapabilityAction(portfolioSlug, capabilityId)
reorderCapabilitiesAction(portfolioSlug, capabilityId, 'up' | 'down')
```

### Process Steps
```typescript
createProcessStepAction(portfolioSlug, payload)
updateProcessStepAction(portfolioSlug, stepId, payload)
archiveProcessStepAction(portfolioSlug, stepId)
restoreProcessStepAction(portfolioSlug, stepId)
reorderProcessStepsAction(portfolioSlug, stepId, 'up' | 'down')
```

## Database Tables

### capabilities
- `id` - UUID primary key
- `portfolio_id` - UUID foreign key to portfolios
- `title` - VARCHAR(160) NOT NULL
- `description` - TEXT
- `icon` - VARCHAR(80)
- `order_index` - INTEGER
- `is_active` - BOOLEAN
- `created_at` - TIMESTAMPTZ
- `updated_at` - TIMESTAMPTZ

### process_steps
- `id` - UUID primary key
- `portfolio_id` - UUID foreign key to portfolios
- `title` - VARCHAR(160) NOT NULL
- `description` - TEXT
- `command` - VARCHAR(200)
- `label` - VARCHAR(120)
- `order_index` - INTEGER
- `is_active` - BOOLEAN
- `created_at` - TIMESTAMPTZ
- `updated_at` - TIMESTAMPTZ

## Component Structure

```
Capabilities Manager
├── CapabilitiesManager (state & logic)
├── CapabilitiesList (list view)
│   └── CapabilityStatusBadge
└── CapabilityForm (create/edit)

Process Manager
├── ProcessManager (state & logic)
├── ProcessList (list view)
│   └── ProcessStatusBadge
└── ProcessForm (create/edit)
```

## Testing Checklist

### Basic Operations
- [ ] Create new capability/process step
- [ ] Edit existing record
- [ ] Archive record
- [ ] Toggle "Show archived"
- [ ] Restore archived record
- [ ] Refresh page - changes persist

### Ordering
- [ ] Create 3+ records
- [ ] Move record up
- [ ] Move record down
- [ ] First record cannot move up
- [ ] Last record cannot move down
- [ ] Order persists after refresh

### Search/Filter
- [ ] Search filters correctly
- [ ] Clear search shows all
- [ ] Archived toggle works

### Portfolio Scoping
- [ ] Ian's records separate from Violet's
- [ ] Cannot access other portfolio without membership
- [ ] Records filtered by correct portfolio

### Role Permissions
- [ ] Owner/Admin/Editor can mutate
- [ ] Viewer sees "Read-only" badge
- [ ] Viewer cannot save changes
- [ ] Non-member redirected

### Validation
- [ ] Cannot save without title
- [ ] Character limits enforced
- [ ] Error messages shown clearly

## Common Issues & Solutions

### "Access denied" error
- ✅ Ensure user is logged in
- ✅ Check user is member of the portfolio
- ✅ Verify role is not 'viewer' for mutations

### Changes not appearing
- ✅ Check is_active is true
- ✅ Refresh browser cache
- ✅ Verify correct portfolio selected

### Order not updating
- ✅ Ensure record is active
- ✅ Check not at boundary (first/last)
- ✅ Verify portfolio_id matches

### Icons not showing in public UI
- ✅ Icon stored as string key, not component
- ✅ Public UI needs icon mapping logic
- ✅ Check icon key matches available icons

## Integration with Public Portfolio

Public portfolio reads capabilities and process steps via:
```typescript
// In public pages
const capabilities = await getCapabilitiesData({ portfolioSlug });
const process = await getProcessData({ portfolioSlug });
```

These functions:
- Query active records only (`is_active = true`)
- Filter by portfolio_id
- Order by order_index
- Fall back to local data if needed

## Next Steps After Testing

1. ✅ Test all CRUD operations
2. ✅ Test portfolio scoping
3. ✅ Test role permissions
4. ✅ Verify public UI reflects changes
5. ➡️ Proceed to Navigation Manager
6. ➡️ Then Theme Manager
7. ➡️ Then Media Library
8. ➡️ Then Settings

## Support Information

If RLS policies fail:
- Check Supabase dashboard for policy errors
- Verify user_id in JWT matches portfolio_members.user_id
- Ensure portfolio_id foreign key constraints exist
- Check is_active flags on member records

For debugging:
- Check browser DevTools Network tab for API errors
- Check Supabase logs for query failures
- Add console.log in server actions if needed
- Verify environment variables are set
