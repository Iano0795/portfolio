'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ProjectMutationResult, ProjectPayload } from '@/components/admin/projects/types';

type ProjectInput = {
  title: string;
  slug: string;
  category: string | null;
  role: string | null;
  short_description: string;
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  stack: string[];
  github_url: string | null;
  live_url: string | null;
  case_study_url: string | null;
  image_url: string | null;
  order_index: number;
  is_featured: boolean;
  is_private: boolean;
  is_active: boolean;
};

const urlFields = [
  ['githubUrl', 'GitHub URL'],
  ['liveUrl', 'Live URL'],
  ['caseStudyUrl', 'Case study URL'],
  ['imageUrl', 'Image URL'],
] as const;

function cleanString(value: string) {
  return value.trim();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function nullableText(value: string) {
  const clean = cleanString(value);

  return clean ? clean : null;
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

function validateMax(value: string, label: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function validateProjectPayload(payload: ProjectPayload): ProjectInput {
  const title = cleanString(payload.title);
  const slug = slugify(payload.slug || payload.title);
  const shortDescription = cleanString(payload.shortDescription);
  const stack = Array.isArray(payload.stack) ? payload.stack.map(cleanString).filter(Boolean) : [];
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  if (!slug) {
    errors.push('Slug is required.');
  }

  if (!shortDescription) {
    errors.push('Short description is required.');
  }

  validateMax(title, 'Title', 160, errors);
  validateMax(slug, 'Slug', 180, errors);
  validateMax(payload.category, 'Category', 120, errors);
  validateMax(payload.role, 'Role', 120, errors);
  validateMax(shortDescription, 'Short description', 500, errors);
  validateMax(payload.problem, 'Problem', 1200, errors);
  validateMax(payload.solution, 'Solution', 1200, errors);
  validateMax(payload.outcome, 'Outcome', 1200, errors);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push('Slug must be lowercase and URL-safe.');
  }

  const urls: Record<(typeof urlFields)[number][0], string | null> = {
    githubUrl: null,
    liveUrl: null,
    caseStudyUrl: null,
    imageUrl: null,
  };

  urlFields.forEach(([field, label]) => {
    urls[field] = nullableUrl(payload[field], label, errors);
  });
  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    title,
    slug,
    category: nullableText(payload.category),
    role: nullableText(payload.role),
    short_description: shortDescription,
    problem: nullableText(payload.problem),
    solution: nullableText(payload.solution),
    outcome: nullableText(payload.outcome),
    stack,
    github_url: urls.githubUrl,
    live_url: urls.liveUrl,
    case_study_url: urls.caseStudyUrl,
    image_url: urls.imageUrl,
    order_index: orderIndex,
    is_featured: payload.isFeatured,
    is_private: payload.isPrivate,
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

function revalidateProjects(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/projects`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureProjectBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  projectId: string,
) {
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
    throw new Error('Project not found for this portfolio.');
  }
}

async function ensureSlugIsAvailable(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  slug: string,
  projectId?: string,
) {
  let query = supabase.from('projects').select('id').eq('portfolio_id', portfolioId).eq('slug', slug);

  if (projectId) {
    query = query.neq('id', projectId);
  }

  const { data, error } = await query.limit(1).maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    throw new Error('Slug is already used by another project in this portfolio.');
  }
}

async function getNextOrderIndex(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>, portfolioId: string) {
  const { data, error } = await supabase
    .from('projects')
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

export async function createProjectAction(portfolioSlug: string, payload: ProjectPayload): Promise<ProjectMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateProjectPayload(payload);

    await ensureSlugIsAvailable(supabase, access.portfolio.id, input.slug);

    const orderIndex = Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0 ? payload.orderIndex : await getNextOrderIndex(supabase, access.portfolio.id);
    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
      is_private: payload.isPrivate ?? true,
    };

    if (insertPayload.is_featured) {
      const { error: unsetError } = await supabase.from('projects').update({ is_featured: false }).eq('portfolio_id', access.portfolio.id);

      if (unsetError) {
        return { error: unsetError.message };
      }
    }

    const { error } = await supabase.from('projects').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: 'Project created.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create project.' };
  }
}

export async function updateProjectAction(
  portfolioSlug: string,
  projectId: string,
  payload: ProjectPayload,
): Promise<ProjectMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateProjectPayload(payload);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, projectId);
    await ensureSlugIsAvailable(supabase, access.portfolio.id, input.slug, projectId);

    if (input.is_featured) {
      const { error: unsetError } = await supabase.from('projects').update({ is_featured: false }).eq('portfolio_id', access.portfolio.id);

      if (unsetError) {
        return { error: unsetError.message };
      }
    }

    const { error } = await supabase.from('projects').update(input).eq('id', projectId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: 'Project saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save project.' };
  }
}

export async function archiveProjectAction(portfolioSlug: string, projectId: string): Promise<ProjectMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, projectId);

    const { error } = await supabase
      .from('projects')
      .update({ is_active: false, is_featured: false })
      .eq('id', projectId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: 'Project archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive project.' };
  }
}

export async function toggleProjectActiveAction(
  portfolioSlug: string,
  projectId: string,
  isActive: boolean,
): Promise<ProjectMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, projectId);

    const payload = isActive ? { is_active: true } : { is_active: false, is_featured: false };
    const { error } = await supabase.from('projects').update(payload).eq('id', projectId).eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: isActive ? 'Project restored.' : 'Project hidden.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update project visibility.' };
  }
}

export async function setFeaturedProjectAction(portfolioSlug: string, projectId: string): Promise<ProjectMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, projectId);

    const { error: unsetError } = await supabase.from('projects').update({ is_featured: false }).eq('portfolio_id', access.portfolio.id);

    if (unsetError) {
      return { error: unsetError.message };
    }

    const { error } = await supabase
      .from('projects')
      .update({ is_featured: true, is_active: true })
      .eq('id', projectId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: 'Featured project updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to set featured project.' };
  }
}

export async function reorderProjectsAction(portfolioSlug: string, orderedProjectIds: string[]): Promise<ProjectMutationResult> {
  try {
    const ids = orderedProjectIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No projects were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('projects')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more projects do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((projectId, index) =>
        supabase.from('projects').update({ order_index: index }).eq('id', projectId).eq('portfolio_id', access.portfolio.id),
      ),
    );
    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateProjects(portfolioSlug);

    return { success: 'Project order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder projects.' };
  }
}
