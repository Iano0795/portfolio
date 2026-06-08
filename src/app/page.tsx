import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { getPortfolioData } from '@/lib/cms/adapter';

export default async function Page() {
  const portfolioData = await getPortfolioData();

  return <PortfolioShell portfolioData={portfolioData} />;
}
