import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ThemeManager } from '@/components/admin/theme/ThemeManager';
import type { ThemeEditorValue } from '@/components/admin/theme/types';
import { normalizeThemeConfig } from '@/lib/theme';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import type { CmsSiteSettings } from '@/lib/cms/queries';
import { resetThemeSettingsToDefault, updateThemeSettings } from './actions';

export const dynamic = 'force-dynamic';

type ThemePageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

function normalizeThemeSettings(settings: CmsSiteSettings | null): ThemeEditorValue {
  return normalizeThemeConfig({
    presetName: settings?.theme_preset ?? undefined,
    primary: settings?.theme_primary ?? undefined,
    secondary: settings?.theme_secondary ?? undefined,
    background: settings?.theme_background ?? undefined,
    panel: settings?.theme_panel ?? undefined,
    foreground: settings?.theme_foreground ?? undefined,
    muted: settings?.theme_muted ?? undefined,
    border: settings?.theme_border ?? undefined,
    glowIntensity: settings?.theme_glow_intensity ?? undefined,
    scanlinesEnabled: settings?.theme_scanlines_enabled ?? undefined,
    animationIntensity: settings?.theme_animation_intensity ?? undefined,
    fontMode: settings?.theme_font_mode ?? undefined,
    isActive: settings?.theme_is_active ?? undefined,
  });
}

async function getEditableThemeSettings(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return null;
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<CmsSiteSettings>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const settings = await getEditableThemeSettings(access.portfolio.id);

    return (
      <AdminShell activeItem="theme" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ThemeManager
          initialTheme={normalizeThemeSettings(settings)}
          portfolio={access.portfolio}
          role={access.member.role}
          updateThemeSettings={updateThemeSettings.bind(null, portfolioSlug)}
          resetThemeSettingsToDefault={resetThemeSettingsToDefault.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
