import { ExternalLink } from 'lucide-react';
import type { BrandSettingsEditorValue, SiteSettingsEditorValue } from './types';
import { SettingsStatusBadge } from './SettingsStatusBadge';

type SiteSettingsPreviewCardProps = {
  brand: BrandSettingsEditorValue;
  settings: SiteSettingsEditorValue;
};

function fallback(value: string, label: string) {
  return value.trim() || label;
}

export function SiteSettingsPreviewCard({ brand, settings }: SiteSettingsPreviewCardProps) {
  const publicUrl = brand.publicUrl.trim();

  return (
    <aside className="border border-[#00ff88]/25 bg-[#090d16]/80 shadow-[0_0_30px_rgba(0,255,136,0.06)]">
      <div className="border-b border-[#00ff88]/10 px-4 py-3 font-mono text-xs text-[#00ff88]">Brand Preview</div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="font-mono text-xs text-cyan-400">{fallback(brand.brandName, 'Brand name')}</div>
          <h2 className="text-2xl font-bold leading-tight text-white">{fallback(brand.title, 'Portfolio title')}</h2>
          <p className="text-sm leading-relaxed text-gray-400">{fallback(settings.tagline, 'Tagline preview will render here.')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SettingsStatusBadge label={fallback(settings.statusLabel, 'ONLINE')} tone="green" />
          <SettingsStatusBadge label={fallback(settings.availabilityLabel, 'Availability')} />
          <SettingsStatusBadge label={fallback(settings.versionLabel, 'Version')} tone="yellow" />
          <SettingsStatusBadge label={brand.isActive ? 'Active portfolio' : 'Inactive portfolio'} tone={brand.isActive ? 'green' : 'red'} />
        </div>

        <div className="border border-cyan-400/10 bg-[#050812]/60 p-3">
          <div className="mb-2 font-mono text-[10px] uppercase text-gray-500">Public chrome</div>
          <div className="flex items-center justify-between gap-4 font-mono text-xs">
            <span className="text-[#00ff88]">{fallback(brand.brandName, 'Brand')}</span>
            <span className="text-gray-500">{fallback(settings.appTitle, 'App title')}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="text-cyan-300">{fallback(settings.modeLabel, 'Mode')}</span>
            <span className="text-[#00ff88]">{fallback(settings.statusLabel, 'Status')}</span>
          </div>
        </div>

        <div>
          <div className="mb-1 font-mono text-[10px] uppercase text-gray-500">Footer/status text</div>
          <p className="font-mono text-xs leading-relaxed text-gray-300">{fallback(settings.footerText, 'Footer status text preview.')}</p>
        </div>

        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 border border-cyan-400/25 px-3 py-2 font-mono text-xs text-cyan-300 transition-colors hover:border-[#00ff88]/40 hover:text-[#00ff88]"
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{publicUrl}</span>
          </a>
        )}
      </div>
    </aside>
  );
}
