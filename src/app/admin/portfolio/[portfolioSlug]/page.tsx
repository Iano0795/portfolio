import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminShell } from '@/components/admin/AdminShell';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import { getActiveResume, getExperience, getProjects, getSkills } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

type AdminPortfolioPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

async function getDashboardSummary(portfolioSlug: string) {
  try {
    const [projects, skills, experience, resume] = await Promise.all([
      getProjects({ portfolioSlug }),
      getSkills({ portfolioSlug }),
      getExperience({ portfolioSlug }),
      getActiveResume({ portfolioSlug }),
    ]);

    return {
      activeProjects: projects.length,
      skills: skills.length,
      experienceEntries: experience.length,
      resumeVersion: resume?.version_label ?? null,
    };
  } catch {
    return {
      activeProjects: null,
      skills: null,
      experienceEntries: null,
      resumeVersion: null,
    };
  }
}

export default async function AdminPortfolioPage({ params }: AdminPortfolioPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const summary = await getDashboardSummary(portfolioSlug);

    return (
      <AdminShell portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <AdminDashboard portfolio={access.portfolio} role={access.member.role} summary={summary} />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
