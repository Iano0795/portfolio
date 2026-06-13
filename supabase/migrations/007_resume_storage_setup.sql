-- Resume Manager Storage and Constraints
-- This migration:
-- 1. Creates the 'resumes' storage bucket if it doesn't exist
-- 2. Sets up storage policies for portfolio-scoped access
-- 3. Adds a unique partial index to ensure only one active resume per portfolio

-- Create the resumes bucket (public access for easy resume downloads)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do update
set public = true;

-- Storage policies for resumes bucket

-- Allow authenticated portfolio managers to upload to their portfolio folder
create policy "Portfolio managers can upload resumes to their folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] in (
    select slug from public.portfolios
    where public.can_manage_portfolio(id)
  )
);

-- Allow authenticated portfolio managers to read their portfolio's resumes
create policy "Portfolio managers can read their portfolio resumes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] in (
    select slug from public.portfolios
    where public.can_view_portfolio_admin(id)
  )
);

-- Allow authenticated portfolio managers to delete their portfolio's resumes
create policy "Portfolio managers can delete their portfolio resumes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] in (
    select slug from public.portfolios
    where public.can_manage_portfolio(id)
  )
);

-- Allow public to read resumes (since bucket is public and resumes are meant to be downloadable)
create policy "Public can read resumes"
on storage.objects for select
to public
using (bucket_id = 'resumes');

-- Unique partial index to ensure only one active resume per portfolio
-- This prevents data inconsistency where multiple resumes could be marked as active
create unique index if not exists resume_assets_one_active_per_portfolio
on public.resume_assets (portfolio_id)
where is_active = true;

-- Add comment for documentation
comment on index resume_assets_one_active_per_portfolio is 
'Ensures only one resume can be active per portfolio at a time';
