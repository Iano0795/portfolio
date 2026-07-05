'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_THEME_CONFIG, THEME_PRESETS, normalizeThemeConfig } from '@/lib/theme';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ThemeForm } from './ThemeForm';
import { ThemePresetSelector } from './ThemePresetSelector';
import { ThemePreviewCard } from './ThemePreviewCard';
import { ThemeStatusBadge } from './ThemeStatusBadge';
import type { ThemeEditorValue, ThemeMutationResult } from './types';

type ThemeManagerProps = {
  initialTheme: ThemeEditorValue;
  portfolio: Portfolio;
  resetThemeSettingsToDefault: () => Promise<ThemeMutationResult>;
  role: PortfolioRole;
  updateThemeSettings: (payload: ThemeEditorValue) => Promise<ThemeMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export function ThemeManager({
  initialTheme,
  portfolio,
  resetThemeSettingsToDefault,
  role,
  updateThemeSettings,
}: ThemeManagerProps) {
  const router = useRouter();
  const readOnly = !canSave(role);
  const [theme, setTheme] = useState(() => normalizeThemeConfig(initialTheme));
  const [message, setMessage] = useState<ThemeMutationResult>({});
  const [pending, setPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);

  useEffect(() => {
    setTheme(normalizeThemeConfig(initialTheme));
  }, [initialTheme]);

  const finishMutation = (result: ThemeMutationResult) => {
    setMessage(result);

    if (result.success) {
      router.refresh();
    }
  };

  const handleSave = async () => {
    if (readOnly || pending) {
      return;
    }

    setPending(true);
    setMessage({});

    try {
      finishMutation(await updateThemeSettings(theme));
    } finally {
      setPending(false);
    }
  };

  const handleReset = async () => {
    if (readOnly || resetPending) {
      return;
    }

    setResetPending(true);
    setMessage({});

    try {
      const result = await resetThemeSettingsToDefault();
      finishMutation(result);

      if (result.success) {
        setTheme(DEFAULT_THEME_CONFIG);
      }
    } finally {
      setResetPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ThemeStatusBadge label="theme.manager" />
          <ThemeStatusBadge label={portfolio.title} tone="green" />
          <ThemeStatusBadge label={role} />
          {readOnly && <ThemeStatusBadge label="Read-only access" tone="yellow" />}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Theme Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage portfolio colors, effects, and visual theme tokens.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={readOnly || resetPending}
            className="inline-flex items-center gap-2 border border-cyan-400/30 px-4 py-2.5 font-mono text-sm text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {resetPending ? 'Resetting...' : 'Reset Default'}
          </button>
        </div>
      </header>

      {message.error && (
        <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
          {message.error}
        </div>
      )}
      {message.success && (
        <div className="border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
          {message.success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <ThemePresetSelector
            disabled={readOnly || pending || resetPending}
            onSelect={(preset) => {
              setMessage({});
              setTheme(normalizeThemeConfig(preset));
            }}
            presets={THEME_PRESETS}
            selectedPresetName={theme.presetName}
          />

          <ThemeForm
            disabled={readOnly}
            onChange={setTheme}
            onSave={handleSave}
            pending={pending}
            theme={theme}
          />

          {readOnly && (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 text-center font-mono text-xs text-gray-500">
              Read-only access: You can review theme tokens but cannot save changes.
            </div>
          )}
        </div>

        <ThemePreviewCard theme={theme} />
      </div>
    </div>
  );
}
