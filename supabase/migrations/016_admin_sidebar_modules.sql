-- Configurable admin sidebar modules, stored on site_settings (one-row-per-portfolio settings model).

alter table public.site_settings
  add column if not exists admin_sidebar_modules jsonb not null default '["writeups","access-requests","settings"]'::jsonb;

comment on column public.site_settings.admin_sidebar_modules is 'Array of sidebar module ids enabled in the admin console for this portfolio.';

update public.site_settings
set admin_sidebar_modules = '["writeups","access-requests","settings"]'::jsonb
where admin_sidebar_modules is null;
