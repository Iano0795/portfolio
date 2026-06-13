'use client';

import { Save, X } from 'lucide-react';
import type { SkillEditorValue } from './types';

type SkillFormProps = {
  disabled: boolean;
  existingCategories: string[];
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (skill: SkillEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  skill: SkillEditorValue;
};

export function SkillForm({
  disabled,
  existingCategories,
  mode,
  onCancel,
  onChange,
  onSave,
  pending,
  skill,
}: SkillFormProps) {
  const title = mode === 'create' ? 'New Skill' : 'Edit Skill';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="space-y-6 p-4">
        {/* Skill Details */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Skill Details</legend>

          <div>
            <label htmlFor="skill-name" className="mb-1.5 block font-mono text-xs text-gray-300">
              Name <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="skill-name"
              type="text"
              value={skill.name}
              onChange={(e) => onChange({ ...skill, name: e.target.value })}
              placeholder="e.g., React, TypeScript, Docker"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{skill.name.length}/120 characters</p>
          </div>

          <div>
            <label htmlFor="skill-category" className="mb-1.5 block font-mono text-xs text-gray-300">
              Category <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="skill-category"
              type="text"
              list="category-suggestions"
              value={skill.category}
              onChange={(e) => onChange({ ...skill, category: e.target.value })}
              placeholder="e.g., Frontend, Backend, Architecture"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <datalist id="category-suggestions">
              {existingCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              {skill.category.length}/120 characters · Type to select existing or create new
            </p>
          </div>

          <div>
            <label htmlFor="skill-level" className="mb-1.5 block font-mono text-xs text-gray-300">
              Level
            </label>
            <input
              id="skill-level"
              type="text"
              value={skill.level}
              onChange={(e) => onChange({ ...skill, level: e.target.value })}
              placeholder="e.g., Advanced, Expert, loaded, runtime-ready"
              disabled={disabled || pending}
              maxLength={80}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{skill.level.length}/80 characters · Optional</p>
          </div>
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="skill-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="skill-order"
              type="number"
              value={skill.orderIndex}
              onChange={(e) => onChange({ ...skill, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first within category</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={skill.isActive}
              onChange={(e) => onChange({ ...skill, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive skills are hidden from public portfolio
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !skill.name.trim() || !skill.category.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Skill' : 'Save Changes'}
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
