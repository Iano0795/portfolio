import { redirect } from 'next/navigation';
import { getUserPortfolios } from '@/lib/auth/portfolio-access';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const portfolios = await getUserPortfolios();

  if (portfolios.length === 0) {
    redirect('/admin/login');
  }

  if (portfolios.length === 1) {
    redirect(`/admin/portfolio/${portfolios[0].portfolio.slug}`);
  }

  redirect('/admin/select-portfolio');
}
