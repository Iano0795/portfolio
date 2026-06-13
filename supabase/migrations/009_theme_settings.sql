-- Theme settings for portfolio-scoped public UI tokens.
-- Stored on site_settings to preserve the existing one-row-per-portfolio settings model.

alter table public.site_settings
  add column if not exists theme_preset text,
  add column if not exists theme_primary text,
  add column if not exists theme_secondary text,
  add column if not exists theme_background text,
  add column if not exists theme_panel text,
  add column if not exists theme_foreground text,
  add column if not exists theme_muted text,
  add column if not exists theme_border text,
  add column if not exists theme_glow_intensity integer,
  add column if not exists theme_scanlines_enabled boolean,
  add column if not exists theme_animation_intensity integer,
  add column if not exists theme_font_mode text,
  add column if not exists theme_is_active boolean default true;

comment on column public.site_settings.theme_preset is 'Named theme preset selected for this portfolio.';
comment on column public.site_settings.theme_primary is 'Primary accent hex color for public portfolio theming.';
comment on column public.site_settings.theme_secondary is 'Secondary accent hex color for public portfolio theming.';
comment on column public.site_settings.theme_background is 'Root background hex color for public portfolio theming.';
comment on column public.site_settings.theme_panel is 'Panel/card hex color for public portfolio theming.';
comment on column public.site_settings.theme_foreground is 'Foreground/text hex color for public portfolio theming.';
comment on column public.site_settings.theme_muted is 'Muted text hex color for public portfolio theming.';
comment on column public.site_settings.theme_border is 'Border hex color for public portfolio theming.';
comment on column public.site_settings.theme_glow_intensity is 'Theme glow intensity from 0 to 100.';
comment on column public.site_settings.theme_scanlines_enabled is 'Controls public portfolio scanline overlay visibility.';
comment on column public.site_settings.theme_animation_intensity is 'Animation intensity from 0 to 100.';
comment on column public.site_settings.theme_font_mode is 'Font mode: system, mono, retro, or readable.';
comment on column public.site_settings.theme_is_active is 'Whether custom theme tokens are active for this portfolio.';
