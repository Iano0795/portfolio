import type { ReactNode } from 'react';
import type { SectionConfig } from '@/types/portfolio';
import { CommandLine } from './CommandLine';

type MainPanelProps = {
  activeConfig: SectionConfig;
  booted: boolean;
  children: ReactNode;
  loadingModule: boolean;
  transitioning: boolean;
};

export function MainPanel({ activeConfig, booted, children, loadingModule, transitioning }: MainPanelProps) {
  return (
    <main
      className={`min-w-0 flex-1 flex flex-col overflow-hidden transition-all duration-500 delay-300 ${
        booted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <CommandLine command={activeConfig.command} />

      <div className="flex-1 overflow-y-auto p-4 md:p-7 relative">
        {loadingModule && (
          <div className="absolute inset-0 flex items-start justify-center pt-20 bg-[#050812]/82 backdrop-blur-sm z-40">
            <div className="font-mono text-sm text-[#00ff88] border border-[#00ff88]/25 bg-[#050812] px-5 py-4 shadow-[0_0_24px_rgba(0,255,136,0.12)]">
              Loading {activeConfig.module}... <span className="animate-pulse">[OK]</span>
            </div>
          </div>
        )}

        <div
          className={`transition-all duration-300 ${
            transitioning ? 'opacity-0 translate-y-3 blur-sm' : 'opacity-100 translate-y-0 blur-0'
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
