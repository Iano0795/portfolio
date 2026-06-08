'use client';

import { useActionState, useEffect, useState } from 'react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ProfilePreview } from './ProfilePreview';
import { ProfileStackFields } from './ProfileStackFields';
import { ProfileTerminalFields } from './ProfileTerminalFields';
import type { EditableListItem, ProfileEditorSaveState, ProfileEditorValue } from './types';

type ProfileEditorProps = {
  initialProfile: ProfileEditorValue;
  portfolio: Portfolio;
  role: PortfolioRole;
  saveAction: (state: ProfileEditorSaveState, formData: FormData) => Promise<ProfileEditorSaveState>;
};

const emptyState: ProfileEditorSaveState = {};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

function toEditableItems(values: string[]) {
  return values.map(createItem);
}

function toStringValues(items: EditableListItem[]) {
  return items.map((item) => item.value);
}

function normalizeInitialProfile(profile: ProfileEditorValue): ProfileEditorValue {
  return {
    ...profile,
    terminalLines: toEditableItems(profile.terminalLines.map((item) => item.value)),
    coreStack: toEditableItems(profile.coreStack.map((item) => item.value)),
  };
}

function TextField({
  disabled,
  label,
  name,
  onChange,
  placeholder,
  value,
  textarea = false,
}: {
  disabled: boolean;
  label: string;
  name: keyof ProfileEditorValue;
  onChange: (name: keyof ProfileEditorValue, value: string) => void;
  placeholder?: string;
  value: string;
  textarea?: boolean;
}) {
  const className =
    'w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600';

  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs text-gray-500">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          disabled={disabled}
          className={`${className} min-h-24 resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          disabled={disabled}
          className={className}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

export function ProfileEditor({ initialProfile, portfolio, role, saveAction }: ProfileEditorProps) {
  const [profile, setProfile] = useState(() => normalizeInitialProfile(initialProfile));
  const [state, formAction, pending] = useActionState(saveAction, emptyState);
  const readOnly = !canSave(role);

  useEffect(() => {
    setProfile(normalizeInitialProfile(initialProfile));
  }, [initialProfile]);

  const updateField = (name: keyof ProfileEditorValue, value: string) => {
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">profile.editor</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Profile Editor</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
          Manage the identity and hero content for this portfolio.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form action={formAction} className="space-y-5 border border-cyan-400/20 bg-[#090d16]/80 p-5">
          <input type="hidden" name="terminalLinesJson" value={JSON.stringify(toStringValues(profile.terminalLines))} />
          <input type="hidden" name="coreStackJson" value={JSON.stringify(toStringValues(profile.coreStack))} />
          <input type="hidden" name="isActive" value={profile.isActive ? 'true' : 'false'} />

          {state.error && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
              {state.success}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="font-mono text-xs text-cyan-400">Identity</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField disabled={readOnly} label="Name" name="name" value={profile.name} onChange={updateField} />
              <TextField disabled={readOnly} label="Intro line" name="introLine" value={profile.introLine} onChange={updateField} />
            </div>
            <TextField disabled={readOnly} label="Headline" name="headline" value={profile.headline} onChange={updateField} />
            <TextField
              disabled={readOnly}
              label="Subheadline"
              name="subheadline"
              value={profile.subheadline}
              onChange={updateField}
              textarea
            />
          </section>

          <section className="space-y-4 border-t border-gray-800 pt-5">
            <h2 className="font-mono text-xs text-cyan-400">Positioning</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField disabled={readOnly} label="Location" name="location" value={profile.location} onChange={updateField} />
              <TextField
                disabled={readOnly}
                label="Availability status"
                name="availabilityStatus"
                value={profile.availabilityStatus}
                onChange={updateField}
              />
              <TextField
                disabled={readOnly}
                label="Current focus"
                name="currentFocus"
                value={profile.currentFocus}
                onChange={updateField}
              />
            </div>
          </section>

          <section className="border-t border-gray-800 pt-5">
            <ProfileTerminalFields
              disabled={readOnly}
              lines={profile.terminalLines}
              onChange={(terminalLines) => setProfile((current) => ({ ...current, terminalLines }))}
            />
          </section>

          <section className="border-t border-gray-800 pt-5">
            <ProfileStackFields
              disabled={readOnly}
              stack={profile.coreStack}
              onChange={(coreStack) => setProfile((current) => ({ ...current, coreStack }))}
            />
          </section>

          <section className="space-y-4 border-t border-gray-800 pt-5">
            <h2 className="font-mono text-xs text-cyan-400">CTA Labels</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                disabled={readOnly}
                label="Primary CTA"
                name="ctaPrimaryLabel"
                value={profile.ctaPrimaryLabel}
                onChange={updateField}
              />
              <TextField
                disabled={readOnly}
                label="Secondary CTA"
                name="ctaSecondaryLabel"
                value={profile.ctaSecondaryLabel}
                onChange={updateField}
              />
              <TextField
                disabled={readOnly}
                label="Contact CTA"
                name="ctaContactLabel"
                value={profile.ctaContactLabel}
                onChange={updateField}
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-800 pt-5">
            <h2 className="font-mono text-xs text-cyan-400">Publishing</h2>
            <label className="flex items-center gap-3 font-mono text-xs text-gray-400">
              <input
                type="checkbox"
                checked={profile.isActive}
                onChange={(event) => setProfile((current) => ({ ...current, isActive: event.target.checked }))}
                disabled={readOnly}
                className="h-4 w-4 accent-[#00ff88]"
              />
              Active profile
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={readOnly || pending}
                className="border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
              >
                {pending ? 'Saving profile...' : 'Save profile'}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setProfile(normalizeInitialProfile(initialProfile))}
                className="border border-cyan-400/30 px-4 py-2.5 font-mono text-sm text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:text-gray-600"
              >
                Reset
              </button>
            </div>
          </section>
        </form>

        <ProfilePreview profile={profile} />
      </div>
    </div>
  );
}
