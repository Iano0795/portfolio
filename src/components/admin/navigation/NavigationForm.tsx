'use client';

import { Save, X } from 'lucide-react';
import { NavigationIconPicker } from './NavigationIconPicker';
import type { NavigationItemEditorValue } from './types';

type NavigationFormProps = {
  disabled: boolean;
  item: NavigationItemEditorValue;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (item: NavigationItemEditorValue) => void;
  onSave: () => void;
  pending: boolean;
};

const SUPPORTED_SECTIONS = [
  { value: 'profile', label: 'Profile' },
  { value: 'about', label: 'About' },
  { value: 'capabilities', label: 'Capabilities' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'process', label: 'Process' },
  { value: 'experience', label: 'Experience' },
  { value: 'contact', label: 'Contact' },
];

export function NavigationForm({
  disabled,
  item,
  mode,
  onCancel,
  onChange,
  onSave,
  pending,
}: NavigationFormProps) {
  const title = mode === 'create' ? 'New Navigation Item' : 'Edit Navigation Item';

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">{title}</div>

      <div className="space-y-6 p-4">
        {/* Navigation Target */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Navigation Target</legend>

          <div>
            <label htmlFor="nav-section-id" className="mb-1.5 block font-mono text-xs text-gray-300">
              Section ID <span className="text-[#ff5f56]">*</span>
            </label>
            <select
              id="nav-section-id"
              value={item.sectionId}
              onChange={(e) => onChange({ ...item, sectionId: e.target.value })}
              disabled={disabled || pending}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select section...</option>
              {SUPPORTED_SECTIONS.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label} ({section.value})
                </option>
              ))}
            </select>
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              Target section/page identifier · Only supported sections shown
            </p>
          </div>

          <div>
            <label htmlFor="nav-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              Label <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="nav-label"
              type="text"
              value={item.label}
              onChange={(e) => onChange({ ...item, label: e.target.value })}
              placeholder="e.g., Projects, Experience, Contact"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{item.label.length}/120 characters · Shown in navigation</p>
          </div>

          <div>
            <label htmlFor="nav-system-label" className="mb-1.5 block font-mono text-xs text-gray-300">
              System Label
            </label>
            <input
              id="nav-system-label"
              type="text"
              value={item.systemLabel}
              onChange={(e) => onChange({ ...item, systemLabel: e.target.value })}
              placeholder="e.g., projects.index, career.timeline"
              disabled={disabled || pending}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{item.systemLabel.length}/120 characters · Module path/identifier</p>
          </div>
        </fieldset>

        {/* Command */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Command</legend>

          <div>
            <label htmlFor="nav-command" className="mb-1.5 block font-mono text-xs text-gray-300">
              Command Text
            </label>
            <input
              id="nav-command"
              type="text"
              value={item.command}
              onChange={(e) => onChange({ ...item, command: e.target.value })}
              placeholder="e.g., open /projects/, tail /logs/career.log"
              disabled={disabled || pending}
              maxLength={200}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{item.command.length}/200 characters · Console command hint</p>
          </div>
        </fieldset>

        {/* Icon */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Icon</legend>

          <NavigationIconPicker
            value={item.icon}
            onChange={(icon) => onChange({ ...item, icon })}
            disabled={disabled || pending}
          />
        </fieldset>

        {/* Display Settings */}
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">Display</legend>

          <div>
            <label htmlFor="nav-order" className="mb-1.5 block font-mono text-xs text-gray-300">
              Order Index
            </label>
            <input
              id="nav-order"
              type="number"
              value={item.orderIndex}
              onChange={(e) => onChange({ ...item, orderIndex: parseInt(e.target.value, 10) || 0 })}
              disabled={disabled || pending}
              min={0}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">Lower numbers appear first in navigation</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={item.isVisible}
              onChange={(e) => onChange({ ...item, isVisible: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Visible in Navigation</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Hidden items exist but don't appear in public navigation
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-3">
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={(e) => onChange({ ...item, isActive: e.target.checked })}
              disabled={disabled || pending}
              className="mt-0.5 h-4 w-4 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-mono text-xs text-gray-300">Active/Published</span>
              <span className="mt-1 block font-mono text-[10px] text-gray-500">
                Inactive items are archived and removed from navigation
              </span>
            </span>
          </label>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || pending || !item.sectionId.trim() || !item.label.trim()}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Save Changes'}
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
