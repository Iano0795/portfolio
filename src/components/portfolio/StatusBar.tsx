import type { SiteConfig } from '@/types/portfolio';
import { CommandConsole } from './CommandConsole';

type StatusBarProps = {
  booted: boolean;
  consoleOutput: string;
  site: SiteConfig;
  onSubmitCommand: (command: string) => string[];
};

export function StatusBar({ booted, consoleOutput, site, onSubmitCommand }: StatusBarProps) {
  return (
    <div
      className={`min-h-10 bg-[#090d16]/95 border-t border-[#00ff88]/20 px-4 font-mono text-xs flex-shrink-0 shadow-[0_0_18px_rgba(0,255,136,0.08)] transition-all duration-500 delay-[450ms] ${
        booted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <CommandConsole
        consoleOutput={consoleOutput}
        mode={site.statusBar.mode}
        modeLabel={site.statusBar.modeLabel}
        availability={site.statusBar.availability}
        availabilityLabel={site.statusBar.availabilityLabel}
        onSubmitCommand={onSubmitCommand}
      />
    </div>
  );
}
