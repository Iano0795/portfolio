'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ContactMutationResult, ContactLinkPayload } from '@/components/admin/contact/types';

type ContactLinkInput = {
  label: string;
  type: string;
  url: string;
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

function normalizeUrl(url: string, type: string): string {
  const clean = cleanString(url);

  // For email type, normalize to mailto: if not already
  if (type === 'email' && clean && !clean.startsWith('mailto:')) {
    // Check if it looks like an email address
    if (clean.includes('@') && !clean.startsWith('http')) {
      return `mailto:${clean}`;
    }
  }

  return clean;
}

function validateContactLinkPayload(payload: ContactLinkPayload): ContactLinkInput {
  const label = cleanString(payload.label);
  const type = cleanString(payload.type);
  const url = normalizeUrl(payload.url, payload.type);
  const errors: string[] = [];

  if (!label) {
    errors.push('Label is required.');
  }

  if (!type) {
    errors.push('Type is required.');
  }

  if (!url) {
    errors.push('URL is required.');
  }

  validateMax(label, 'Label', 120, errors);
  validateMax(type, 'Type', 80, errors);
  validateMax(url, 'URL', 500, errors);
  validateMax(payload.icon, 'Icon', 80, errors);

  // Basic URL validation for non-special schemes
  if (url && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
    try {
      new URL(url);
    } catch {
      // If URL parsing fails, check if it's a relative URL or missing protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errors.push('URL must be a valid URL starting with http:// or https://, or use mailto:/tel: for email/phone.');
      }
    }
  }

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    label,
    type,
    url,
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

function revalidateContactLinks(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/contact`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureContactLinkBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  contactLinkId: string,
) {
  const { data, error } = await supabase
    .from('contact_links')
    .select('id')
    .eq('id', contactLinkId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Contact link not found for this portfolio.');
  }
}

async function getNextOrderIndex(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>, portfolioId: string) {
  const { data, error } = await supabase
    .from('contact_links')
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

export async function createContactLinkAction(
  portfolioSlug: string,
  payload: ContactLinkPayload,
): Promise<ContactMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateContactLinkPayload(payload);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('contact_links').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateContactLinks(portfolioSlug);

    return { success: 'Contact link created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create contact link.' };
  }
}

export async function updateContactLinkAction(
  portfolioSlug: string,
  contactLinkId: string,
  payload: ContactLinkPayload,
): Promise<ContactMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateContactLinkPayload(payload);

    await ensureContactLinkBelongsToPortfolio(supabase, access.portfolio.id, contactLinkId);

    const { error } = await supabase.from('contact_links').update(input).eq('id', contactLinkId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateContactLinks(portfolioSlug);

    return { success: 'Contact link saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save contact link.' };
  }
}

export async function archiveContactLinkAction(portfolioSlug: string, contactLinkId: string): Promise<ContactMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureContactLinkBelongsToPortfolio(supabase, access.portfolio.id, contactLinkId);

    const { error } = await supabase
      .from('contact_links')
      .update({ is_active: false })
      .eq('id', contactLinkId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateContactLinks(portfolioSlug);

    return { success: 'Contact link archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive contact link.' };
  }
}

export async function restoreContactLinkAction(portfolioSlug: string, contactLinkId: string): Promise<ContactMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureContactLinkBelongsToPortfolio(supabase, access.portfolio.id, contactLinkId);

    const { error } = await supabase
      .from('contact_links')
      .update({ is_active: true })
      .eq('id', contactLinkId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateContactLinks(portfolioSlug);

    return { success: 'Contact link restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore contact link.' };
  }
}

export async function reorderContactLinksAction(
  portfolioSlug: string,
  orderedContactLinkIds: string[],
): Promise<ContactMutationResult> {
  try {
    const ids = orderedContactLinkIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No contact links were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('contact_links')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more contact links do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((contactLinkId, index) =>
        supabase.from('contact_links').update({ order_index: index }).eq('id', contactLinkId).eq('portfolio_id', access.portfolio.id),
      ),
    );

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateContactLinks(portfolioSlug);

    return { success: 'Contact link order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder contact links.' };
  }
}
