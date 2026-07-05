import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ContactManager } from '@/components/admin/contact/ContactManager';
import type { ContactLinkEditorValue } from '@/components/admin/contact/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveContactLinkAction,
  createContactLinkAction,
  reorderContactLinksAction,
  restoreContactLinkAction,
  updateContactLinkAction,
} from './actions';

export const dynamic = 'force-dynamic';

type ContactPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsContactLink = {
  id: string;
  label: string;
  type: string | null;
  url: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
};

function normalizeContactLink(link: CmsContactLink): ContactLinkEditorValue {
  return {
    id: link.id,
    label: link.label ?? '',
    type: link.type ?? '',
    url: link.url ?? '',
    icon: link.icon ?? '',
    orderIndex: link.order_index ?? 0,
    isActive: link.is_active ?? true,
  };
}

async function getEditableContactLinks(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('contact_links')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsContactLink[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeContactLink);
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const contactLinks = await getEditableContactLinks(access.portfolio.id);

    return (
      <AdminShell activeItem="contact" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ContactManager
          initialContactLinks={contactLinks}
          portfolio={access.portfolio}
          role={access.member.role}
          createContactLink={createContactLinkAction.bind(null, portfolioSlug)}
          updateContactLink={updateContactLinkAction.bind(null, portfolioSlug)}
          archiveContactLink={archiveContactLinkAction.bind(null, portfolioSlug)}
          restoreContactLink={restoreContactLinkAction.bind(null, portfolioSlug)}
          reorderContactLinks={reorderContactLinksAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
