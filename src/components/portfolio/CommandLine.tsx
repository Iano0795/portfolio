import type { SiteConfig } from '@/types/portfolio';

type CommandLineProps = {
  command: string;
  site: SiteConfig;
};

export function CommandLine({ command, site }: CommandLineProps) {
  return (
    <div className="h-11 flex items-center justify-between px-4 md:px-6 border-b border-[#00ff88]/10 bg-[#070b13]/70 font-mono text-xs flex-shrink-0">
      <div className="text-gray-500 truncate">
        <span className="text-[#00ff88]">{site.commandPrompt.userHost}</span>:<span className="text-cyan-400">{site.commandPrompt.path}</span>$ {command}
      </div>
      <div className="hidden sm:flex items-center gap-2 text-gray-600">
        <span>{site.commandPrompt.status}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
      </div>
    </div>
  );
}
