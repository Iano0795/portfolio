import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { SkillsManager } from '@/components/admin/skills/SkillsManager';
import type { SkillEditorValue } from '@/components/admin/skills/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveSkillAction,
  createSkillAction,
  reorderSkillsAction,
  restoreSkillAction,
  updateSkillAction,
} from './actions';

export const dynamic = 'force-dynamic';

type SkillsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsSkill = {
  id: string;
  name: string;
  category: string;
  level: string | null;
  order_index: number;
  is_active: boolean;
};

function normalizeSkill(skill: CmsSkill): SkillEditorValue {
  return {
    id: skill.id,
    name: skill.name ?? '',
    category: skill.category ?? '',
    level: skill.level ?? '',
    orderIndex: skill.order_index ?? 0,
    isActive: skill.is_active ?? true,
  };
}

async function getEditableSkills(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('category', { ascending: true })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsSkill[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeSkill);
}

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const skills = await getEditableSkills(access.portfolio.id);

    return (
      <AdminShell activeItem="skills" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <SkillsManager
          initialSkills={skills}
          portfolio={access.portfolio}
          role={access.member.role}
          createSkill={createSkillAction.bind(null, portfolioSlug)}
          updateSkill={updateSkillAction.bind(null, portfolioSlug)}
          archiveSkill={archiveSkillAction.bind(null, portfolioSlug)}
          restoreSkill={restoreSkillAction.bind(null, portfolioSlug)}
          reorderSkills={reorderSkillsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
