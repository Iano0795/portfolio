'use client';

import { Save, X } from 'lucide-react';
import type { CapabilityEditorValue } from './types';

type CapabilityFormProps = {
  capability: CapabilityEditorValue;
  disabled: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (capability: CapabilityEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

const ICON_OPTIONS = [
  { value: 'layers', label: 'Layers' },
  { value: 'network', label: 'Network' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'shield', label: 'Shield' },
  { value: 'code', label: 'Code' },
  { value: 'cpu', label: 'CPU' },
  { value: 'map', label: 'Map' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'zap', label: 'Zap' },
  { value: 'lock', label: 'Lock' },
  { value: 'globe', label: 'Globe' },
  { value: 'box', label: 'Box' },
];

export function CapabilityForm({
  capability,
  disabled,
  mode,
  onCancel,
  onChange,
  onSave,
  pending,
}: CapabilityFormProps) {
  const title = mode === 'create' ? 'New Capability' : 'Edit Capability';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="space-y-6 p-4">
        {/* Capability Details */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Capability Details</legend>

          <div>
            <label htmlFor="capability-title" className="mb-1.5 block font-mono text-xs text-gray-300">
              Title <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="capability-title"
              type="text"
              value={capability.title}
              onChange={(e) => onChange({ ...capability, title: e.target.value })}
              placeholder="e.g., Full-Stack Development, Cloud Architecture"
              disabled={disabled || pending}
              maxLength={160}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{capability.title.length}/160 characters</p>
          </div>

          <div>
            <label htmlFor="capability-description" className="mb-1.5 block font-mono text-xs text-gray-300">
              Description
            </label>
            <textarea
              id="capability-description"
              value={capability.description}
              onChange={(e) => onChange({ ...capability, description: e.target.value })}
              placeholder="Describe this capability..."
              disabled={disabled || pending}
              maxLength={600}
              rows={4}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{capability.description.length}/600 characters · Optional</p>
          </div>

          <div>
            <label htmlFor="capability-icon" className="mb-1.5 block font-mono text-xs text-gray-300">
              Icon
            </label>
            <select
              id="capability-icon"
              value={capability.icon}
              onChange={(e) => onChange({ ...capability, icon: e.target.value })}
              disabled={disabled || pending}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an icon...</option>
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 font-mono text-[10px] text-gray-500">Icon key for visual display · Optional</p>
          </div>
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="capability-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="capability-order"
              type="number"
              value={capability.orderIndex}
              onChange={(e) => onChange({ ...capability, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={capability.isActive}
              onChange={(e) => onChange({ ...capability, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive capabilities are hidden from public portfolio
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !capability.title.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Capability' : 'Save Changes'}
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
