import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { NavigationManager } from '@/components/admin/navigation/NavigationManager';
import type { NavigationItemEditorValue } from '@/components/admin/navigation/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveNavigationItemAction,
  createNavigationItemAction,
  hideNavigationItemAction,
  reorderNavigationItemsAction,
  restoreNavigationItemAction,
  showNavigationItemAction,
  updateNavigationItemAction,
} from './actions';

export const dynamic = 'force-dynamic';

type NavigationPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsNavigationItem = {
  id: string;
  section_id: string;
  label: string;
  system_label: string | null;
  command: string | null;
  icon: string | null;
  order_index: number;
  is_visible: boolean;
  is_active: boolean;
};

function normalizeNavigationItem(item: CmsNavigationItem): NavigationItemEditorValue {
  return {
    id: item.id,
    sectionId: item.section_id ?? '',
    label: item.label ?? '',
    systemLabel: item.system_label ?? '',
    command: item.command ?? '',
    icon: item.icon ?? '',
    orderIndex: item.order_index ?? 0,
    isVisible: item.is_visible ?? true,
    isActive: item.is_active ?? true,
  };
}

async function getEditableNavigationItems(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('navigation_items')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsNavigationItem[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeNavigationItem);
}

export default async function NavigationPage({ params }: NavigationPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const items = await getEditableNavigationItems(access.portfolio.id);

    return (
      <AdminShell activeItem="navigation" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <NavigationManager
          initialItems={items}
          portfolio={access.portfolio}
          role={access.member.role}
          createNavigationItem={createNavigationItemAction.bind(null, portfolioSlug)}
          updateNavigationItem={updateNavigationItemAction.bind(null, portfolioSlug)}
          archiveNavigationItem={archiveNavigationItemAction.bind(null, portfolioSlug)}
          restoreNavigationItem={restoreNavigationItemAction.bind(null, portfolioSlug)}
          hideNavigationItem={hideNavigationItemAction.bind(null, portfolioSlug)}
          showNavigationItem={showNavigationItemAction.bind(null, portfolioSlug)}
          reorderNavigationItems={reorderNavigationItemsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
