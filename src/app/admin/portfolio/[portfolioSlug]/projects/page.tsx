import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProjectsManager } from '@/components/admin/projects/ProjectsManager';
import type { ProjectEditorValue } from '@/components/admin/projects/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import type { CmsProject } from '@/lib/cms/queries';
import {
  archiveProjectAction,
  createProjectAction,
  reorderProjectsAction,
  setFeaturedProjectAction,
  toggleProjectActiveAction,
  updateProjectAction,
} from './actions';

export const dynamic = 'force-dynamic';

type ProjectsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function stackToStrings(value: unknown) {
  if (Array.isArray(value)) {
    return stringArray(value);
  }

  if (isObject(value)) {
    return stringArray(value.stack);
  }

  return [];
}

function normalizeProject(project: CmsProject): ProjectEditorValue {
  return {
    id: project.id,
    title: project.title ?? '',
    slug: project.slug ?? '',
    category: project.category ?? '',
    role: project.role ?? '',
    shortDescription: project.short_description ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    outcome: project.outcome ?? '',
    stack: stackToStrings(project.stack).map((value, index) => ({
      id: `stack-${project.id}-${index}`,
      value,
    })),
    githubUrl: project.github_url ?? '',
    liveUrl: project.live_url ?? '',
    caseStudyUrl: project.case_study_url ?? '',
    imageUrl: project.image_url ?? '',
    orderIndex: project.order_index ?? 0,
    isFeatured: project.is_featured ?? false,
    isPrivate: project.is_private ?? false,
    isActive: project.is_active ?? true,
  };
}

async function getEditableProjects(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsProject[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProject);
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const projects = await getEditableProjects(access.portfolio.id);

    return (
      <AdminShell activeItem="projects" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ProjectsManager
          initialProjects={projects}
          portfolio={access.portfolio}
          role={access.member.role}
          createProject={createProjectAction.bind(null, portfolioSlug)}
          updateProject={updateProjectAction.bind(null, portfolioSlug)}
          archiveProject={archiveProjectAction.bind(null, portfolioSlug)}
          toggleProjectActive={toggleProjectActiveAction.bind(null, portfolioSlug)}
          setFeaturedProject={setFeaturedProjectAction.bind(null, portfolioSlug)}
          reorderProjects={reorderProjectsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
