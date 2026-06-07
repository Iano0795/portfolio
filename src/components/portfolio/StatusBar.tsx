import type { SiteConfig } from '@/types/portfolio';

type StatusBarProps = {
  booted: boolean;
  consoleOutput: string;
  site: SiteConfig;
};

export function StatusBar({ booted, consoleOutput, site }: StatusBarProps) {
  return (
    <div
      className={`min-h-8 bg-[#090d16]/95 border-t border-[#00ff88]/20 flex items-center justify-between gap-3 px-4 font-mono text-xs flex-shrink-0 shadow-[0_0_18px_rgba(0,255,136,0.08)] transition-all duration-500 delay-[450ms] ${
        booted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 py-1">
        <span className="text-gray-500">{site.statusBar.stdoutLabel}</span>
        <span className="text-cyan-300 truncate">{consoleOutput}</span>
      </div>
      <div className="hidden sm:flex items-center gap-4 py-1">
        <span className="text-gray-500">{site.statusBar.modeLabel}</span>
        <span className="text-[#00ff88]">{site.statusBar.mode}</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-500">{site.statusBar.availabilityLabel}</span>
        <span className="text-cyan-400">{site.statusBar.availability}</span>
      </div>
    </div>
  );
}
