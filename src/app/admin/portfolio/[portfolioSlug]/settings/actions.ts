'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type {
  BrandSettingsEditorValue,
  SettingsMutationResult,
  SiteSettingsEditorValue,
} from '@/components/admin/settings/types';

type BrandSettingsInput = {
  owner_name: string;
  brand_name: string;
  title: string;
  app_name: string | null;
  public_url: string | null;
  is_active: boolean;
};

type SiteSettingsInput = {
  app_title: string;
  tagline: string | null;
  status_label: string | null;
  mode_label: string | null;
  version_label: string | null;
  availability_label: string | null;
  footer_text: string | null;
  is_active: boolean;
};

function cleanString(value: string) {
  return value.trim();
}

function nullableText(value: string) {
  const clean = cleanString(value);
  return clean ? clean : null;
}

function validateMax(value: string, label: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function validateOptionalUrl(value: string, errors: string[]) {
  const clean = cleanString(value);

  if (!clean) {
    return null;
  }

  try {
    const url = new URL(clean);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      errors.push('Public URL must start with http:// or https://.');
    }
  } catch {
    errors.push('Public URL must be a valid URL.');
  }

  return clean;
}

function validateBrandSettingsPayload(payload: BrandSettingsEditorValue, fallbackOwnerName: string): BrandSettingsInput {
  const ownerName = cleanString(payload.ownerName);
  const brandName = cleanString(payload.brandName);
  const title = cleanString(payload.title);
  const appName = cleanString(payload.appName);
  const errors: string[] = [];
  const publicUrl = validateOptionalUrl(payload.publicUrl, errors);

  if (!brandName) {
    errors.push('Brand name is required.');
  }

  if (!title) {
    errors.push('Portfolio title is required.');
  }

  validateMax(ownerName, 'Owner name', 160, errors);
  validateMax(brandName, 'Brand name', 120, errors);
  validateMax(title, 'Portfolio title', 160, errors);
  validateMax(appName, 'App name', 120, errors);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    owner_name: ownerName || fallbackOwnerName,
    brand_name: brandName,
    title,
    app_name: appName || null,
    public_url: publicUrl,
    is_active: payload.isActive,
  };
}

function validateSiteSettingsPayload(payload: SiteSettingsEditorValue): SiteSettingsInput {
  const appTitle = cleanString(payload.appTitle);
  const tagline = cleanString(payload.tagline);
  const statusLabel = cleanString(payload.statusLabel);
  const modeLabel = cleanString(payload.modeLabel);
  const versionLabel = cleanString(payload.versionLabel);
  const availabilityLabel = cleanString(payload.availabilityLabel);
  const footerText = cleanString(payload.footerText);
  const errors: string[] = [];

  if (!appTitle) {
    errors.push('Public app title is required.');
  }

  validateMax(appTitle, 'Public app title', 160, errors);
  validateMax(tagline, 'Tagline', 220, errors);
  validateMax(statusLabel, 'Status label', 120, errors);
  validateMax(modeLabel, 'Mode label', 120, errors);
  validateMax(versionLabel, 'Version/build label', 80, errors);
  validateMax(availabilityLabel, 'Availability label', 120, errors);
  validateMax(footerText, 'Footer/status text', 300, errors);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    app_title: appTitle,
    tagline: tagline || null,
    status_label: statusLabel || null,
    mode_label: modeLabel || null,
    version_label: versionLabel || null,
    availability_label: availabilityLabel || null,
    footer_text: footerText || null,
    is_active: true,
  };
}

async function getMutationContext(portfolioSlug: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    throw new Error('Session expired. Sign in again.');
  }

  const access = await requirePortfolioManager(portfolioSlug);
  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  return { access, supabase };
}

function revalidateSettings(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/settings`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
  revalidatePath('/');
}

async function getExistingSiteSettingsId(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('id')
    .eq('portfolio_id', portfolioId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function saveSiteSettingsRow(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  payload: Partial<SiteSettingsInput> & { brand_name?: string | null },
) {
  const existingId = await getExistingSiteSettingsId(supabase, portfolioId);

  if (existingId) {
    return supabase.from('site_settings').update(payload).eq('id', existingId).eq('portfolio_id', portfolioId);
  }

  return supabase.from('site_settings').insert({
    portfolio_id: portfolioId,
    is_active: true,
    ...payload,
  });
}

export async function updateBrandSettings(
  portfolioSlug: string,
  payload: BrandSettingsEditorValue,
): Promise<SettingsMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateBrandSettingsPayload(payload, access.portfolio.ownerName);

    const { error } = await supabase
      .from('portfolios')
      .update(input)
      .eq('id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    const siteSettingsResult = await saveSiteSettingsRow(supabase, access.portfolio.id, {
      brand_name: input.brand_name,
      is_active: true,
    });

    if (siteSettingsResult.error) {
      return { error: siteSettingsResult.error.message };
    }

    revalidateSettings(portfolioSlug);

    return { success: 'Brand settings saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save brand settings.' };
  }
}

export async function updateSiteSettings(
  portfolioSlug: string,
  payload: SiteSettingsEditorValue,
): Promise<SettingsMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateSiteSettingsPayload(payload);
    const result = await saveSiteSettingsRow(supabase, access.portfolio.id, input);

    if (result.error) {
      return { error: result.error.message };
    }

    revalidateSettings(portfolioSlug);

    return { success: 'Site settings saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save site settings.' };
  }
}
