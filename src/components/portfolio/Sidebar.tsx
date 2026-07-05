import { Award, Briefcase, Cpu, FileText, FolderGit2, GitBranch, Network, Send, Shield, UserRound, type LucideIcon } from 'lucide-react';
import type { NavigationItem, QuickCommand, SectionId, SiteConfig } from '@/types/portfolio';

const navigationIcons: Record<NavigationItem['icon'], LucideIcon> = {
  user: UserRound,
  'file-text': FileText,
  network: Network,
  shield: Shield,
  award: Award,
  cpu: Cpu,
  'folder-git': FolderGit2,
  'git-branch': GitBranch,
  briefcase: Briefcase,
  send: Send,
};

type SidebarProps = {
  activeSection: SectionId;
  booted: boolean;
  quickCommands: QuickCommand[];
  sections: NavigationItem[];
  site: SiteConfig;
  onQuickCommand: (item: QuickCommand) => void;
  onSectionChange: (section: SectionId) => void;
};

export function Sidebar({ activeSection, booted, quickCommands, sections, site, onQuickCommand, onSectionChange }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex w-72 bg-[#090d16]/95 border-r border-[#00ff88]/20 flex-col shadow-[0_0_20px_rgba(0,255,136,0.04)] transition-all duration-500 delay-150 ${
        booted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="p-3 border-b border-[#00ff88]/10">
        <div className="font-mono text-xs text-gray-500 mb-2">{site.sidebar.title}</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          {site.sidebar.description}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sections.map((section) => {
          const active = activeSection === section.id;
          const Icon = navigationIcons[section.icon];
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-3 py-2.5 font-mono text-sm transition-all duration-200 group border ${
                active
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/45 text-[#00ff88] shadow-[inset_3px_0_0_#00ff88,0_0_16px_rgba(0,255,136,0.12)]'
                  : 'text-gray-400 bg-[#050812]/30 border-transparent hover:text-[#00ff88] hover:bg-[#00ff88]/5 hover:border-[#00ff88]/20'
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center transition-all duration-200 ${
                    active
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,217,255,0.55)]'
                      : 'text-gray-600 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_6px_rgba(0,217,255,0.35)]'
                  }`}
                  aria-hidden="true"
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] leading-snug">{section.label}</span>
                  <span className={`block text-[11px] leading-snug mt-1 tracking-[0.02em] ${active ? 'text-cyan-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    /{section.module}
                  </span>
                </span>
                {active && <span className="ml-auto text-[10px] text-[#00ff88]">{site.sidebar.activeLabel}</span>}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="m-3 border border-cyan-400/20 bg-[#050812]/70">
        <div className="flex items-center justify-between border-b border-cyan-400/10 px-3 py-2 font-mono text-[11px]">
          <span className="text-cyan-400">{site.sidebar.commandPaletteTitle}</span>
          <span className="text-gray-600">{site.sidebar.commandPaletteMeta}</span>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1">
          {quickCommands.map((item) => (
            <button
              key={item.command}
              onClick={() => onQuickCommand(item)}
              className="font-mono text-left text-[11px] text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 px-2 py-1.5 border border-transparent hover:border-[#00ff88]/20 transition-colors"
            >
              <span className="text-cyan-500">$</span> {item.command}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
