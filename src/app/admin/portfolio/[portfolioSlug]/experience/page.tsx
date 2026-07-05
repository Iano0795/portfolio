import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ExperienceManager } from '@/components/admin/experience/ExperienceManager';
import type { ExperienceEditorValue } from '@/components/admin/experience/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveExperienceEntryAction,
  createExperienceEntryAction,
  reorderExperienceEntriesAction,
  restoreExperienceEntryAction,
  updateExperienceEntryAction,
} from './actions';

export const dynamic = 'force-dynamic';

type ExperiencePageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsExperience = {
  id: string;
  stage_label: string | null;
  title: string;
  organization: string | null;
  period: string | null;
  description: string | null;
  achievements: unknown;
  order_index: number;
  is_active: boolean;
};

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function achievementsToStrings(value: unknown) {
  if (Array.isArray(value)) {
    return stringArray(value);
  }

  if (isObject(value)) {
    return stringArray(value.achievements);
  }

  return [];
}

function normalizeExperience(experience: CmsExperience): ExperienceEditorValue {
  return {
    id: experience.id,
    stageLabel: experience.stage_label ?? '',
    title: experience.title ?? '',
    organization: experience.organization ?? '',
    period: experience.period ?? '',
    description: experience.description ?? '',
    achievements: achievementsToStrings(experience.achievements).map((value, index) => ({
      id: `achievement-${experience.id}-${index}`,
      value,
    })),
    orderIndex: experience.order_index ?? 0,
    isActive: experience.is_active ?? true,
  };
}

async function getEditableExperience(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsExperience[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeExperience);
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const experiences = await getEditableExperience(access.portfolio.id);

    return (
      <AdminShell activeItem="experience" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ExperienceManager
          initialExperiences={experiences}
          portfolio={access.portfolio}
          role={access.member.role}
          createExperience={createExperienceEntryAction.bind(null, portfolioSlug)}
          updateExperience={updateExperienceEntryAction.bind(null, portfolioSlug)}
          archiveExperience={archiveExperienceEntryAction.bind(null, portfolioSlug)}
          restoreExperience={restoreExperienceEntryAction.bind(null, portfolioSlug)}
          reorderExperiences={reorderExperienceEntriesAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
