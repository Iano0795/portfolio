'use client';

import { Save, X } from 'lucide-react';
import { ExperienceAchievementsFields } from './ExperienceAchievementsFields';
import type { ExperienceEditorValue } from './types';

type ExperienceFormProps = {
  disabled: boolean;
  experience: ExperienceEditorValue;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (experience: ExperienceEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

export function ExperienceForm({ disabled, experience, mode, onCancel, onChange, onSave, pending }: ExperienceFormProps) {
  const title = mode === 'create' ? 'New Experience Entry' : 'Edit Experience Entry';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto p-4">
        {/* Role Details */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Role Details</legend>

          <div>
            <label htmlFor="experience-stage" className="mb-1.5 block font-mono text-xs text-gray-300">
              Stage Label
            </label>
            <input
              id="experience-stage"
              type="text"
              value={experience.stageLabel}
              onChange={(e) => onChange({ ...experience, stageLabel: e.target.value })}
              placeholder="e.g., Current, Recent, Previous, Earlier"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{experience.stageLabel.length}/120 characters · Optional</p>
          </div>

          <div>
            <label htmlFor="experience-title" className="mb-1.5 block font-mono text-xs text-gray-300">
              Title <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="experience-title"
              type="text"
              value={experience.title}
              onChange={(e) => onChange({ ...experience, title: e.target.value })}
              placeholder="e.g., Senior Full-Stack Engineer, Product Designer"
              disabled={disabled || pending}
              maxLength={160}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{experience.title.length}/160 characters</p>
          </div>

          <div>
            <label htmlFor="experience-organization" className="mb-1.5 block font-mono text-xs text-gray-300">
              Organization
            </label>
            <input
              id="experience-organization"
              type="text"
              value={experience.organization}
              onChange={(e) => onChange({ ...experience, organization: e.target.value })}
              placeholder="e.g., Tech Corp, Startup Inc."
              disabled={disabled || pending}
              maxLength={160}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{experience.organization.length}/160 characters · Optional</p>
          </div>

          <div>
            <label htmlFor="experience-period" className="mb-1.5 block font-mono text-xs text-gray-300">
              Period
            </label>
            <input
              id="experience-period"
              type="text"
              value={experience.period}
              onChange={(e) => onChange({ ...experience, period: e.target.value })}
              placeholder="e.g., Jan 2023 - Present, 2020 - 2022"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{experience.period.length}/120 characters · Optional</p>
          </div>
        </fieldset>

        {/* Description */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Description</legend>

          <div>
            <textarea
              id="experience-description"
              value={experience.description}
              onChange={(e) => onChange({ ...experience, description: e.target.value })}
              placeholder="Brief overview of the role, responsibilities, and context..."
              disabled={disabled || pending}
              maxLength={1000}
              rows={4}
              className="w-full resize-none border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{experience.description.length}/1000 characters · Optional</p>
          </div>
        </fieldset>

        {/* Achievements */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Achievements / Log Lines</legend>
          <ExperienceAchievementsFields
            achievements={experience.achievements}
            disabled={disabled || pending}
            onChange={(achievements) => onChange({ ...experience, achievements })}
          />
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="experience-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="experience-order"
              type="number"
              value={experience.orderIndex}
              onChange={(e) => onChange({ ...experience, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={experience.isActive}
              onChange={(e) => onChange({ ...experience, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive entries are hidden from public portfolio
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !experience.title.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Save Changes'}
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
