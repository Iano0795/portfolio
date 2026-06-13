'use client';

import { Save, X } from 'lucide-react';
import type { ProcessStepEditorValue } from './types';

type ProcessFormProps = {
  disabled: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (step: ProcessStepEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  step: ProcessStepEditorValue;
};

export function ProcessForm({
  disabled,
  mode,
  onCancel,
  onChange,
  onSave,
  pending,
  step,
}: ProcessFormProps) {
  const title = mode === 'create' ? 'New Process Step' : 'Edit Process Step';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="space-y-6 p-4">
        {/* Step Details */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Step Details</legend>

          <div>
            <label htmlFor="step-title" className="mb-1.5 block font-mono text-xs text-gray-300">
              Title <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="step-title"
              type="text"
              value={step.title}
              onChange={(e) => onChange({ ...step, title: e.target.value })}
              placeholder="e.g., Discovery & Analysis, Design & Prototype"
              disabled={disabled || pending}
              maxLength={160}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{step.title.length}/160 characters</p>
          </div>

          <div>
            <label htmlFor="step-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Label
            </label>
            <input
              id="step-label"
              type="text"
              value={step.label}
              onChange={(e) => onChange({ ...step, label: e.target.value })}
              placeholder="e.g., Step 01, Phase 1"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{step.label.length}/120 characters · Optional</p>
          </div>

          <div>
            <label htmlFor="step-command" className="mb-1.5 block font-mono text-xs text-gray-300">
              Command
            </label>
            <input
              id="step-command"
              type="text"
              value={step.command}
              onChange={(e) => onChange({ ...step, command: e.target.value })}
              placeholder="e.g., run discovery.sh, exec design-phase"
              disabled={disabled || pending}
              maxLength={200}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{step.command.length}/200 characters · Optional</p>
          </div>

          <div>
            <label htmlFor="step-description" className="mb-1.5 block font-mono text-xs text-gray-300">
              Description
            </label>
            <textarea
              id="step-description"
              value={step.description}
              onChange={(e) => onChange({ ...step, description: e.target.value })}
              placeholder="Describe what happens in this step..."
              disabled={disabled || pending}
              maxLength={800}
              rows={4}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{step.description.length}/800 characters · Optional</p>
          </div>
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="step-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="step-order"
              type="number"
              value={step.orderIndex}
              onChange={(e) => onChange({ ...step, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first in the pipeline</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={step.isActive}
              onChange={(e) => onChange({ ...step, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive steps are hidden from public portfolio
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !step.title.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Step' : 'Save Changes'}
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
