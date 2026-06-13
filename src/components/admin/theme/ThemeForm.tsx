import { Save } from 'lucide-react';
import { THEME_FONT_MODES } from '@/lib/theme';
import { ColorTokenField } from './ColorTokenField';
import type { ThemeEditorValue } from './types';

type ThemeFormProps = {
  disabled: boolean;
  onChange: (theme: ThemeEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  theme: ThemeEditorValue;
};

function fieldClassName() {
  return 'w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50';
}

export function ThemeForm({ disabled, onChange, onSave, pending, theme }: ThemeFormProps) {
  const isDisabled = disabled || pending;

  return (
    <section className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Theme Tokens</div>

      <div className="space-y-6 p-4">
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase text-gray-400">Colors</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <ColorTokenField disabled={isDisabled} label="Primary accent" value={theme.primary} onChange={(primary) => onChange({ ...theme, primary })} />
            <ColorTokenField disabled={isDisabled} label="Secondary accent" value={theme.secondary} onChange={(secondary) => onChange({ ...theme, secondary })} />
            <ColorTokenField disabled={isDisabled} label="Background" value={theme.background} onChange={(background) => onChange({ ...theme, background })} />
            <ColorTokenField disabled={isDisabled} label="Panel/card" value={theme.panel} onChange={(panel) => onChange({ ...theme, panel })} />
            <ColorTokenField disabled={isDisabled} label="Foreground/text" value={theme.foreground} onChange={(foreground) => onChange({ ...theme, foreground })} />
            <ColorTokenField disabled={isDisabled} label="Muted text" value={theme.muted} onChange={(muted) => onChange({ ...theme, muted })} />
            <ColorTokenField disabled={isDisabled} label="Border" value={theme.border} onChange={(border) => onChange({ ...theme, border })} />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-cyan-400/10 pt-5">
          <legend className="mb-3 font-mono text-xs uppercase text-gray-400">Effects</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-mono text-xs text-gray-300">Glow intensity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={theme.glowIntensity}
                onChange={(event) => onChange({ ...theme, glowIntensity: Number(event.target.value) })}
                disabled={isDisabled}
                className="w-full accent-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="mt-1 block font-mono text-[10px] text-gray-500">{theme.glowIntensity}/100</span>
            </label>

            <label className="block">
              <span className="mb-1.5 block font-mono text-xs text-gray-300">Animation intensity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={theme.animationIntensity}
                onChange={(event) => onChange({ ...theme, animationIntensity: Number(event.target.value) })}
                disabled={isDisabled}
                className="w-full accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="mt-1 block font-mono text-[10px] text-gray-500">{theme.animationIntensity}/100</span>
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={theme.scanlinesEnabled}
              onChange={(event) => onChange({ ...theme, scanlinesEnabled: event.target.checked })}
              disabled={isDisabled}
              className="mt-0.5 h-4 w-4 accent-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Scanlines enabled</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">Controls the public portfolio scanline overlay.</span>
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-4 border-t border-cyan-400/10 pt-5">
          <legend className="mb-3 font-mono text-xs uppercase text-gray-400">Typography</legend>
          <div>
            <label htmlFor="theme-font-mode" className="mb-1.5 block font-mono text-xs text-gray-300">
              Font mode
            </label>
            <select
              id="theme-font-mode"
              value={theme.fontMode}
              onChange={(event) => onChange({ ...theme, fontMode: event.target.value as ThemeEditorValue['fontMode'] })}
              disabled={isDisabled}
              className={fieldClassName()}
            >
              {THEME_FONT_MODES.map((fontMode) => (
                <option key={fontMode} value={fontMode}>
                  {fontMode}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={theme.isActive}
              onChange={(event) => onChange({ ...theme, isActive: event.target.checked })}
              disabled={isDisabled}
              className="mt-0.5 h-4 w-4 accent-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Custom theme active</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Disabled themes fall back to the safe default public tokens.
              </span>
            </span>
          </label>
        </fieldset>

        <div className="border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving theme...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </section>
  );
}
