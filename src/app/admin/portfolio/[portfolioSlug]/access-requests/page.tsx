import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { AccessRequestsManager } from '@/components/admin/access-requests/AccessRequestsManager';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import { getAccessRequestsForAdmin } from '@/lib/cms/writeup-access';
import {
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccessGrant,
} from './actions';

export const dynamic = 'force-dynamic';

type AccessRequestsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

export default async function AccessRequestsPage({ params }: AccessRequestsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const requests = await getAccessRequestsForAdmin(access.portfolio.id);

    return (
      <AdminShell
        activeItem="access-requests"
        portfolio={access.portfolio}
        user={access.user}
        role={access.member.role}
      >
        <AccessRequestsManager
          initialRequests={requests}
          portfolio={access.portfolio}
          role={access.member.role}
          onApprove={approveAccessRequest.bind(null, portfolioSlug)}
          onReject={rejectAccessRequest.bind(null, portfolioSlug)}
          onRevoke={revokeAccessGrant.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
