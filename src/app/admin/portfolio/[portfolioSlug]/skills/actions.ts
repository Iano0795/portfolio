'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { SkillMutationResult, SkillPayload } from '@/components/admin/skills/types';

type SkillInput = {
  name: string;
  category: string;
  level: string | null;
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

function validateSkillPayload(payload: SkillPayload): SkillInput {
  const name = cleanString(payload.name);
  const category = cleanString(payload.category);
  const errors: string[] = [];

  if (!name) {
    errors.push('Name is required.');
  }

  if (!category) {
    errors.push('Category is required.');
  }

  validateMax(name, 'Name', 120, errors);
  validateMax(category, 'Category', 120, errors);
  validateMax(payload.level, 'Level', 80, errors);

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    name,
    category,
    level: nullableText(payload.level),
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
  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  return { access, supabase };
}

function revalidateSkills(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/skills`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureSkillBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  skillId: string,
) {
  const { data, error } = await supabase
    .from('skills')
    .select('id')
    .eq('id', skillId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Skill not found for this portfolio.');
  }
}

async function getNextOrderIndex(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  category: string,
) {
  const { data, error } = await supabase
    .from('skills')
    .select('order_index')
    .eq('portfolio_id', portfolioId)
    .eq('category', category)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle<{ order_index: number | null }>();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.order_index ?? -1) + 1;
}

export async function createSkillAction(portfolioSlug: string, payload: SkillPayload): Promise<SkillMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateSkillPayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id, input.category);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('skills').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateSkills(portfolioSlug);

    return { success: 'Skill created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create skill.' };
  }
}

export async function updateSkillAction(
  portfolioSlug: string,
  skillId: string,
  payload: SkillPayload,
): Promise<SkillMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateSkillPayload(payload);

    await ensureSkillBelongsToPortfolio(supabase, access.portfolio.id, skillId);

    const { error } = await supabase.from('skills').update(input).eq('id', skillId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateSkills(portfolioSlug);

    return { success: 'Skill saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save skill.' };
  }
}

export async function archiveSkillAction(portfolioSlug: string, skillId: string): Promise<SkillMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureSkillBelongsToPortfolio(supabase, access.portfolio.id, skillId);

    const { error } = await supabase
      .from('skills')
      .update({ is_active: false })
      .eq('id', skillId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateSkills(portfolioSlug);

    return { success: 'Skill archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive skill.' };
  }
}

export async function restoreSkillAction(portfolioSlug: string, skillId: string): Promise<SkillMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureSkillBelongsToPortfolio(supabase, access.portfolio.id, skillId);

    const { error } = await supabase
      .from('skills')
      .update({ is_active: true })
      .eq('id', skillId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateSkills(portfolioSlug);

    return { success: 'Skill restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore skill.' };
  }
}

export async function reorderSkillsAction(
  portfolioSlug: string,
  skillId: string,
  direction: 'up' | 'down',
): Promise<SkillMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureSkillBelongsToPortfolio(supabase, access.portfolio.id, skillId);

    // Get the current skill
    const { data: currentSkill, error: currentError } = await supabase
      .from('skills')
      .select('id, category, order_index, is_active')
      .eq('id', skillId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle<{ id: string; category: string; order_index: number; is_active: boolean }>();

    if (currentError || !currentSkill) {
      return { error: 'Skill not found.' };
    }

    // Get all active skills in the same category
    const { data: categorySkills, error: categoryError } = await supabase
      .from('skills')
      .select('id, order_index')
      .eq('portfolio_id', access.portfolio.id)
      .eq('category', currentSkill.category)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .returns<Array<{ id: string; order_index: number }>>();

    if (categoryError || !categorySkills) {
      return { error: 'Unable to load category skills.' };
    }

    const currentIndex = categorySkills.findIndex((s) => s.id === skillId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= categorySkills.length) {
      return { error: 'Cannot move skill in that direction.' };
    }

    // Swap order_index values
    const targetSkill = categorySkills[targetIndex];
    const updates = await Promise.all([
      supabase
        .from('skills')
        .update({ order_index: targetSkill.order_index })
        .eq('id', currentSkill.id)
        .eq('portfolio_id', access.portfolio.id),
      supabase
        .from('skills')
        .update({ order_index: currentSkill.order_index })
        .eq('id', targetSkill.id)
        .eq('portfolio_id', access.portfolio.id),
    ]);

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateSkills(portfolioSlug);

    return { success: 'Skill order updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder skills.' };
  }
}
