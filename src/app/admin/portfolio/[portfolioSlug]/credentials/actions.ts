'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { CredentialMutationResult, CredentialPayload } from '@/components/admin/credentials/types';

type CredentialInput = {
  title: string;
  issuer: string | null;
  credential_type: string | null;
  category: string | null;
  description: string | null;
  issued_at: string | null;
  expires_at: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  skills: string[];
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
};

const urlFields = [
  ['credentialUrl', 'Credential URL'],
  ['imageUrl', 'Image URL'],
] as const;

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

function nullableUrl(value: string, label: string, errors: string[]) {
  const clean = cleanString(value);

  if (!clean) {
    return null;
  }

  try {
    return new URL(clean).toString();
  } catch {
    errors.push(`${label} must be a valid URL or blank.`);
    return null;
  }
}

function nullableDate(value: string, label: string, errors: string[]) {
  const clean = cleanString(value);

  if (!clean) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean) || Number.isNaN(Date.parse(`${clean}T00:00:00Z`))) {
    errors.push(`${label} must be a valid date or blank.`);
    return null;
  }

  return clean;
}

function validateCredentialPayload(payload: CredentialPayload): CredentialInput {
  const title = cleanString(payload.title);
  const skills = Array.isArray(payload.skills) ? payload.skills.map(cleanString).filter(Boolean) : [];
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 180, errors);
  validateMax(payload.issuer, 'Issuer', 180, errors);
  validateMax(payload.credentialType, 'Credential type', 120, errors);
  validateMax(payload.category, 'Category', 120, errors);
  validateMax(payload.description, 'Description', 1000, errors);
  validateMax(payload.credentialId, 'Credential ID', 180, errors);

  skills.forEach((skill) => validateMax(skill, 'Skill/topic', 80, errors));

  const urls: Record<(typeof urlFields)[number][0], string | null> = {
    credentialUrl: null,
    imageUrl: null,
  };

  urlFields.forEach(([field, label]) => {
    urls[field] = nullableUrl(payload[field], label, errors);
  });

  const issuedAt = nullableDate(payload.issuedAt, 'Issued date', errors);
  const expiresAt = nullableDate(payload.expiresAt, 'Expiry date', errors);
  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    title,
    issuer: nullableText(payload.issuer),
    credential_type: nullableText(payload.credentialType),
    category: nullableText(payload.category),
    description: nullableText(payload.description),
    issued_at: issuedAt,
    expires_at: expiresAt,
    credential_id: nullableText(payload.credentialId),
    credential_url: urls.credentialUrl,
    image_url: urls.imageUrl,
    skills,
    order_index: orderIndex,
    is_featured: payload.isFeatured,
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

function revalidateCredentials(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/credentials`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
  revalidatePath('/');
}

async function ensureCredentialBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  credentialId: string,
) {
  const { data, error } = await supabase
    .from('credentials')
    .select('id')
    .eq('id', credentialId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Credential not found for this portfolio.');
  }
}

async function getNextOrderIndex(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>, portfolioId: string) {
  const { data, error } = await supabase
    .from('credentials')
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

export async function createCredentialAction(portfolioSlug: string, payload: CredentialPayload): Promise<CredentialMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateCredentialPayload(payload);
    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const { error } = await supabase.from('credentials').insert({
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    });

    if (error) {
      return { error: error.message };
    }

    revalidateCredentials(portfolioSlug);

    return { success: 'Credential created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create credential.' };
  }
}

export async function updateCredentialAction(
  portfolioSlug: string,
  credentialId: string,
  payload: CredentialPayload,
): Promise<CredentialMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateCredentialPayload(payload);

    await ensureCredentialBelongsToPortfolio(supabase, access.portfolio.id, credentialId);

    const { error } = await supabase
      .from('credentials')
      .update(input)
      .eq('id', credentialId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCredentials(portfolioSlug);

    return { success: 'Credential saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save credential.' };
  }
}

export async function archiveCredentialAction(portfolioSlug: string, credentialId: string): Promise<CredentialMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureCredentialBelongsToPortfolio(supabase, access.portfolio.id, credentialId);

    const { error } = await supabase
      .from('credentials')
      .update({ is_active: false, is_featured: false })
      .eq('id', credentialId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCredentials(portfolioSlug);

    return { success: 'Credential archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive credential.' };
  }
}

export async function restoreCredentialAction(portfolioSlug: string, credentialId: string): Promise<CredentialMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureCredentialBelongsToPortfolio(supabase, access.portfolio.id, credentialId);

    const { error } = await supabase
      .from('credentials')
      .update({ is_active: true })
      .eq('id', credentialId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateCredentials(portfolioSlug);

    return { success: 'Credential restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore credential.' };
  }
}

export async function reorderCredentialsAction(
  portfolioSlug: string,
  orderedCredentialIds: string[],
): Promise<CredentialMutationResult> {
  try {
    const ids = orderedCredentialIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No credentials were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('credentials')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more credentials do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((credentialId, index) =>
        supabase.from('credentials').update({ order_index: index }).eq('id', credentialId).eq('portfolio_id', access.portfolio.id),
      ),
    );
    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateCredentials(portfolioSlug);

    return { success: 'Credential order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder credentials.' };
  }
}
