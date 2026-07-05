import Link from 'next/link';
import { ExternalLink, FolderKanban, ShieldCheck } from 'lucide-react';
import type { UserPortfolioAccess } from '@/lib/auth/portfolio-access';

type PortfolioSelectorProps = {
  portfolios: UserPortfolioAccess[];
};

export function PortfolioSelector({ portfolios }: PortfolioSelectorProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050812] px-4 py-8 text-gray-200 selection:bg-[#00ff88]/20 selection:text-[#eafff5]">
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

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <div className="mb-5 border border-[#00ff88]/25 bg-[#090d16]/85 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)]">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-cyan-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            workspace.selector
          </div>
          <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">Select a portfolio workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            Your account has access to multiple portfolio control centers. Choose the workspace to manage.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {portfolios.map(({ portfolio, member }) => (
            <article key={portfolio.id} className="border border-cyan-400/20 bg-[#090d16]/85 p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 font-mono text-xs text-cyan-400">/{portfolio.slug}</div>
                  <h2 className="text-2xl font-semibold text-white">{portfolio.title}</h2>
                </div>
                <FolderKanban className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
              </div>

              <dl className="mb-5 grid gap-3 font-mono text-xs">
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <dt className="text-gray-600">OWNER</dt>
                  <dd className="text-gray-300">{portfolio.ownerName}</dd>
                </div>
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <dt className="text-gray-600">BRAND</dt>
                  <dd className="text-cyan-300">{portfolio.brandName ?? 'not set'}</dd>
                </div>
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <dt className="text-gray-600">ROLE</dt>
                  <dd className="text-[#00ff88]">{member.role}</dd>
                </div>
                {portfolio.publicUrl && (
                  <div className="grid grid-cols-[96px_1fr] gap-3">
                    <dt className="text-gray-600">PUBLIC</dt>
                    <dd>
                      <a
                        href={portfolio.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-300 hover:text-[#00ff88]"
                      >
                        {portfolio.publicUrl}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <Link
                href={`/admin/portfolio/${portfolio.slug}`}
                className="inline-flex w-full items-center justify-center border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-3 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18"
              >
                Open Control Center
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
