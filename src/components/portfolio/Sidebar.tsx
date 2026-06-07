import type { QuickCommand, Section, SectionConfig } from '@/types/portfolio';

type SidebarProps = {
  activeSection: Section;
  booted: boolean;
  quickCommands: QuickCommand[];
  sections: SectionConfig[];
  onQuickCommand: (item: QuickCommand) => void;
  onSectionChange: (section: Section) => void;
};

export function Sidebar({ activeSection, booted, quickCommands, sections, onQuickCommand, onSectionChange }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex w-72 bg-[#090d16]/95 border-r border-[#00ff88]/20 flex-col shadow-[0_0_20px_rgba(0,255,136,0.04)] transition-all duration-500 delay-150 ${
        booted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="p-3 border-b border-[#00ff88]/10">
        <div className="font-mono text-xs text-gray-500 mb-2">/SYSTEM MODULES</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          Switch modules from requirement to secure platform delivery.
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sections.map((section, index) => {
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-3 py-2 font-mono text-sm transition-all duration-200 group border ${
                active
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/45 text-[#00ff88] shadow-[inset_3px_0_0_#00ff88,0_0_16px_rgba(0,255,136,0.12)]'
                  : 'text-gray-400 bg-[#050812]/30 border-transparent hover:text-[#00ff88] hover:bg-[#00ff88]/5 hover:border-[#00ff88]/20'
              }`}
            >
              <span className="flex items-start gap-3">
                <span className={active ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] leading-tight">{section.label}</span>
                  <span className={`block text-[11px] leading-tight mt-1 ${active ? 'text-cyan-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    /{section.module}
                  </span>
                </span>
                {active && <span className="ml-auto text-[10px] text-[#00ff88]">RUN</span>}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="m-3 border border-cyan-400/20 bg-[#050812]/70">
        <div className="flex items-center justify-between border-b border-cyan-400/10 px-3 py-2 font-mono text-[11px]">
          <span className="text-cyan-400">command.palette</span>
          <span className="text-gray-600">visible actions</span>
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
