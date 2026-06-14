import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { WriteupsManager } from '@/components/admin/writeups/WriteupsManager';
import type { WriteupEditorValue, ProjectOption } from '@/components/admin/writeups/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveWriteupAction,
  createWriteupAction,
  reorderWriteupsAction,
  restoreWriteupAction,
  updateWriteupAction,
} from './actions';

export const dynamic = 'force-dynamic';

type WriteupsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsWriteup = {
  id: string;
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
  tools: unknown;
  skills: unknown;
  tags: unknown;
  storage_bucket: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_type: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
};

type CmsProject = {
  id: string;
  title: string;
  slug: string;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeWriteup(writeup: CmsWriteup): WriteupEditorValue {
  return {
    id: writeup.id,
    projectId: writeup.project_id,
    title: writeup.title ?? '',
    slug: writeup.slug ?? '',
    platform: writeup.platform ?? '',
    difficulty: writeup.difficulty ?? '',
    category: writeup.category ?? '',
    machineStatus: (writeup.machine_status ?? 'retired') as 'active' | 'retired' | 'other',
    visibility: (writeup.visibility ?? 'restricted') as 'public' | 'restricted' | 'private',
    publicSummary: writeup.public_summary ?? '',
    publicTeaser: writeup.public_teaser ?? '',
    tools: stringArray(writeup.tools).map((value, index) => ({
      id: `tool-${writeup.id}-${index}`,
      value,
    })),
    skills: stringArray(writeup.skills).map((value, index) => ({
      id: `skill-${writeup.id}-${index}`,
      value,
    })),
    tags: stringArray(writeup.tags).map((value, index) => ({
      id: `tag-${writeup.id}-${index}`,
      value,
    })),
    storageBucket: writeup.storage_bucket ?? '',
    storagePath: writeup.storage_path ?? '',
    fileName: writeup.file_name ?? '',
    fileType: writeup.file_type ?? '',
    isFeatured: writeup.is_featured ?? false,
    isActive: writeup.is_active ?? true,
    orderIndex: writeup.order_index ?? 0,
  };
}

async function getEditableWriteups(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('lab_writeups')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsWriteup[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeWriteup);
}

async function getProjectOptions(portfolioId: string): Promise<ProjectOption[]> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, slug')
    .eq('portfolio_id', portfolioId)
    .eq('is_active', true)
    .order('title', { ascending: true })
    .returns<CmsProject[]>();

  if (error) {
    console.error('Failed to load projects:', error.message);
    return [];
  }

  return (data ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
  }));
}

export default async function WriteupsPage({ params }: WriteupsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const [writeups, projects] = await Promise.all([
      getEditableWriteups(access.portfolio.id),
      getProjectOptions(access.portfolio.id),
    ]);

    return (
      <AdminShell activeItem="writeups" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <WriteupsManager
          initialWriteups={writeups}
          portfolio={access.portfolio}
          role={access.member.role}
          projects={projects}
          createWriteup={createWriteupAction.bind(null, portfolioSlug)}
          updateWriteup={updateWriteupAction.bind(null, portfolioSlug)}
          archiveWriteup={archiveWriteupAction.bind(null, portfolioSlug)}
          restoreWriteup={restoreWriteupAction.bind(null, portfolioSlug)}
          reorderWriteups={reorderWriteupsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
