'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { BrandSettingsForm } from './BrandSettingsForm';
import { SettingsStatusBadge } from './SettingsStatusBadge';
import { SiteSettingsForm } from './SiteSettingsForm';
import { SiteSettingsPreviewCard } from './SiteSettingsPreviewCard';
import type { BrandSettingsEditorValue, SettingsMutationResult, SiteSettingsEditorValue } from './types';

type SiteSettingsManagerProps = {
  initialBrand: BrandSettingsEditorValue;
  initialSettings: SiteSettingsEditorValue;
  portfolio: Portfolio;
  role: PortfolioRole;
  updateBrandSettings: (payload: BrandSettingsEditorValue) => Promise<SettingsMutationResult>;
  updateSiteSettings: (payload: SiteSettingsEditorValue) => Promise<SettingsMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export function SiteSettingsManager({
  initialBrand,
  initialSettings,
  portfolio,
  role,
  updateBrandSettings,
  updateSiteSettings,
}: SiteSettingsManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const readOnly = !manager;
  const [brand, setBrand] = useState(initialBrand);
  const [settings, setSettings] = useState(initialSettings);
  const [brandPending, setBrandPending] = useState(false);
  const [settingsPending, setSettingsPending] = useState(false);
  const [message, setMessage] = useState<SettingsMutationResult>({});

  useEffect(() => {
    setBrand(initialBrand);
  }, [initialBrand]);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const finishMutation = (result: SettingsMutationResult) => {
    setMessage(result);

    if (result.success) {
      router.refresh();
    }
  };

  const handleBrandSave = async () => {
    if (readOnly || brandPending) {
      return;
    }

    setBrandPending(true);
    setMessage({});

    try {
      finishMutation(await updateBrandSettings(brand));
    } finally {
      setBrandPending(false);
    }
  };

  const handleSettingsSave = async () => {
    if (readOnly || settingsPending) {
      return;
    }

    setSettingsPending(true);
    setMessage({});

    try {
      finishMutation(await updateSiteSettings(settings));
    } finally {
      setSettingsPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SettingsStatusBadge label="settings.manager" />
          <SettingsStatusBadge label={portfolio.title} tone="green" />
          <SettingsStatusBadge label={role} />
          {readOnly && <SettingsStatusBadge label="Read-only access" tone="yellow" />}
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Site Settings</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
          Manage portfolio identity, public labels, and brand metadata.
        </p>
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
          <BrandSettingsForm
            brand={brand}
            disabled={readOnly}
            onChange={setBrand}
            onSave={handleBrandSave}
            pending={brandPending}
          />

          <SiteSettingsForm
            disabled={readOnly}
            onChange={setSettings}
            onSave={handleSettingsSave}
            pending={settingsPending}
            settings={settings}
          />

          {readOnly && (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 text-center font-mono text-xs text-gray-500">
              Read-only access: You can review settings but cannot save changes.
            </div>
          )}
        </div>

        <SiteSettingsPreviewCard brand={brand} settings={settings} />
      </div>
    </div>
  );
}
