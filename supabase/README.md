# Supabase CMS Foundation

The public portfolio still renders from `src/data`. These files prepare the CMS database only.

## Content Source

The portfolio data adapter reads `CONTENT_SOURCE` on the server:

- missing or `local`: use `src/data`
- `supabase`: query Supabase, normalize CMS rows to the same UI data shape, and fall back to local data on errors

`CONTENT_SOURCE` is intentionally not prefixed with `NEXT_PUBLIC_` because it does not need to be exposed to the browser.

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

## First Admin

The seed does not create an admin. After creating a Supabase Auth user, insert that user into `public.admins`:

```sql
insert into public.admins (user_id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
```

Public users can read active content. Only authenticated users whose `auth.uid()` exists in `public.admins.user_id` can mutate CMS content.

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

Use it from a temporary server-only script, route handler, or Server Component after environment variables are configured. Do not import it into Client Components.
