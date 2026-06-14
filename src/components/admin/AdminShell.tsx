import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { AdminSidebar } from './AdminSidebar';
import { AdminStatusBar } from './AdminStatusBar';
import { AdminTopBar } from './AdminTopBar';

type AdminShellProps = {
  activeItem?:
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
    | 'theme'
    | 'writeups';
  portfolio: Portfolio;
  user: User;
  role: PortfolioRole;
  children: ReactNode;
};

export function AdminShell({ activeItem = 'dashboard', portfolio, user, role, children }: AdminShellProps) {
  const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local';

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#050812] text-gray-200 selection:bg-[#00ff88]/20 selection:text-[#eafff5]">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-30 animate-scanline"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] animate-grid-move"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00d9ff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <AdminTopBar environment={environment} portfolio={portfolio} userEmail={user.email ?? 'unknown'} />

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <AdminSidebar activeItem={activeItem} portfolioSlug={portfolio.slug} />
        <section className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</section>
      </div>

      <AdminStatusBar environment={environment} portfolioSlug={portfolio.slug} role={role} />
    </main>
  );
}
