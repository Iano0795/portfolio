import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import type { Portfolio } from '@/types/portfolio';

type AdminTopBarProps = {
  environment: string;
  portfolio: Portfolio;
  userEmail: string;
};

export function AdminTopBar({ environment, portfolio, userEmail }: AdminTopBarProps) {
  return (
    <header className="relative z-10 flex h-12 flex-shrink-0 items-center justify-between border-b border-[#00ff88]/20 bg-[#090d16]/95 px-4 shadow-[0_0_24px_rgba(0,255,136,0.08)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex gap-2" aria-hidden="true">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.45)]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.45)]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.45)]" />
        </div>
        <div className="min-w-0 font-mono">
          <div className="truncate text-sm leading-none text-[#00ff88]">Portfolio Control Center</div>
          <div className="mt-1 hidden truncate text-[10px] text-gray-500 sm:block">
            {portfolio.title} / {userEmail}
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-4 font-mono text-xs md:flex">
        <span className="text-cyan-400">{portfolio.slug}</span>
        <span className="border border-[#00ff88]/30 bg-[#00ff88]/10 px-2 py-1 text-[#00ff88]">CMS MODE</span>
        <span className="flex items-center gap-1.5 text-cyan-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          ONLINE
        </span>
        <span className="text-gray-500">env:{environment}</span>
      </div>

      <Link
        href="/admin/logout"
        className="flex items-center gap-2 border border-cyan-400/30 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88]"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Logout
      </Link>
    </header>
  );
}
