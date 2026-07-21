import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { ADMIN_ACCESS_DENIED_MESSAGE, ADMIN_SESSION_EXPIRED_MESSAGE } from '@/lib/auth/constants';
import { getUserPortfolios } from '@/lib/auth/portfolio-access';

export const dynamic = 'force-dynamic';

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const portfolios = await getUserPortfolios();

  if (portfolios.length === 1) {
    redirect(`/admin/portfolio/${portfolios[0].portfolio.slug}`);
  }

  if (portfolios.length > 1) {
    redirect('/admin/select-portfolio');
  }

  const params = await searchParams;
  const initialError =
    params.error === 'access_denied' || params.error === 'no_portfolios'
      ? ADMIN_ACCESS_DENIED_MESSAGE
      : params.error === 'session_expired'
        ? ADMIN_SESSION_EXPIRED_MESSAGE
        : undefined;

  return <AdminLoginForm initialError={initialError} />;
}
