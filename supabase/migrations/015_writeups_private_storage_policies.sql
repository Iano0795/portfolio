-- ============================================================================
-- Migration: 015_writeups_private_storage_policies
-- Description: Enable authenticated portfolio managers to upload private writeup documents
-- ============================================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'writeups',
  'writeups',
  false,
  20971520,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio managers can upload private writeup files" on storage.objects;
drop policy if exists "Portfolio members can read private writeup files" on storage.objects;
drop policy if exists "Portfolio managers can update private writeup files" on storage.objects;
drop policy if exists "Portfolio managers can delete private writeup files" on storage.objects;

create policy "Portfolio managers can upload private writeup files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'writeups'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

create policy "Portfolio members can read private writeup files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'writeups'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_view_portfolio_admin(p.id)
  )
);

create policy "Portfolio managers can update private writeup files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'writeups'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
)
with check (
  bucket_id = 'writeups'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

create policy "Portfolio managers can delete private writeup files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'writeups'
  and exists (
    select 1
    from public.portfolios p
    where p.slug = (storage.foldername(name))[1]
      and public.can_manage_portfolio(p.id)
  )
);

-- Private writeup documents use paths like:
--   portfolioSlug/writeupSlug/timestamp-safe-file-name
-- Public access must use server-side authorization, never direct bucket reads.
