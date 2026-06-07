import type { QuickCommand, Section, SectionConfig } from '@/types/portfolio';

type MobileNavigationProps = {
  activeSection: Section;
  quickCommands: QuickCommand[];
  sections: SectionConfig[];
  onQuickCommand: (item: QuickCommand) => void;
  onSectionChange: (section: Section) => void;
};

export function MobileNavigation({
  activeSection,
  quickCommands,
  sections,
  onQuickCommand,
  onSectionChange,
}: MobileNavigationProps) {
  return (
    <div className="md:hidden absolute top-12 left-0 right-0 bg-[#090d16] border-b border-[#00ff88]/20 z-40 shadow-lg">
      <nav className="p-3 grid gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 font-mono text-sm transition-all border ${
              activeSection === section.id
                ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]'
                : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 border-transparent'
            }`}
          >
            {section.label} <span className="text-gray-600">/ {section.module}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {quickCommands.map((item) => (
          <button
            key={item.command}
            onClick={() => onQuickCommand(item)}
            className="font-mono text-[11px] text-cyan-300 border border-cyan-400/20 px-2 py-1 bg-cyan-400/5"
          >
            {item.command}
          </button>
        ))}
      </div>
    </div>
  );
}
