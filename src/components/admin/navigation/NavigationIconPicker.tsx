'use client';

import {
  Activity,
  Briefcase,
  Code,
  Cpu,
  FileText,
  Folder,
  FolderGit,
  Info,
  Layers,
  Lock,
  Mail,
  Map,
  Route,
  Send,
  Settings,
  Shield,
  Terminal,
  User,
  Workflow,
  Wrench,
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'user', label: 'User', Icon: User },
  { value: 'info', label: 'Info', Icon: Info },
  { value: 'layers', label: 'Layers', Icon: Layers },
  { value: 'map', label: 'Map', Icon: Map },
  { value: 'wrench', label: 'Wrench', Icon: Wrench },
  { value: 'cpu', label: 'CPU', Icon: Cpu },
  { value: 'code', label: 'Code', Icon: Code },
  { value: 'folder', label: 'Folder', Icon: Folder },
  { value: 'folder-git', label: 'Folder Git', Icon: FolderGit },
  { value: 'workflow', label: 'Workflow', Icon: Workflow },
  { value: 'route', label: 'Route', Icon: Route },
  { value: 'briefcase', label: 'Briefcase', Icon: Briefcase },
  { value: 'activity', label: 'Activity', Icon: Activity },
  { value: 'mail', label: 'Mail', Icon: Mail },
  { value: 'send', label: 'Send', Icon: Send },
  { value: 'file-text', label: 'File Text', Icon: FileText },
  { value: 'shield', label: 'Shield', Icon: Shield },
  { value: 'lock', label: 'Lock', Icon: Lock },
  { value: 'terminal', label: 'Terminal', Icon: Terminal },
  { value: 'settings', label: 'Settings', Icon: Settings },
];

type NavigationIconPickerProps = {
  disabled: boolean;
  onChange: (icon: string) => void;
  value: string;
};

export function NavigationIconPicker({ disabled, onChange, value }: NavigationIconPickerProps) {
  const selectedOption = ICON_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      <label htmlFor="nav-icon" className="mb-1.5 block font-mono text-xs text-gray-300">
        Icon
      </label>

      <div className="flex gap-2">
        <select
          id="nav-icon"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select icon...</option>
          {ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {selectedOption && (
          <div className="flex h-[42px] w-[42px] items-center justify-center border border-cyan-400/20 bg-[#050812]/80">
            <selectedOption.Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] text-gray-500">Icon key for public navigation display</p>
    </div>
  );
}
