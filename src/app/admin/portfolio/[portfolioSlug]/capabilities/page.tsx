import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { CapabilitiesManager } from '@/components/admin/capabilities/CapabilitiesManager';
import type { CapabilityEditorValue } from '@/components/admin/capabilities/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveCapabilityAction,
  createCapabilityAction,
  reorderCapabilitiesAction,
  restoreCapabilityAction,
  updateCapabilityAction,
} from './actions';

export const dynamic = 'force-dynamic';

type CapabilitiesPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsCapability = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
};

function normalizeCapability(capability: CmsCapability): CapabilityEditorValue {
  return {
    id: capability.id,
    title: capability.title ?? '',
    description: capability.description ?? '',
    icon: capability.icon ?? '',
    orderIndex: capability.order_index ?? 0,
    isActive: capability.is_active ?? true,
  };
}

async function getEditableCapabilities(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('capabilities')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsCapability[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeCapability);
}

export default async function CapabilitiesPage({ params }: CapabilitiesPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const capabilities = await getEditableCapabilities(access.portfolio.id);

    return (
      <AdminShell activeItem="capabilities" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <CapabilitiesManager
          initialCapabilities={capabilities}
          portfolio={access.portfolio}
          role={access.member.role}
          createCapability={createCapabilityAction.bind(null, portfolioSlug)}
          updateCapability={updateCapabilityAction.bind(null, portfolioSlug)}
          archiveCapability={archiveCapabilityAction.bind(null, portfolioSlug)}
          restoreCapability={restoreCapabilityAction.bind(null, portfolioSlug)}
          reorderCapabilities={reorderCapabilitiesAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
