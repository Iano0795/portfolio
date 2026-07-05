import type { ThemeConfig } from '@/types/portfolio';

type ThemePresetSelectorProps = {
  disabled: boolean;
  onSelect: (preset: ThemeConfig) => void;
  presets: ThemeConfig[];
  selectedPresetName: string;
};

export function ThemePresetSelector({ disabled, onSelect, presets, selectedPresetName }: ThemePresetSelectorProps) {
  return (
    <section className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Preset</div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        {presets.map((preset) => {
          const selected = preset.presetName === selectedPresetName;

          return (
            <button
              key={preset.presetName}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(preset)}
              className={`border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? 'border-[#00ff88]/45 bg-[#00ff88]/10 shadow-[0_0_18px_rgba(0,255,136,0.12)]'
                  : 'border-cyan-400/15 bg-[#050812]/50 hover:border-cyan-400/35'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className={`font-mono text-sm ${selected ? 'text-[#00ff88]' : 'text-gray-200'}`}>{preset.presetName}</span>
                {selected && <span className="font-mono text-[10px] text-cyan-300">SELECTED</span>}
              </div>
              <div className="flex gap-1.5" aria-hidden="true">
                {[preset.primary, preset.secondary, preset.background, preset.panel].map((color) => (
                  <span key={color} className="h-5 flex-1 border border-white/10" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="mt-3 font-mono text-[10px] text-gray-500">
                glow {preset.glowIntensity}% / motion {preset.animationIntensity}% / {preset.fontMode}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
