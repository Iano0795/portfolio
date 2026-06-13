'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ExperienceMutationResult, ExperiencePayload } from '@/components/admin/experience/types';

type ExperienceInput = {
  stage_label: string | null;
  title: string;
  organization: string | null;
  period: string | null;
  description: string | null;
  achievements: string[];
  order_index: number;
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

function validateExperiencePayload(payload: ExperiencePayload): ExperienceInput {
  const title = cleanString(payload.title);
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 160, errors);
  validateMax(payload.stageLabel, 'Stage label', 120, errors);
  validateMax(payload.organization, 'Organization', 160, errors);
  validateMax(payload.period, 'Period', 120, errors);
  validateMax(payload.description, 'Description', 1000, errors);

  const achievements = Array.isArray(payload.achievements)
    ? payload.achievements.map((value) => cleanString(value)).filter(Boolean)
    : [];

  achievements.forEach((achievement, index) => {
    if (achievement.length > 300) {
      errors.push(`Achievement ${index + 1} must be 300 characters or fewer.`);
    }
  });

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    stage_label: nullableText(payload.stageLabel),
    title,
    organization: nullableText(payload.organization),
    period: nullableText(payload.period),
    description: nullableText(payload.description),
    achievements,
    order_index: orderIndex,
    is_active: payload.isActive,
  };
}

async function getMutationContext(portfolioSlug: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    throw new Error('Session expired. Sign in again.');
  }

  const access = await requirePortfolioManager(portfolioSlug);
  const supabase = createAdminSupabaseClient(tokens.accessToken);

  return { access, supabase };
}

function revalidateExperience(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/experience`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureExperienceBelongsToPortfolio(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  portfolioId: string,
  experienceId: string,
) {
  const { data, error } = await supabase
    .from('experience')
    .select('id')
    .eq('id', experienceId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Experience entry not found for this portfolio.');
  }
}

async function getNextOrderIndex(supabase: ReturnType<typeof createAdminSupabaseClient>, portfolioId: string) {
  const { data, error } = await supabase
    .from('experience')
    .select('order_index')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle<{ order_index: number | null }>();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.order_index ?? -1) + 1;
}

export async function createExperienceEntryAction(
  portfolioSlug: string,
  payload: ExperiencePayload,
): Promise<ExperienceMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateExperiencePayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('experience').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateExperience(portfolioSlug);

    return { success: 'Experience entry created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create experience entry.' };
  }
}

export async function updateExperienceEntryAction(
  portfolioSlug: string,
  experienceId: string,
  payload: ExperiencePayload,
): Promise<ExperienceMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateExperiencePayload(payload);

    await ensureExperienceBelongsToPortfolio(supabase, access.portfolio.id, experienceId);

    const { error } = await supabase.from('experience').update(input).eq('id', experienceId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateExperience(portfolioSlug);

    return { success: 'Experience entry saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save experience entry.' };
  }
}

export async function archiveExperienceEntryAction(
  portfolioSlug: string,
  experienceId: string,
): Promise<ExperienceMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureExperienceBelongsToPortfolio(supabase, access.portfolio.id, experienceId);

    const { error } = await supabase
      .from('experience')
      .update({ is_active: false })
      .eq('id', experienceId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateExperience(portfolioSlug);

    return { success: 'Experience entry archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive experience entry.' };
  }
}

export async function restoreExperienceEntryAction(
  portfolioSlug: string,
  experienceId: string,
): Promise<ExperienceMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureExperienceBelongsToPortfolio(supabase, access.portfolio.id, experienceId);

    const { error } = await supabase
      .from('experience')
      .update({ is_active: true })
      .eq('id', experienceId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateExperience(portfolioSlug);

    return { success: 'Experience entry restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore experience entry.' };
  }
}

export async function reorderExperienceEntriesAction(
  portfolioSlug: string,
  orderedExperienceIds: string[],
): Promise<ExperienceMutationResult> {
  try {
    const ids = orderedExperienceIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No experience entries were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('experience')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more experience entries do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((experienceId, index) =>
        supabase.from('experience').update({ order_index: index }).eq('id', experienceId).eq('portfolio_id', access.portfolio.id),
      ),
    );

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateExperience(portfolioSlug);

    return { success: 'Experience order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder experience entries.' };
  }
}
