import {
  Briefcase,
  Contact,
  Cpu,
  Award,
  FileText,
  FolderGit2,
  Gauge,
  Image,
  Map,
  Network,
  Palette,
  Route,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', module: 'control.index', icon: Gauge, href: '' },
  { id: 'profile', label: 'Profile', module: 'profile.editor', icon: UserRound, href: '/profile' },
  { id: 'projects', label: 'Projects', module: 'projects.editor', icon: FolderGit2, href: '/projects' },
  { id: 'credentials', label: 'Credentials', module: 'credentials.vault', icon: Award, href: '/credentials' },
  { id: 'skills', label: 'Skills', module: 'skills.matrix', icon: Cpu, href: '/skills' },
  { id: 'experience', label: 'Experience', module: 'career.timeline', icon: Briefcase, href: '/experience' },
  { id: 'contact', label: 'Contact', module: 'contact.links', icon: Contact, href: '/contact' },
  { id: 'capabilities', label: 'Capabilities', module: 'capabilities.map', icon: Network, href: '/capabilities' },
  { id: 'process', label: 'Process', module: 'process.pipeline', icon: Route, href: '/process' },
  { id: 'resume', label: 'Resume', module: 'resume.asset', icon: FileText, href: '/resume' },
  { id: 'navigation', label: 'Navigation', module: 'nav.registry', icon: Map, href: '/navigation' },
  { id: 'settings', label: 'Settings', module: 'system.settings', icon: Settings, href: '/settings' },
  { id: 'theme', label: 'Theme', module: 'theme.tokens', icon: Palette, href: '/theme' },
  { label: 'Media Library', module: 'media.vault', icon: Image },
];

type AdminSidebarProps = {
  activeItem:
    | 'dashboard'
    | 'profile'
    | 'projects'
    | 'credentials'
    | 'skills'
    | 'experience'
    | 'contact'
    | 'capabilities'
    | 'process'
    | 'resume'
    | 'navigation'
    | 'settings'
    | 'theme';
  portfolioSlug: string;
};

export function AdminSidebar({ activeItem, portfolioSlug }: AdminSidebarProps) {
  return (
    <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-[#00ff88]/20 bg-[#090d16]/95 shadow-[0_0_20px_rgba(0,255,136,0.04)] md:flex">
      <div className="border-b border-[#00ff88]/10 p-3">
        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          admin.modules
        </div>
        <div className="text-xs leading-relaxed text-gray-400">CMS control surfaces are staged. Dashboard telemetry is active.</div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeItem;
          const href = 'href' in item ? `/admin/portfolio/${portfolioSlug}${item.href}` : null;

          if (href) {
            return (
              <a
                key={item.label}
                href={href}
                className={`group block border px-3 py-2.5 font-mono text-sm transition-all ${
                  active
                    ? 'border-[#00ff88]/45 bg-[#00ff88]/10 text-[#00ff88] shadow-[inset_3px_0_0_#00ff88,0_0_16px_rgba(0,255,136,0.12)]'
                    : 'border-transparent bg-[#050812]/25 text-gray-400 hover:border-cyan-400/20 hover:text-cyan-300'
                }`}
              >
                <span className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-4 w-4 ${
                      active ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,217,255,0.55)]' : 'text-gray-600 group-hover:text-cyan-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug">{item.label}</span>
                    <span className={`mt-1 block text-[11px] leading-snug ${active ? 'text-cyan-300' : 'text-gray-600'}`}>/{item.module}</span>
                  </span>
                  {active && <span className="ml-auto text-[10px] text-[#00ff88]">ACTIVE</span>}
                </span>
              </a>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              disabled
              className="block w-full cursor-not-allowed border border-transparent bg-[#050812]/25 px-3 py-2.5 text-left font-mono text-sm text-gray-600"
            >
              <span className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 text-gray-700" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[13px] leading-snug">{item.label}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-gray-700">/{item.module}</span>
                </span>
                <span className="ml-auto text-[10px] text-gray-700">LOCKED</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
