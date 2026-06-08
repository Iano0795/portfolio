'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ProfileEditorSaveState } from '@/components/admin/profile/types';

type ProfileInput = {
  name: string;
  headline: string;
  subheadline: string;
  introLine: string;
  location: string;
  availabilityStatus: string;
  currentFocus: string;
  terminalLines: string[];
  coreStack: string[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaContactLabel: string;
  isActive: boolean;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parseStringArray(formData: FormData, key: string) {
  const raw = readString(formData, key);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error(`${key} must be an array of strings.`);
  }

  return parsed.map((item) => item.trim()).filter(Boolean);
}

function validateMax(value: string, label: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function getProfileInput(formData: FormData): ProfileInput {
  const input = {
    name: readString(formData, 'name'),
    headline: readString(formData, 'headline'),
    subheadline: readString(formData, 'subheadline'),
    introLine: readString(formData, 'introLine'),
    location: readString(formData, 'location'),
    availabilityStatus: readString(formData, 'availabilityStatus'),
    currentFocus: readString(formData, 'currentFocus'),
    terminalLines: parseStringArray(formData, 'terminalLinesJson'),
    coreStack: parseStringArray(formData, 'coreStackJson'),
    ctaPrimaryLabel: readString(formData, 'ctaPrimaryLabel'),
    ctaSecondaryLabel: readString(formData, 'ctaSecondaryLabel'),
    ctaContactLabel: readString(formData, 'ctaContactLabel'),
    isActive: readString(formData, 'isActive') === 'true',
  };

  const errors: string[] = [];

  if (!input.name) {
    errors.push('Name is required.');
  }

  if (!input.headline) {
    errors.push('Headline is required.');
  }

  validateMax(input.name, 'Name', 120, errors);
  validateMax(input.headline, 'Headline', 200, errors);
  validateMax(input.subheadline, 'Subheadline', 500, errors);
  validateMax(input.introLine, 'Intro line', 250, errors);
  validateMax(input.location, 'Location', 120, errors);
  validateMax(input.availabilityStatus, 'Availability status', 120, errors);
  validateMax(input.currentFocus, 'Current focus', 160, errors);
  validateMax(input.ctaPrimaryLabel, 'Primary CTA', 80, errors);
  validateMax(input.ctaSecondaryLabel, 'Secondary CTA', 80, errors);
  validateMax(input.ctaContactLabel, 'Contact CTA', 80, errors);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return input;
}

function normalizeTerminalLines(lines: string[]) {
  return lines.map((line) => {
    const separatorIndex = line.includes('=') ? line.indexOf('=') : line.indexOf(':');

    if (separatorIndex === -1) {
      return {
        label: 'LINE',
        value: line,
      };
    }

    return {
      label: line.slice(0, separatorIndex).trim().toUpperCase(),
      value: line.slice(separatorIndex + 1).trim(),
    };
  });
}

export async function saveProfileAction(portfolioSlug: string, _state: ProfileEditorSaveState, formData: FormData): Promise<ProfileEditorSaveState> {
  try {
    const tokens = await getAdminSessionTokens();

    if (!tokens) {
      return { error: 'Session expired. Sign in again.' };
    }

    const access = await requirePortfolioManager(portfolioSlug);
    const input = getProfileInput(formData);
    const supabase = createAdminSupabaseClient(tokens.accessToken);
    const payload = {
      portfolio_id: access.portfolio.id,
      name: input.name,
      headline: input.headline,
      subheadline: input.subheadline || null,
      intro_line: input.introLine || null,
      location: input.location || null,
      availability_status: input.availabilityStatus || null,
      current_focus: input.currentFocus || null,
      core_stack: {
        stack: input.coreStack,
        now_building: input.coreStack,
      },
      terminal_lines: normalizeTerminalLines(input.terminalLines),
      cta_primary_label: input.ctaPrimaryLabel || null,
      cta_secondary_label: input.ctaSecondaryLabel || null,
      cta_contact_label: input.ctaContactLabel || null,
      is_active: input.isActive,
    };

    const { data: existingProfile, error: selectError } = await supabase
      .from('profile')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (selectError) {
      return { error: selectError.message };
    }

    const result = existingProfile
      ? await supabase.from('profile').update(payload).eq('id', existingProfile.id).eq('portfolio_id', access.portfolio.id)
      : await supabase.from('profile').insert(payload);

    if (result.error) {
      return { error: result.error.message };
    }

    revalidatePath(`/admin/portfolio/${portfolioSlug}/profile`);
    revalidatePath(`/admin/portfolio/${portfolioSlug}`);

    return { success: 'Profile saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save profile.' };
  }
}
