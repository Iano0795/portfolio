'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { CapabilityMutationResult, CapabilityPayload } from '@/components/admin/capabilities/types';

type CapabilityInput = {
  title: string;
  description: string | null;
  icon: string | null;
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

function validateCapabilityPayload(payload: CapabilityPayload): CapabilityInput {
  const title = cleanString(payload.title);
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 160, errors);
  validateMax(payload.description, 'Description', 600, errors);
  validateMax(payload.icon, 'Icon', 80, errors);

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    title,
    description: nullableText(payload.description),
    icon: nullableText(payload.icon),
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

function revalidateCapabilities(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/capabilities`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureCapabilityBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  capabilityId: string,
) {
  const { data, error } = await supabase
    .from('capabilities')
    .select('id')
    .eq('id', capabilityId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Capability not found for this portfolio.');
  }
}

async function getNextOrderIndex(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
) {
  const { data, error } = await supabase
    .from('capabilities')
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

export async function createCapabilityAction(portfolioSlug: string, payload: CapabilityPayload): Promise<CapabilityMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateCapabilityPayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('capabilities').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateCapabilities(portfolioSlug);

    return { success: 'Capability created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create capability.' };
  }
}

export async function updateCapabilityAction(
  portfolioSlug: string,
  capabilityId: string,
  payload: CapabilityPayload,
): Promise<CapabilityMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateCapabilityPayload(payload);

    await ensureCapabilityBelongsToPortfolio(supabase, access.portfolio.id, capabilityId);

    const { error } = await supabase.from('capabilities').update(input).eq('id', capabilityId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCapabilities(portfolioSlug);

    return { success: 'Capability saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save capability.' };
  }
}

export async function archiveCapabilityAction(portfolioSlug: string, capabilityId: string): Promise<CapabilityMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureCapabilityBelongsToPortfolio(supabase, access.portfolio.id, capabilityId);

    const { error } = await supabase
      .from('capabilities')
      .update({ is_active: false })
      .eq('id', capabilityId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCapabilities(portfolioSlug);

    return { success: 'Capability archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive capability.' };
  }
}

export async function restoreCapabilityAction(portfolioSlug: string, capabilityId: string): Promise<CapabilityMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureCapabilityBelongsToPortfolio(supabase, access.portfolio.id, capabilityId);

    const { error } = await supabase
      .from('capabilities')
      .update({ is_active: true })
      .eq('id', capabilityId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCapabilities(portfolioSlug);

    return { success: 'Capability restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore capability.' };
  }
}

export async function reorderCapabilitiesAction(
  portfolioSlug: string,
  capabilityId: string,
  direction: 'up' | 'down',
): Promise<CapabilityMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureCapabilityBelongsToPortfolio(supabase, access.portfolio.id, capabilityId);

    // Get the current capability
    const { data: currentCapability, error: currentError } = await supabase
      .from('capabilities')
      .select('id, order_index, is_active')
      .eq('id', capabilityId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle<{ id: string; order_index: number; is_active: boolean }>();

    if (currentError || !currentCapability) {
      return { error: 'Capability not found.' };
    }

    // Get all active capabilities
    const { data: allCapabilities, error: listError } = await supabase
      .from('capabilities')
      .select('id, order_index')
      .eq('portfolio_id', access.portfolio.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .returns<Array<{ id: string; order_index: number }>>();

    if (listError || !allCapabilities) {
      return { error: 'Unable to load capabilities.' };
    }

    const currentIndex = allCapabilities.findIndex((c) => c.id === capabilityId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= allCapabilities.length) {
      return { error: 'Cannot move capability in that direction.' };
    }

    // Swap order_index values
    const targetCapability = allCapabilities[targetIndex];
    const updates = await Promise.all([
      supabase
        .from('capabilities')
        .update({ order_index: targetCapability.order_index })
        .eq('id', currentCapability.id)
        .eq('portfolio_id', access.portfolio.id),
      supabase
        .from('capabilities')
        .update({ order_index: currentCapability.order_index })
        .eq('id', targetCapability.id)
        .eq('portfolio_id', access.portfolio.id),
    ]);

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateCapabilities(portfolioSlug);

    return { success: 'Capability order updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder capabilities.' };
  }
}
