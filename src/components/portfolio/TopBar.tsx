import type { SiteConfig } from '@/types/portfolio';

type TopBarProps = {
  activeModule: string;
  booted: boolean;
  mobileMenuOpen: boolean;
  site: SiteConfig;
  onToggleMobileMenu: () => void;
};

export function TopBar({ activeModule, booted, mobileMenuOpen, site, onToggleMobileMenu }: TopBarProps) {
  return (
    <div
      className={`h-12 bg-[#090d16]/95 border-b border-[#00ff88]/20 flex items-center justify-between px-4 flex-shrink-0 shadow-[0_0_24px_rgba(0,255,136,0.08)] transition-all duration-500 ${
        booted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.45)]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.45)]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.45)]" />
        </div>
        <div className="font-mono">
          <div className="text-sm text-[#00ff88] leading-none">{site.brandName}</div>
          <div className="text-[10px] text-gray-500 hidden sm:block">{site.appTitle}</div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 font-mono text-xs">
        <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">{site.status}</span>
        <span className="text-gray-500">{site.version}</span>
        <span className="text-cyan-400">{site.modulePrefix} {activeModule}</span>
      </div>

      <button
        className="md:hidden text-[#00ff88] font-mono text-sm border border-[#00ff88]/30 px-3 py-1"
        onClick={onToggleMobileMenu}
      >
        {mobileMenuOpen ? site.mobileCloseLabel : site.mobileMenuLabel}
      </button>
    </div>
  );
}
