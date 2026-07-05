import { redirect } from 'next/navigation';
import { PortfolioSelector } from '@/components/admin/PortfolioSelector';
import { getUserPortfolios } from '@/lib/auth/portfolio-access';

export const dynamic = 'force-dynamic';

export default async function SelectPortfolioPage() {
  const portfolios = await getUserPortfolios();

  if (portfolios.length === 0) {
    redirect('/admin/login?error=no_portfolios');
  }

  if (portfolios.length === 1) {
    redirect(`/admin/portfolio/${portfolios[0].portfolio.slug}`);
  }

  return <PortfolioSelector portfolios={portfolios} />;
}
