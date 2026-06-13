# Violet Portfolio Seed Notes

## Source

Violet's content was extracted from the read-only reference project at `../violets_portfolio`.

Files inspected:

- `../violets_portfolio/src/data/portfolio.ts`
- `../violets_portfolio/src/app/layout.tsx`
- `../violets_portfolio/src/app/globals.css`
- `../violets_portfolio/src/components/sections/HeroSection.tsx`
- `../violets_portfolio/src/components/sections/AboutSection.tsx`
- `../violets_portfolio/src/components/sections/SkillsSection.tsx`
- `../violets_portfolio/src/components/sections/ExperienceSection.tsx`
- `../violets_portfolio/src/components/sections/ProjectsSection.tsx`
- `../violets_portfolio/src/components/sections/CredentialsSection.tsx`
- `../violets_portfolio/src/components/sections/ContactSection.tsx`
- `../violets_portfolio/public/documents/violet-achieng-resume.pdf`
- `../violets_portfolio/public/images/violet-profile.png`

## Seed File

Run:

```sql
-- Supabase SQL Editor
-- paste and run:
-- supabase/seeds/violet_portfolio_seed.sql
```

The seed file is:

```text
supabase/seeds/violet_portfolio_seed.sql
```

## Tables Seeded

- `portfolios`
- `profile`
- `projects`
- `skills`
- `experience`
- `capabilities`
- `contact_links`
- `resume_assets`
- `site_settings`
- `navigation_items`

`process_steps` is intentionally cleared for Violet and left empty because the reference portfolio does not include a real process/workflow section.

## Scoping And Safety

The seed resolves Violet's `portfolio_id` dynamically from:

```sql
select id from public.portfolios where slug = 'violet'
```

All delete/reinsert operations are scoped to that resolved `portfolio_id`. The seed does not delete or update Ian's scoped content and does not insert or update `portfolio_members`.

## Missing Or Deferred Content

- Credentials/certifications exist in the reference project, but the current shared CMS does not have a credentials table. They were not forced into another table.
- The reference navigation includes `Certifications`, but `certifications` is not a supported public section ID yet. It was not seeded into `navigation_items`.
- No dedicated process/workflow section exists in the reference portfolio, so no `process_steps` were seeded.
- No project case study/writeup URLs were present in the reference content.
- No project image URLs were present in the reference content.
- The GitHub and TryHackMe links in the reference are generic root URLs; they were preserved as-is rather than replaced with guessed profile URLs.

## Private Content

No active HTB machine writeups or restricted lab writeups were found in the reference project. The seeded lab/project entries are public summaries only and are marked `is_private = false`.

## Resume Notes

The reference resume exists at:

```text
../violets_portfolio/public/documents/violet-achieng-resume.pdf
```

The seed inserts an active `resume_assets` row with:

```text
/documents/violet-achieng-resume.pdf
```

Before relying on that URL in production, copy the PDF into the eventual Violet public app's `public/documents` folder or upload it through the Resume manager/Supabase Storage and update the active resume URL.

## Theme Notes

Theme values were seeded from `../violets_portfolio/src/app/globals.css`:

- background: `#0b0a08`
- panel/surface: `#14110d`
- foreground: `#f5efe6`
- muted: `#c6baaa`
- primary accent: `#d7a86e`
- secondary accent: `#8f7658`

The original reference uses `Inter` and `Cormorant Garamond`; the shared CMS currently stores only a coarse font mode, so Violet is seeded with `readable`.

## Verification Queries

```sql
select slug, owner_name, title, brand_name
from public.portfolios
where slug = 'violet';

select p.slug, pr.name, pr.headline
from public.profile pr
join public.portfolios p on p.id = pr.portfolio_id
where p.slug = 'violet';

select p.slug, count(*) as projects_count
from public.projects projects
join public.portfolios p on p.id = projects.portfolio_id
where p.slug = 'violet'
group by p.slug;

select p.slug, count(*) as skills_count
from public.skills skills
join public.portfolios p on p.id = skills.portfolio_id
where p.slug = 'violet'
group by p.slug;
```

## Manual Checklist

1. Run `supabase/seeds/violet_portfolio_seed.sql` in the Supabase SQL Editor.
2. Confirm `public.portfolios.slug = 'violet'` exists.
3. Confirm Violet profile, skills, projects/labs, contact links, resume asset, settings, theme, capabilities, and navigation exist.
4. Confirm Ian's rows are unchanged.
5. Login as Violet and open `/admin/portfolio/violet`.
6. Confirm Violet data appears in the managers.
7. Login as Ian and open `/admin/portfolio/ian`.
8. Confirm Ian data is unchanged and does not show Violet content.
