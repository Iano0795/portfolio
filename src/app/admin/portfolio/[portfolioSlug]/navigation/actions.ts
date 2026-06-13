'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { NavigationItemMutationResult, NavigationItemPayload } from '@/components/admin/navigation/types';

type NavigationItemInput = {
  section_id: string;
  label: string;
  system_label: string | null;
  command: string | null;
  icon: string | null;
  order_index: number;
  is_visible: boolean;
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

const SUPPORTED_SECTIONS = ['profile', 'about', 'capabilities', 'skills', 'projects', 'credentials', 'process', 'experience', 'contact'];

function validateNavigationItemPayload(payload: NavigationItemPayload): NavigationItemInput {
  const sectionId = cleanString(payload.sectionId).toLowerCase();
  const label = cleanString(payload.label);
  const errors: string[] = [];

  if (!sectionId) {
    errors.push('Section ID is required.');
  }

  if (!SUPPORTED_SECTIONS.includes(sectionId)) {
    errors.push(`Section ID must be one of: ${SUPPORTED_SECTIONS.join(', ')}.`);
  }

  if (!label) {
    errors.push('Label is required.');
  }

  validateMax(sectionId, 'Section ID', 80, errors);
  validateMax(label, 'Label', 120, errors);
  validateMax(payload.systemLabel, 'System Label', 120, errors);
  validateMax(payload.command, 'Command', 200, errors);
  validateMax(payload.icon, 'Icon', 80, errors);

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    section_id: sectionId,
    label,
    system_label: nullableText(payload.systemLabel),
    command: nullableText(payload.command),
    icon: nullableText(payload.icon),
    order_index: orderIndex,
    is_visible: payload.isVisible,
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

function revalidateNavigation(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/navigation`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
  revalidatePath('/'); // Revalidate public portfolio
}

async function ensureNavigationItemBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  itemId: string,
) {
  const { data, error } = await supabase
    .from('navigation_items')
    .select('id')
    .eq('id', itemId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Navigation item not found for this portfolio.');
  }
}

async function getNextOrderIndex(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
) {
  const { data, error } = await supabase
    .from('navigation_items')
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

export async function createNavigationItemAction(portfolioSlug: string, payload: NavigationItemPayload): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateNavigationItemPayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('navigation_items').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create navigation item.' };
  }
}

export async function updateNavigationItemAction(
  portfolioSlug: string,
  itemId: string,
  payload: NavigationItemPayload,
): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateNavigationItemPayload(payload);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    const { error } = await supabase.from('navigation_items').update(input).eq('id', itemId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save navigation item.' };
  }
}

export async function archiveNavigationItemAction(portfolioSlug: string, itemId: string): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    const { error } = await supabase
      .from('navigation_items')
      .update({ is_active: false })
      .eq('id', itemId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive navigation item.' };
  }
}

export async function restoreNavigationItemAction(portfolioSlug: string, itemId: string): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    const { error } = await supabase
      .from('navigation_items')
      .update({ is_active: true })
      .eq('id', itemId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore navigation item.' };
  }
}

export async function hideNavigationItemAction(portfolioSlug: string, itemId: string): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    const { error } = await supabase
      .from('navigation_items')
      .update({ is_visible: false })
      .eq('id', itemId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item hidden.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to hide navigation item.' };
  }
}

export async function showNavigationItemAction(portfolioSlug: string, itemId: string): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    const { error } = await supabase
      .from('navigation_items')
      .update({ is_visible: true })
      .eq('id', itemId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation item shown.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to show navigation item.' };
  }
}

export async function reorderNavigationItemsAction(
  portfolioSlug: string,
  itemId: string,
  direction: 'up' | 'down',
): Promise<NavigationItemMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureNavigationItemBelongsToPortfolio(supabase, access.portfolio.id, itemId);

    // Get the current item
    const { data: currentItem, error: currentError } = await supabase
      .from('navigation_items')
      .select('id, order_index, is_active')
      .eq('id', itemId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle<{ id: string; order_index: number; is_active: boolean }>();

    if (currentError || !currentItem) {
      return { error: 'Navigation item not found.' };
    }

    // Get all active items
    const { data: allItems, error: listError } = await supabase
      .from('navigation_items')
      .select('id, order_index')
      .eq('portfolio_id', access.portfolio.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .returns<Array<{ id: string; order_index: number }>>();

    if (listError || !allItems) {
      return { error: 'Unable to load navigation items.' };
    }

    const currentIndex = allItems.findIndex((i) => i.id === itemId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= allItems.length) {
      return { error: 'Cannot move item in that direction.' };
    }

    // Swap order_index values
    const targetItem = allItems[targetIndex];
    const updates = await Promise.all([
      supabase
        .from('navigation_items')
        .update({ order_index: targetItem.order_index })
        .eq('id', currentItem.id)
        .eq('portfolio_id', access.portfolio.id),
      supabase
        .from('navigation_items')
        .update({ order_index: currentItem.order_index })
        .eq('id', targetItem.id)
        .eq('portfolio_id', access.portfolio.id),
    ]);

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateNavigation(portfolioSlug);

    return { success: 'Navigation order updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder navigation items.' };
  }
}
