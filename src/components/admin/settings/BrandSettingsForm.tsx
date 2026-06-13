import { Save } from 'lucide-react';
import type { BrandSettingsEditorValue } from './types';

type BrandSettingsFormProps = {
  brand: BrandSettingsEditorValue;
  disabled: boolean;
  onChange: (brand: BrandSettingsEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

function fieldClassName() {
  return 'w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50';
}

export function BrandSettingsForm({ brand, disabled, onChange, onSave, pending }: BrandSettingsFormProps) {
  const isDisabled = disabled || pending;

  return (
    <section className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Brand Identity</div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="settings-owner-name" className="mb-1.5 block font-mono text-xs text-gray-300">
              Owner name
            </label>
            <input
              id="settings-owner-name"
              type="text"
              value={brand.ownerName}
              onChange={(event) => onChange({ ...brand, ownerName: event.target.value })}
              disabled={isDisabled}
              maxLength={160}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{brand.ownerName.length}/160 characters</p>
          </div>

          <div>
            <label htmlFor="settings-brand-name" className="mb-1.5 block font-mono text-xs text-gray-300">
              Brand name <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="settings-brand-name"
              type="text"
              value={brand.brandName}
              onChange={(event) => onChange({ ...brand, brandName: event.target.value })}
              disabled={isDisabled}
              maxLength={120}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{brand.brandName.length}/120 characters</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="settings-portfolio-title" className="mb-1.5 block font-mono text-xs text-gray-300">
              Portfolio title <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="settings-portfolio-title"
              type="text"
              value={brand.title}
              onChange={(event) => onChange({ ...brand, title: event.target.value })}
              disabled={isDisabled}
              maxLength={160}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{brand.title.length}/160 characters</p>
          </div>

          <div>
            <label htmlFor="settings-app-name" className="mb-1.5 block font-mono text-xs text-gray-300">
              App name
            </label>
            <input
              id="settings-app-name"
              type="text"
              value={brand.appName}
              onChange={(event) => onChange({ ...brand, appName: event.target.value })}
              disabled={isDisabled}
              maxLength={120}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{brand.appName.length}/120 characters</p>
          </div>
        </div>

        <div>
          <label htmlFor="settings-public-url" className="mb-1.5 block font-mono text-xs text-gray-300">
            Public URL
          </label>
          <input
            id="settings-public-url"
            type="url"
            value={brand.publicUrl}
            onChange={(event) => onChange({ ...brand, publicUrl: event.target.value })}
            disabled={isDisabled}
            placeholder="https://example.com"
            className={fieldClassName()}
          />
          <p className="mt-1 font-mono text-[10px] text-gray-500">Optional external portfolio URL</p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
          <input
            type="checkbox"
            checked={brand.isActive}
            onChange={(event) => onChange({ ...brand, isActive: event.target.checked })}
            disabled={isDisabled}
            className="mt-0.5 h-4 w-4 accent-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span>
            <span className="block font-mono text-xs text-gray-300">Active portfolio</span>
            <span className="mt-1 block font-mono text-[10px] text-gray-500">
              Inactive portfolios are removed from public and admin workspace selection.
            </span>
          </span>
        </label>

        <div className="border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled || !brand.brandName.trim() || !brand.title.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving brand...' : 'Save Brand'}
          </button>
        </div>
      </div>
    </section>
  );
}
