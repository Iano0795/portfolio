# Supabase CMS Foundation

The public portfolio defaults to local data. These files prepare the shared CMS database for multiple portfolio owners.

## Content Source

The portfolio data adapter reads `CONTENT_SOURCE` on the server:

- missing or `local`: use `src/data`
- `supabase`: query Supabase, normalize CMS rows to the same UI data shape, and fall back to local data on errors

`CONTENT_SOURCE` is intentionally not prefixed with `NEXT_PUBLIC_` because it does not need to be exposed to the browser.

CMS queries accept an optional portfolio slug and default to Ian:

```ts
await getPortfolioData({ portfolioSlug: 'ian' });
await getPortfolioData({ portfolioSlug: 'violet' });
```

## Run Migration And Seed

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Apply the migration in Supabase SQL Editor or with the Supabase CLI:
   - `supabase db push`
4. Seed the current portfolio content:
   - SQL Editor: run `supabase/seed.sql`
   - CLI: `supabase db reset` for local development, or apply the seed manually for hosted projects

## Portfolio Ownership

Migration `003_multi_portfolio_access.sql` creates:

- `public.portfolios`
- `public.portfolio_members`

Existing seed content belongs to the Ian portfolio. Violet's portfolio shell is created separately, but Violet content is not fully seeded yet.

The legacy `public.admins` table may remain for bootstrap/backward compatibility, but scoped admin authorization should use `public.portfolio_members`.

To grant Ian access:

```sql
insert into public.portfolio_members (portfolio_id, user_id, email, role)
select p.id, u.id, u.email, 'owner'
from public.portfolios p
cross join auth.users u
where p.slug = 'ian'
and u.email = 'ian-email@example.com'
on conflict do nothing;
```

To grant Violet access:

```sql
insert into public.portfolio_members (portfolio_id, user_id, email, role)
select p.id, u.id, u.email, 'owner'
from public.portfolios p
cross join auth.users u
where p.slug = 'violet'
and u.email = 'violet-email@example.com'
on conflict do nothing;
```

Public users can read active content for active portfolios. Authenticated users can manage content only for portfolios where they are active `owner`, `admin`, or `editor` members.

## Query Validation

The server-only helper `validateCmsQueries()` in `src/lib/cms/validate.ts` calls every CMS query:

- site settings
- profile
- navigation items
- projects
- skills
- experience
- capabilities
- process steps
- contact links
- active resume

Use it from a temporary server-only script, route handler, or Server Component after environment variables are configured. Pass `{ portfolioSlug: 'ian' }` or `{ portfolioSlug: 'violet' }` to validate a specific portfolio. Do not import it into Client Components.
