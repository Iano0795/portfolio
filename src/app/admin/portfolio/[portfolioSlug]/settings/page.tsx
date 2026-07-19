import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { DEFAULT_ENABLED_SIDEBAR_ITEMS } from '@/components/admin/AdminSidebar';
import { SiteSettingsManager } from '@/components/admin/settings/SiteSettingsManager';
import type {
  BrandSettingsEditorValue,
  SidebarSettingsEditorValue,
  SiteSettingsEditorValue,
} from '@/components/admin/settings/types';
import { siteConfig } from '@/data/site';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import type { CmsSiteSettings } from '@/lib/cms/queries';
import { updateBrandSettings, updateSidebarSettings, updateSiteSettings } from './actions';

export const dynamic = 'force-dynamic';

type SettingsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

function normalizeBrandSettings(accessPortfolio: {
  ownerName: string;
  brandName: string | null;
  title: string;
  appName: string | null;
  publicUrl: string | null;
  isActive: boolean;
}): BrandSettingsEditorValue {
  return {
    ownerName: accessPortfolio.ownerName,
    brandName: accessPortfolio.brandName ?? accessPortfolio.ownerName,
    title: accessPortfolio.title,
    appName: accessPortfolio.appName ?? '',
    publicUrl: accessPortfolio.publicUrl ?? '',
    isActive: accessPortfolio.isActive,
  };
}

function normalizeSiteSettings(settings: CmsSiteSettings | null, brand: BrandSettingsEditorValue): SiteSettingsEditorValue {
  return {
    appTitle: settings?.app_title ?? brand.title ?? siteConfig.appTitle,
    tagline: settings?.tagline ?? '',
    statusLabel: settings?.status_label ?? siteConfig.status,
    modeLabel: settings?.mode_label ?? siteConfig.statusBar.mode,
    versionLabel: settings?.version_label ?? siteConfig.version,
    availabilityLabel: settings?.availability_label ?? siteConfig.statusBar.availability,
    footerText: settings?.footer_text ?? siteConfig.initialConsoleOutput,
  };
}

function normalizeSidebarSettings(settings: CmsSiteSettings | null): SidebarSettingsEditorValue {
  return {
    enabledItems: settings?.admin_sidebar_modules ?? DEFAULT_ENABLED_SIDEBAR_ITEMS,
  };
}

async function getEditableSiteSettings(portfolioId: string) {
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

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const settings = await getEditableSiteSettings(access.portfolio.id);
    const brand = normalizeBrandSettings(access.portfolio);

    return (
      <AdminShell activeItem="settings" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <SiteSettingsManager
          initialBrand={brand}
          initialSettings={normalizeSiteSettings(settings, brand)}
          initialSidebar={normalizeSidebarSettings(settings)}
          portfolio={access.portfolio}
          role={access.member.role}
          updateBrandSettings={updateBrandSettings.bind(null, portfolioSlug)}
          updateSiteSettings={updateSiteSettings.bind(null, portfolioSlug)}
          updateSidebarSettings={updateSidebarSettings.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
