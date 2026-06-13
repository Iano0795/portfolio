import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProcessManager } from '@/components/admin/process/ProcessManager';
import type { ProcessStepEditorValue } from '@/components/admin/process/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveProcessStepAction,
  createProcessStepAction,
  reorderProcessStepsAction,
  restoreProcessStepAction,
  updateProcessStepAction,
} from './actions';

export const dynamic = 'force-dynamic';

type ProcessPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsProcessStep = {
  id: string;
  title: string;
  description: string | null;
  command: string | null;
  label: string | null;
  order_index: number;
  is_active: boolean;
};

function normalizeProcessStep(step: CmsProcessStep): ProcessStepEditorValue {
  return {
    id: step.id,
    title: step.title ?? '',
    description: step.description ?? '',
    command: step.command ?? '',
    label: step.label ?? '',
    orderIndex: step.order_index ?? 0,
    isActive: step.is_active ?? true,
  };
}

async function getEditableProcessSteps(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('process_steps')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsProcessStep[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProcessStep);
}

export default async function ProcessPage({ params }: ProcessPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const steps = await getEditableProcessSteps(access.portfolio.id);

    return (
      <AdminShell activeItem="process" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ProcessManager
          initialSteps={steps}
          portfolio={access.portfolio}
          role={access.member.role}
          createProcessStep={createProcessStepAction.bind(null, portfolioSlug)}
          updateProcessStep={updateProcessStepAction.bind(null, portfolioSlug)}
          archiveProcessStep={archiveProcessStepAction.bind(null, portfolioSlug)}
          restoreProcessStep={restoreProcessStepAction.bind(null, portfolioSlug)}
          reorderProcessSteps={reorderProcessStepsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
