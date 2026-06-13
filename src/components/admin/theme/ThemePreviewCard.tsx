import type { ThemeEditorValue } from './types';

type ThemePreviewCardProps = {
  theme: ThemeEditorValue;
};

function previewFontFamily(fontMode: ThemeEditorValue['fontMode']) {
  switch (fontMode) {
    case 'system':
      return 'ui-sans-serif, system-ui, sans-serif';
    case 'readable':
      return 'var(--font-display), ui-sans-serif, system-ui, sans-serif';
    case 'mono':
      return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    case 'retro':
    default:
      return 'var(--font-terminal), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  }
}

export function ThemePreviewCard({ theme }: ThemePreviewCardProps) {
  const glowAlpha = theme.glowIntensity / 100;

  return (
    <aside className="border border-[#00ff88]/25 bg-[#090d16]/80 shadow-[0_0_30px_rgba(0,255,136,0.06)]">
      <div className="border-b border-[#00ff88]/10 px-4 py-3 font-mono text-xs text-[#00ff88]">Live Preview</div>

      <div className="p-5">
        <div
          className="relative overflow-hidden border p-4"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.foreground,
            fontFamily: previewFontFamily(theme.fontMode),
            boxShadow: `0 0 ${Math.round(28 * glowAlpha)}px color-mix(in srgb, ${theme.primary} ${Math.round(35 * glowAlpha)}%, transparent)`,
          }}
        >
          {theme.scanlinesEnabled && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${theme.primary} 3px, ${theme.primary} 4px)`,
                opacity: Math.max(0.02, glowAlpha * 0.08),
              }}
            />
          )}

          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.border }}>
              <div>
                <div className="font-mono text-[10px]" style={{ color: theme.secondary }}>
                  /theme.preview
                </div>
                <h2 className="text-xl font-bold leading-tight" style={{ color: theme.foreground }}>
                  Sample heading
                </h2>
              </div>
              <span className="border px-2 py-1 font-mono text-[10px]" style={{ borderColor: theme.primary, color: theme.primary }}>
                ACTIVE
              </span>
            </div>

            <div className="border p-3" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
              <p className="mb-3 text-sm leading-relaxed" style={{ color: theme.muted }}>
                Sample body text renders against the configured background, panel, border, and muted text tokens.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="border px-3 py-2 font-mono text-xs"
                  style={{
                    borderColor: theme.primary,
                    color: theme.primary,
                    boxShadow: `0 0 ${Math.round(16 * glowAlpha)}px color-mix(in srgb, ${theme.primary} ${Math.round(40 * glowAlpha)}%, transparent)`,
                  }}
                >
                  sample button
                </button>
                <span className="border px-3 py-2 font-mono text-xs" style={{ borderColor: theme.secondary, color: theme.secondary }}>
                  status chip
                </span>
              </div>
            </div>

            <div className="border p-3 font-mono text-xs" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
              <div className="mb-2" style={{ color: theme.secondary }}>
                navigation.item
              </div>
              <div className="border px-3 py-2" style={{ borderColor: theme.primary, color: theme.primary }}>
                /profile <span style={{ color: theme.muted }}>RUN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 font-mono text-[10px] text-gray-500 sm:grid-cols-2">
          <span>preset: {theme.presetName}</span>
          <span>font: {theme.fontMode}</span>
          <span>glow: {theme.glowIntensity}%</span>
          <span>motion: {theme.animationIntensity}%</span>
        </div>
      </div>
    </aside>
  );
}
