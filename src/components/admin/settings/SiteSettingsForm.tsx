import { Save } from 'lucide-react';
import type { SiteSettingsEditorValue } from './types';

type SiteSettingsFormProps = {
  disabled: boolean;
  onChange: (settings: SiteSettingsEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  settings: SiteSettingsEditorValue;
};

function fieldClassName() {
  return 'w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50';
}

export function SiteSettingsForm({ disabled, onChange, onSave, pending, settings }: SiteSettingsFormProps) {
  const isDisabled = disabled || pending;

  return (
    <section className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Public Messaging</div>

      <div className="space-y-5 p-4">
        <div>
          <label htmlFor="settings-app-title" className="mb-1.5 block font-mono text-xs text-gray-300">
            Public app title <span className="text-[#ff5f56]">*</span>
          </label>
          <input
            id="settings-app-title"
            type="text"
            value={settings.appTitle}
            onChange={(event) => onChange({ ...settings, appTitle: event.target.value })}
            disabled={isDisabled}
            maxLength={160}
            className={fieldClassName()}
          />
          <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.appTitle.length}/160 characters</p>
        </div>

        <div>
          <label htmlFor="settings-tagline" className="mb-1.5 block font-mono text-xs text-gray-300">
            Tagline
          </label>
          <textarea
            id="settings-tagline"
            value={settings.tagline}
            onChange={(event) => onChange({ ...settings, tagline: event.target.value })}
            disabled={isDisabled}
            maxLength={220}
            className={`${fieldClassName()} min-h-20 resize-y`}
          />
          <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.tagline.length}/220 characters</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="settings-status-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Status label
            </label>
            <input
              id="settings-status-label"
              type="text"
              value={settings.statusLabel}
              onChange={(event) => onChange({ ...settings, statusLabel: event.target.value })}
              disabled={isDisabled}
              maxLength={120}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.statusLabel.length}/120 characters</p>
          </div>

          <div>
            <label htmlFor="settings-mode-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Mode label
            </label>
            <input
              id="settings-mode-label"
              type="text"
              value={settings.modeLabel}
              onChange={(event) => onChange({ ...settings, modeLabel: event.target.value })}
              disabled={isDisabled}
              maxLength={120}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.modeLabel.length}/120 characters</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="settings-version-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Version/build label
            </label>
            <input
              id="settings-version-label"
              type="text"
              value={settings.versionLabel}
              onChange={(event) => onChange({ ...settings, versionLabel: event.target.value })}
              disabled={isDisabled}
              maxLength={80}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.versionLabel.length}/80 characters</p>
          </div>

          <div>
            <label htmlFor="settings-availability-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Availability label
            </label>
            <input
              id="settings-availability-label"
              type="text"
              value={settings.availabilityLabel}
              onChange={(event) => onChange({ ...settings, availabilityLabel: event.target.value })}
              disabled={isDisabled}
              maxLength={120}
              className={fieldClassName()}
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.availabilityLabel.length}/120 characters</p>
          </div>
        </div>

        <div>
          <label htmlFor="settings-footer-text" className="mb-1.5 block font-mono text-xs text-gray-300">
            Footer/status text
          </label>
          <textarea
            id="settings-footer-text"
            value={settings.footerText}
            onChange={(event) => onChange({ ...settings, footerText: event.target.value })}
            disabled={isDisabled}
            maxLength={300}
            className={`${fieldClassName()} min-h-24 resize-y`}
          />
          <p className="mt-1 font-mono text-[10px] text-gray-500">{settings.footerText.length}/300 characters</p>
        </div>

        <div className="border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled || !settings.appTitle.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving settings...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </section>
  );
}
