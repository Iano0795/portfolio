'use client';

import { Save, X } from 'lucide-react';
import type { ContactLinkEditorValue } from './types';

type ContactFormProps = {
  contactLink: ContactLinkEditorValue;
  disabled: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (contactLink: ContactLinkEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

const commonContactTypes = ['email', 'linkedin', 'github', 'website', 'x', 'phone', 'whatsapp', 'resume', 'other'];

const commonIcons = [
  { value: 'mail', label: 'Mail' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'globe', label: 'Globe' },
  { value: 'phone', label: 'Phone' },
  { value: 'message-circle', label: 'Message Circle' },
  { value: 'file-text', label: 'File Text' },
  { value: 'external-link', label: 'External Link' },
  { value: 'link', label: 'Link' },
];

export function ContactForm({ contactLink, disabled, mode, onCancel, onChange, onSave, pending }: ContactFormProps) {
  const title = mode === 'create' ? 'New Contact Link' : 'Edit Contact Link';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto p-4">
        {/* Contact Details */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Contact Details</legend>

          <div>
            <label htmlFor="contact-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Label <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="contact-label"
              type="text"
              value={contactLink.label}
              onChange={(e) => onChange({ ...contactLink, label: e.target.value })}
              placeholder="e.g., LINKEDIN, EMAIL, GITHUB"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{contactLink.label.length}/120 characters</p>
          </div>

          <div>
            <label htmlFor="contact-type" className="mb-1.5 block font-mono text-xs text-gray-300">
              Type <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="contact-type"
              type="text"
              list="type-suggestions"
              value={contactLink.type}
              onChange={(e) => onChange({ ...contactLink, type: e.target.value })}
              placeholder="e.g., email, linkedin, github"
              disabled={disabled || pending}
              maxLength={80}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <datalist id="type-suggestions">
              {commonContactTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              {contactLink.type.length}/80 characters · Type to select or enter custom
            </p>
          </div>

          <div>
            <label htmlFor="contact-url" className="mb-1.5 block font-mono text-xs text-gray-300">
              URL <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="contact-url"
              type="text"
              value={contactLink.url}
              onChange={(e) => onChange({ ...contactLink, url: e.target.value })}
              placeholder="e.g., https://linkedin.com/in/username, mailto:name@example.com"
              disabled={disabled || pending}
              maxLength={500}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              {contactLink.url.length}/500 characters · Use full URLs (https://) or mailto:/tel: schemes
            </p>
          </div>

          <div>
            <label htmlFor="contact-icon" className="mb-1.5 block font-mono text-xs text-gray-300">
              Icon
            </label>
            <select
              id="contact-icon"
              value={contactLink.icon}
              onChange={(e) => onChange({ ...contactLink, icon: e.target.value })}
              disabled={disabled || pending}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select icon...</option>
              {commonIcons.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
            <p className="mt-1 font-mono text-[10px] text-gray-500">Optional · Choose an icon to display with this link</p>
          </div>
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="contact-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="contact-order"
              type="number"
              value={contactLink.orderIndex}
              onChange={(e) => onChange({ ...contactLink, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={contactLink.isActive}
              onChange={(e) => onChange({ ...contactLink, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive links are hidden from public portfolio
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !contactLink.label.trim() || !contactLink.type.trim() || !contactLink.url.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Link' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex items-center gap-2 border border-gray-600/45 bg-[#050812]/40 px-4 py-2.5 font-mono text-sm text-gray-400 transition-all hover:border-gray-500/45 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
