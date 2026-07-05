'use client';

import { Save, X } from 'lucide-react';
import { CredentialSkillsFields } from './CredentialSkillsFields';
import type { CredentialEditorValue } from './types';

type CredentialFormProps = {
  credential: CredentialEditorValue;
  disabled: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (credential: CredentialEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

type TextFieldProps = {
  disabled: boolean;
  label: string;
  name: keyof CredentialEditorValue;
  onChange: (name: keyof CredentialEditorValue, value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: 'text' | 'date' | 'url' | 'number';
  value: string | number;
};

function TextField({ disabled, label, name, onChange, placeholder, textarea = false, type = 'text', value }: TextFieldProps) {
  const className =
    'w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600';

  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs text-gray-500">{label}</span>
      {textarea ? (
        <textarea
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value)}
          disabled={disabled}
          className={`${className} min-h-24 resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
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

export function CredentialForm({ credential, disabled, mode, onCancel, onChange, onSave, pending }: CredentialFormProps) {
  const readOnly = disabled || pending;
  const title = mode === 'create' ? 'New Credential' : credential.title || 'Edit Credential';

  const updateField = (name: keyof CredentialEditorValue, value: string) => {
    onChange({ ...credential, [name]: value });
  };

  const updateNumber = (name: keyof CredentialEditorValue, value: string) => {
    onChange({ ...credential, [name]: Number.parseInt(value, 10) || 0 });
  };

  const updateBoolean = (name: keyof CredentialEditorValue, value: boolean) => {
    onChange({ ...credential, [name]: value });
  };

  return (
    <section className="space-y-5 border border-cyan-400/20 bg-[#090d16]/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div>
          <div className="mb-1 font-mono text-xs text-cyan-400">{mode === 'create' ? 'credential.create' : 'credential.edit'}</div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="border border-gray-700 px-3 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-cyan-400/35 hover:text-cyan-300 disabled:cursor-not-allowed disabled:text-gray-700"
        >
          Close
        </button>
      </div>

      <section className="space-y-4">
        <h3 className="font-mono text-xs text-cyan-400">Credential Details</h3>
        <TextField disabled={readOnly} label="Title" name="title" value={credential.title} onChange={updateField} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField disabled={readOnly} label="Issuer" name="issuer" value={credential.issuer} onChange={updateField} />
          <TextField disabled={readOnly} label="Credential type" name="credentialType" value={credential.credentialType} onChange={updateField} />
          <TextField disabled={readOnly} label="Category" name="category" value={credential.category} onChange={updateField} />
          <TextField disabled={readOnly} label="Credential ID" name="credentialId" value={credential.credentialId} onChange={updateField} />
        </div>
        <TextField disabled={readOnly} label="Description" name="description" value={credential.description} onChange={updateField} textarea />
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Dates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField disabled={readOnly} label="Issued date" name="issuedAt" type="date" value={credential.issuedAt} onChange={updateField} />
          <TextField disabled={readOnly} label="Expiry date" name="expiresAt" type="date" value={credential.expiresAt} onChange={updateField} />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Verification</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField disabled={readOnly} label="Credential URL" name="credentialUrl" type="url" value={credential.credentialUrl} onChange={updateField} />
          <TextField disabled={readOnly} label="Image URL" name="imageUrl" type="url" value={credential.imageUrl} onChange={updateField} />
        </div>
      </section>

      <section className="border-t border-gray-800 pt-5">
        <CredentialSkillsFields
          disabled={readOnly}
          skills={credential.skills}
          onChange={(skills) => onChange({ ...credential, skills })}
        />
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Display</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-3 border border-gray-800 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
            <input
              type="checkbox"
              checked={credential.isFeatured}
              onChange={(event) => updateBoolean('isFeatured', event.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 accent-[#00ff88]"
            />
            Featured
          </label>
          <label className="flex items-center gap-3 border border-gray-800 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
            <input
              type="checkbox"
              checked={credential.isActive}
              onChange={(event) => updateBoolean('isActive', event.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 accent-[#00ff88]"
            />
            Active/published
          </label>
          <TextField disabled={readOnly} label="Order index" name="orderIndex" type="number" value={credential.orderIndex} onChange={updateNumber} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-gray-800 pt-5">
        <button
          type="button"
          disabled={readOnly || !credential.title.trim()}
          onClick={onSave}
          className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {pending ? 'Saving credential...' : mode === 'create' ? 'Create credential' : 'Save credential'}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="inline-flex items-center gap-2 border border-cyan-400/30 px-4 py-2.5 font-mono text-sm text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:text-gray-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Reset view
        </button>
      </div>
    </section>
  );
}
