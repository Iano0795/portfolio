'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ProcessStepMutationResult, ProcessStepPayload } from '@/components/admin/process/types';

type ProcessStepInput = {
  title: string;
  description: string | null;
  command: string | null;
  label: string | null;
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

function validateProcessStepPayload(payload: ProcessStepPayload): ProcessStepInput {
  const title = cleanString(payload.title);
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 160, errors);
  validateMax(payload.description, 'Description', 800, errors);
  validateMax(payload.command, 'Command', 200, errors);
  validateMax(payload.label, 'Label', 120, errors);

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    title,
    description: nullableText(payload.description),
    command: nullableText(payload.command),
    label: nullableText(payload.label),
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

function revalidateProcess(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/process`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureProcessStepBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  stepId: string,
) {
  const { data, error } = await supabase
    .from('process_steps')
    .select('id')
    .eq('id', stepId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Process step not found for this portfolio.');
  }
}

async function getNextOrderIndex(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
) {
  const { data, error } = await supabase
    .from('process_steps')
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

export async function createProcessStepAction(portfolioSlug: string, payload: ProcessStepPayload): Promise<ProcessStepMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateProcessStepPayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('process_steps').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateProcess(portfolioSlug);

    return { success: 'Process step created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create process step.' };
  }
}

export async function updateProcessStepAction(
  portfolioSlug: string,
  stepId: string,
  payload: ProcessStepPayload,
): Promise<ProcessStepMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateProcessStepPayload(payload);

    await ensureProcessStepBelongsToPortfolio(supabase, access.portfolio.id, stepId);

    const { error } = await supabase.from('process_steps').update(input).eq('id', stepId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProcess(portfolioSlug);

    return { success: 'Process step saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save process step.' };
  }
}

export async function archiveProcessStepAction(portfolioSlug: string, stepId: string): Promise<ProcessStepMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProcessStepBelongsToPortfolio(supabase, access.portfolio.id, stepId);

    const { error } = await supabase
      .from('process_steps')
      .update({ is_active: false })
      .eq('id', stepId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProcess(portfolioSlug);

    return { success: 'Process step archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive process step.' };
  }
}

export async function restoreProcessStepAction(portfolioSlug: string, stepId: string): Promise<ProcessStepMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProcessStepBelongsToPortfolio(supabase, access.portfolio.id, stepId);

    const { error } = await supabase
      .from('process_steps')
      .update({ is_active: true })
      .eq('id', stepId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProcess(portfolioSlug);

    return { success: 'Process step restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore process step.' };
  }
}

export async function reorderProcessStepsAction(
  portfolioSlug: string,
  stepId: string,
  direction: 'up' | 'down',
): Promise<ProcessStepMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProcessStepBelongsToPortfolio(supabase, access.portfolio.id, stepId);

    // Get the current step
    const { data: currentStep, error: currentError } = await supabase
      .from('process_steps')
      .select('id, order_index, is_active')
      .eq('id', stepId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle<{ id: string; order_index: number; is_active: boolean }>();

    if (currentError || !currentStep) {
      return { error: 'Process step not found.' };
    }

    // Get all active steps
    const { data: allSteps, error: listError } = await supabase
      .from('process_steps')
      .select('id, order_index')
      .eq('portfolio_id', access.portfolio.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .returns<Array<{ id: string; order_index: number }>>();

    if (listError || !allSteps) {
      return { error: 'Unable to load process steps.' };
    }

    const currentIndex = allSteps.findIndex((s) => s.id === stepId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= allSteps.length) {
      return { error: 'Cannot move step in that direction.' };
    }

    // Swap order_index values
    const targetStep = allSteps[targetIndex];
    const updates = await Promise.all([
      supabase
        .from('process_steps')
        .update({ order_index: targetStep.order_index })
        .eq('id', currentStep.id)
        .eq('portfolio_id', access.portfolio.id),
      supabase
        .from('process_steps')
        .update({ order_index: currentStep.order_index })
        .eq('id', targetStep.id)
        .eq('portfolio_id', access.portfolio.id),
    ]);

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateProcess(portfolioSlug);

    return { success: 'Process step order updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder process steps.' };
  }
}
