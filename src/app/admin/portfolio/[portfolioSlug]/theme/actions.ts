'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import { DEFAULT_THEME_CONFIG, THEME_FONT_MODES } from '@/lib/theme';
import type { ThemeEditorValue, ThemeMutationResult } from '@/components/admin/theme/types';

type ThemeSettingsInput = {
  theme_preset: string | null;
  theme_primary: string;
  theme_secondary: string;
  theme_background: string;
  theme_panel: string;
  theme_foreground: string;
  theme_muted: string;
  theme_border: string;
  theme_glow_intensity: number;
  theme_scanlines_enabled: boolean;
  theme_animation_intensity: number;
  theme_font_mode: ThemeEditorValue['fontMode'];
  theme_is_active: boolean;
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function cleanString(value: string) {
  return value.trim();
}

function validateMax(value: string, label: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function validateHex(value: string, label: string, errors: string[]) {
  const clean = cleanString(value);

  if (!HEX_COLOR_PATTERN.test(clean)) {
    errors.push(`${label} must be a valid hex color like #22c55e.`);
  }

  return clean;
}

function validateIntensity(value: number, label: string, errors: string[]) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    errors.push(`${label} must be between 0 and 100.`);
    return 0;
  }

  return Math.round(value);
}

function validateThemeSettingsPayload(payload: ThemeEditorValue): ThemeSettingsInput {
  const presetName = cleanString(payload.presetName);
  const errors: string[] = [];

  validateMax(presetName, 'Theme preset', 80, errors);

  if (!THEME_FONT_MODES.includes(payload.fontMode)) {
    errors.push('Font mode must be system, mono, retro, or readable.');
  }

  const input = {
    theme_preset: presetName || null,
    theme_primary: validateHex(payload.primary, 'Primary accent', errors),
    theme_secondary: validateHex(payload.secondary, 'Secondary accent', errors),
    theme_background: validateHex(payload.background, 'Background', errors),
    theme_panel: validateHex(payload.panel, 'Panel/card', errors),
    theme_foreground: validateHex(payload.foreground, 'Foreground/text', errors),
    theme_muted: validateHex(payload.muted, 'Muted text', errors),
    theme_border: validateHex(payload.border, 'Border', errors),
    theme_glow_intensity: validateIntensity(payload.glowIntensity, 'Glow intensity', errors),
    theme_scanlines_enabled: payload.scanlinesEnabled,
    theme_animation_intensity: validateIntensity(payload.animationIntensity, 'Animation intensity', errors),
    theme_font_mode: payload.fontMode,
    theme_is_active: payload.isActive,
  };

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return input;
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

function revalidateTheme(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/theme`);
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

async function saveThemeSettingsRow(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  payload: ThemeSettingsInput,
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

function defaultThemePayload() {
  return validateThemeSettingsPayload(DEFAULT_THEME_CONFIG);
}

export async function updateThemeSettings(
  portfolioSlug: string,
  payload: ThemeEditorValue,
): Promise<ThemeMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateThemeSettingsPayload(payload);
    const result = await saveThemeSettingsRow(supabase, access.portfolio.id, input);

    if (result.error) {
      return { error: result.error.message };
    }

    revalidateTheme(portfolioSlug);

    return { success: 'Theme settings saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save theme settings.' };
  }
}

export async function resetThemeSettingsToDefault(portfolioSlug: string): Promise<ThemeMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const result = await saveThemeSettingsRow(supabase, access.portfolio.id, defaultThemePayload());

    if (result.error) {
      return { error: result.error.message };
    }

    revalidateTheme(portfolioSlug);

    return { success: 'Theme reset to default.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reset theme settings.' };
  }
}
