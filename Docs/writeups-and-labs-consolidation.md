# Writeups & Labs Consolidation

Violet's public portfolio no longer renders a separate Projects section. Her cybersecurity lab cards now belong in the unified `Writeups & Labs` section, backed by `lab_writeups`.

The shared `projects` table and Projects Manager remain available for Ian and other portfolios. Violet's old project rows are archived only after they are copied into `lab_writeups`.

## Visibility

- `public`: shown in the public catalog. Full Markdown is returned only when the lab is not active and `content_markdown` exists.
- `restricted`: shown as a safe teaser card. It can accept requests only when `is_requestable = true`.
- `private`: never returned by public catalog or full-writeup RPCs.

## Classification And Status

`lab_type` is either `offensive` or `defensive`. Violet's public filters combine lab type with machine status:

- All, Offensive Labs, Defensive Labs
- All, Active, Retired

Active labs can appear only as safe teaser metadata. Public active full content is blocked.

## Requestability

`is_requestable` is explicit. Restricted labs are requestable only when this flag is true. Active labs are not automatically rejected, but they default to false and admins see this warning:

`Only approve active-lab access where the platform or lab rules permit solution sharing.`

## Markdown And Screenshots

`content_markdown` stores complete public Markdown. It must be used only for public retired or otherwise non-active labs where sharing is safe.

`writeup_media` stores screenshot metadata. Public screenshots belong in the public `writeup-assets` bucket and must be attached only to public non-active writeups. Restricted/private evidence remains in the private `writeups` bucket.

## Migration And Seed

Run the schema migration:

```sql
supabase/migrations/014_writeups_and_labs_consolidation.sql
```

Run Violet's content seed:

```sql
supabase/seeds/violet_writeups_and_labs_seed.sql
```

The seed migrates these source cards from `../violets_portfolio/src/data/portfolio.ts`:

- Security Monitoring & Enumeration Lab: defensive, retired, public teaser only.
- Basic Pentesting & Incident Analysis Lab: offensive, retired, public teaser only.
- Reverse Engineering & Malware Analysis Practice: defensive, retired, public teaser only.

No full writeup Markdown or screenshots were found in the workspace, so `content_markdown` and media rows are intentionally left empty.

## Verification

After running the migration and seed, verify:

```sql
select p.slug, w.title, w.lab_type, w.machine_status, w.visibility, w.is_requestable, w.reading_time_minutes, w.is_active
from public.lab_writeups w
join public.portfolios p on p.id = w.portfolio_id
where p.slug = 'violet'
order by w.order_index;

select p.slug, pr.title, pr.is_active
from public.projects pr
join public.portfolios p on p.id = pr.portfolio_id
where p.slug = 'violet'
order by pr.order_index;

select p.slug, n.section_id, n.label, n.is_visible, n.is_active
from public.navigation_items n
join public.portfolios p on p.id = n.portfolio_id
where p.slug = 'violet'
order by n.order_index;
```

Expected: Violet `projects` navigation is hidden/inactive, `writeups` is visible/active, and Ian records are unchanged.

