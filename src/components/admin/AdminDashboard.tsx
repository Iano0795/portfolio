import { Activity, Database, FileText, Rocket, ShieldCheck, Terminal } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { AdminPlaceholderPanel } from './AdminPlaceholderPanel';
import { AdminStatCard } from './AdminStatCard';

type AdminDashboardSummary = {
  activeProjects: number | null;
  skills: number | null;
  experienceEntries: number | null;
  resumeVersion: string | null;
};

const contentRows = [
  ['profile.editor', 'Profile', 'Locked', 'CRUD pending'],
  ['projects.editor', 'Projects', 'Locked', 'CRUD pending'],
  ['skills.matrix', 'Skills', 'Locked', 'CRUD pending'],
  ['career.timeline', 'Experience', 'Locked', 'CRUD pending'],
  ['contact.links', 'Contact', 'Locked', 'CRUD pending'],
];

type AdminDashboardProps = {
  portfolio: Portfolio;
  role: PortfolioRole;
  summary?: AdminDashboardSummary;
};

function canManage(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export function AdminDashboard({ portfolio, role, summary }: AdminDashboardProps) {
  const manager = canManage(role);
  const metricCards = [
    {
      label: 'Active Projects',
      value: summary?.activeProjects === null || summary?.activeProjects === undefined ? 'Pending' : String(summary.activeProjects),
      detail: 'Portfolio-scoped project records.',
      icon: Rocket,
    },
    {
      label: 'Skills',
      value: summary?.skills === null || summary?.skills === undefined ? 'Pending' : String(summary.skills),
      detail: 'Portfolio-scoped skill entries.',
      icon: Database,
    },
    {
      label: 'Experience Entries',
      value:
        summary?.experienceEntries === null || summary?.experienceEntries === undefined
          ? 'Pending'
          : String(summary.experienceEntries),
      detail: 'Portfolio-scoped timeline records.',
      icon: Activity,
    },
    {
      label: 'Resume Version',
      value: summary?.resumeVersion ?? 'Pending',
      detail: 'Resume asset controls mount in a later task.',
      icon: FileText,
    },
    {
      label: 'Portfolio Status',
      value: portfolio.isActive ? 'Online' : 'Offline',
      detail: `${portfolio.slug} public content remains adapter-driven.`,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
        <div className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
          <div className="mb-3 font-mono text-xs text-cyan-400">dashboard.kernel</div>
          <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">{portfolio.title}</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
            Protected portfolio access is active. Content modules are visible for orientation and remain locked until editor screens are implemented.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
            <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">/{portfolio.slug}</span>
            <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{role}</span>
            <span className="border border-gray-700 px-2 py-1 text-gray-400">{portfolio.brandName ?? portfolio.ownerName}</span>
          </div>
        </div>

        <div className="border border-cyan-400/20 bg-black/25 p-5">
          <div className="mb-4 flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            control.terminal
          </div>
          <div className="space-y-2 font-mono text-xs text-gray-400">
            <div>
              <span className="text-[#00ff88]">$</span> auth.verify_admin
            </div>
            <div className="text-cyan-300">membership confirmed via portfolio_members</div>
            <div>
              <span className="text-[#00ff88]">$</span> mount {portfolio.slug}.dashboard
            </div>
            <div className="text-cyan-300">dashboard shell online</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((card) => (
          <AdminStatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="border border-cyan-400/20 bg-[#090d16]/80">
          <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Content Management</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left font-mono text-xs">
              <thead className="border-b border-gray-800 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Surface</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Next</th>
                </tr>
              </thead>
              <tbody>
                {contentRows.map(([module, surface, state, next]) => (
                  <tr key={module} className="border-b border-gray-900 last:border-0">
                    <td className="px-4 py-3 text-cyan-300">/{module}</td>
                    <td className="px-4 py-3 text-gray-300">{surface}</td>
                    <td className="px-4 py-3 text-gray-500">{state}</td>
                    <td className="px-4 py-3 text-[#00ff88]">{next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6">
          <AdminPlaceholderPanel title="Recent Activity" tone="green">
            <div className="space-y-3 font-mono text-xs text-gray-500">
              <div>admin.session.created</div>
              <div>{portfolio.slug}.dashboard.shell.mounted</div>
              <div>content.modules.locked</div>
            </div>
          </AdminPlaceholderPanel>

          <AdminPlaceholderPanel title="Publish Controls">
            <button
              type="button"
              disabled={!manager}
              className={`w-full border px-3 py-2 font-mono text-xs ${
                manager
                  ? 'border-[#00ff88]/35 text-[#00ff88] hover:bg-[#00ff88]/10'
                  : 'cursor-not-allowed border-gray-700 text-gray-600'
              }`}
            >
              {manager ? 'Publish controls staged' : 'Publish controls locked'}
            </button>
          </AdminPlaceholderPanel>
        </div>
      </section>
    </div>
  );
}
