'use client';

import type { EditableListItem } from './types';

type ProfileStackFieldsProps = {
  disabled: boolean;
  stack: EditableListItem[];
  onChange: (stack: EditableListItem[]) => void;
};

export function ProfileStackFields({ disabled, stack, onChange }: ProfileStackFieldsProps) {
  const updateTech = (id: string, value: string) => {
    onChange(stack.map((tech) => (tech.id === id ? { ...tech, value } : tech)));
  };

  const removeTech = (id: string) => {
    onChange(stack.filter((tech) => tech.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs text-cyan-400">Core Stack</h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...stack, { id: crypto.randomUUID(), value: '' }])}
          className="border border-cyan-400/30 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
        >
          Add technology
        </button>
      </div>

      <div className="grid gap-2">
        {stack.map((tech) => (
          <div key={tech.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={tech.value}
              onChange={(event) => updateTech(tech.id, event.target.value)}
              disabled={disabled}
              className="w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600"
              placeholder="Technology"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTech(tech.id)}
              className="border border-gray-700 px-3 py-2 font-mono text-xs text-gray-500 transition-colors hover:border-[#ff5f56]/40 hover:text-[#ffb4ad] disabled:cursor-not-allowed disabled:text-gray-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
