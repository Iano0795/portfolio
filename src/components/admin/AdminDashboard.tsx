import { Activity, Database, FileText, Rocket, ShieldCheck, Terminal } from 'lucide-react';

const metricCards = [
  { label: 'Active Projects', value: 'CMS-ready', detail: 'Project records wired for protected editing.', icon: Rocket },
  { label: 'Skills', value: 'Grouped', detail: 'Skill matrix schema is available.', icon: Database },
  { label: 'Experience Entries', value: 'Timeline', detail: 'Career entries are staged for CRUD.', icon: Activity },
  { label: 'Resume Version', value: 'Pending', detail: 'Asset controls will mount in a later task.', icon: FileText },
  { label: 'Portfolio Status', value: 'Online', detail: 'Public rendering remains adapter-driven.', icon: ShieldCheck },
];

const contentRows = [
  ['profile.editor', 'Profile', 'Locked', 'CRUD pending'],
  ['projects.editor', 'Projects', 'Locked', 'CRUD pending'],
  ['skills.matrix', 'Skills', 'Locked', 'CRUD pending'],
  ['resume.asset', 'Resume', 'Locked', 'Upload pending'],
];

export function AdminDashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
        <div className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
          <div className="mb-3 font-mono text-xs text-cyan-400">dashboard.kernel</div>
          <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">IanOS CMS command surface</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
            Protected admin access is active. Content modules are visible for orientation and remain locked until editor screens are implemented.
          </p>
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
            <div className="text-cyan-300">admin row confirmed via public.admins</div>
            <div>
              <span className="text-[#00ff88]">$</span> mount dashboard
            </div>
            <div className="text-cyan-300">dashboard shell online</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.label} className="border border-gray-700 bg-[#090d16]/80 p-4 transition-colors hover:border-[#00ff88]/35">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="font-mono text-xs text-gray-500">{card.label}</div>
                <Icon className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              </div>
              <div className="mb-2 text-xl font-semibold text-white">{card.value}</div>
              <p className="text-xs leading-relaxed text-gray-500">{card.detail}</p>
            </article>
          );
        })}
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
          <aside className="border border-[#00ff88]/20 bg-black/25 p-4">
            <div className="mb-3 font-mono text-xs text-[#00ff88]">Recent Activity</div>
            <div className="space-y-3 font-mono text-xs text-gray-500">
              <div>admin.session.created</div>
              <div>dashboard.shell.mounted</div>
              <div>content.modules.locked</div>
            </div>
          </aside>

          <aside className="border border-cyan-400/20 bg-black/25 p-4">
            <div className="mb-3 font-mono text-xs text-cyan-400">Publish Controls</div>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed border border-gray-700 px-3 py-2 font-mono text-xs text-gray-600"
            >
              Publish pipeline locked
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
