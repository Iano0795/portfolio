'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { WriteupMutationResult, WriteupPayload } from '@/components/admin/writeups/types';

type WriteupInput = {
  project_id: string | null;
  title: string;
  slug: string;
  platform: string | null;
  difficulty: string | null;
  category: string | null;
  machine_status: string;
  visibility: string;
  public_summary: string | null;
  public_teaser: string | null;
  tools: string[];
  skills: string[];
  tags: string[];
  storage_bucket: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_type: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
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

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 180);
}

function validateWriteupPayload(payload: WriteupPayload): WriteupInput {
  const title = cleanString(payload.title);
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 180, errors);

  const slug = payload.slug ? cleanString(payload.slug) : generateSlugFromTitle(title);
  validateMax(slug, 'Slug', 180, errors);

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens.');
  }

  validateMax(payload.platform, 'Platform', 120, errors);
  validateMax(payload.difficulty, 'Difficulty', 80, errors);
  validateMax(payload.category, 'Category', 120, errors);
  validateMax(payload.publicSummary, 'Public summary', 1200, errors);
  validateMax(payload.publicTeaser, 'Public teaser', 600, errors);
  validateMax(payload.storageBucket, 'Storage bucket', 120, errors);
  validateMax(payload.storagePath, 'Storage path', 500, errors);
  validateMax(payload.fileName, 'File name', 240, errors);
  validateMax(payload.fileType, 'File type', 120, errors);

  // Security validation: active machines cannot be public
  if (payload.machineStatus === 'active' && payload.visibility === 'public') {
    errors.push('Active machines cannot have public visibility. Set status to "retired" or visibility to "restricted" or "private".');
  }

  // Validate visibility values
  if (!['public', 'restricted', 'private'].includes(payload.visibility)) {
    errors.push('Invalid visibility value.');
  }

  // Validate machine status values
  if (!['active', 'retired', 'other'].includes(payload.machineStatus)) {
    errors.push('Invalid machine status value.');
  }

  const tools = Array.isArray(payload.tools)
    ? payload.tools.map((value) => cleanString(value)).filter(Boolean)
    : [];

  const skills = Array.isArray(payload.skills)
    ? payload.skills.map((value) => cleanString(value)).filter(Boolean)
    : [];

  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((value) => cleanString(value)).filter(Boolean)
    : [];

  tools.forEach((tool, index) => {
    if (tool.length > 80) {
      errors.push(`Tool ${index + 1} must be 80 characters or fewer.`);
    }
  });

  skills.forEach((skill, index) => {
    if (skill.length > 80) {
      errors.push(`Skill ${index + 1} must be 80 characters or fewer.`);
    }
  });

  tags.forEach((tag, index) => {
    if (tag.length > 80) {
      errors.push(`Tag ${index + 1} must be 80 characters or fewer.`);
    }
  });

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    project_id: payload.projectId || null,
    title,
    slug,
    platform: nullableText(payload.platform),
    difficulty: nullableText(payload.difficulty),
    category: nullableText(payload.category),
    machine_status: payload.machineStatus,
    visibility: payload.visibility,
    public_summary: nullableText(payload.publicSummary),
    public_teaser: nullableText(payload.publicTeaser),
    tools,
    skills,
    tags,
    storage_bucket: nullableText(payload.storageBucket),
    storage_path: nullableText(payload.storagePath),
    file_name: nullableText(payload.fileName),
    file_type: nullableText(payload.fileType),
    is_featured: payload.isFeatured,
    is_active: payload.isActive,
    order_index: orderIndex,
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

function revalidateWriteups(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/writeups`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureWriteupBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  writeupId: string,
) {
  const { data, error } = await supabase
    .from('lab_writeups')
    .select('id')
    .eq('id', writeupId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Writeup not found for this portfolio.');
  }
}

async function ensureProjectBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  projectId: string,
) {
  if (!projectId) {
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Linked project not found for this portfolio.');
  }
}

async function checkSlugUniqueness(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  slug: string,
  excludeWriteupId?: string,
) {
  let query = supabase
    .from('lab_writeups')
    .select('id')
    .eq('portfolio_id', portfolioId)
    .eq('slug', slug);

  if (excludeWriteupId) {
    query = query.neq('id', excludeWriteupId);
  }

  const { data, error } = await query.maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    throw new Error(`A writeup with slug "${slug}" already exists in this portfolio.`);
  }
}

async function getNextOrderIndex(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>, portfolioId: string) {
  const { data, error } = await supabase
    .from('lab_writeups')
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

export async function createWriteupAction(
  portfolioSlug: string,
  payload: WriteupPayload,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateWriteupPayload(payload);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, input.project_id ?? '');
    await checkSlugUniqueness(supabase, access.portfolio.id, input.slug);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('lab_writeups').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup created successfully.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create writeup.' };
  }
}

export async function updateWriteupAction(
  portfolioSlug: string,
  writeupId: string,
  payload: WriteupPayload,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateWriteupPayload(payload);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);
    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, input.project_id ?? '');
    await checkSlugUniqueness(supabase, access.portfolio.id, input.slug, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update(input)
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup saved successfully.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save writeup.' };
  }
}

export async function archiveWriteupAction(
  portfolioSlug: string,
  writeupId: string,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update({ is_active: false })
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive writeup.' };
  }
}

export async function restoreWriteupAction(
  portfolioSlug: string,
  writeupId: string,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update({ is_active: true })
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore writeup.' };
  }
}

export async function reorderWriteupsAction(
  portfolioSlug: string,
  orderedWriteupIds: string[],
): Promise<WriteupMutationResult> {
  try {
    const ids = orderedWriteupIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No writeups were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('lab_writeups')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more writeups do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((writeupId, index) =>
        supabase
          .from('lab_writeups')
          .update({ order_index: index })
          .eq('id', writeupId)
          .eq('portfolio_id', access.portfolio.id),
      ),
    );

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder writeups.' };
  }
}
