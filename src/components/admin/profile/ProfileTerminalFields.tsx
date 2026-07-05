'use client';

import type { EditableListItem } from './types';

type ProfileTerminalFieldsProps = {
  disabled: boolean;
  lines: EditableListItem[];
  onChange: (lines: EditableListItem[]) => void;
};

export function ProfileTerminalFields({ disabled, lines, onChange }: ProfileTerminalFieldsProps) {
  const updateLine = (id: string, value: string) => {
    onChange(lines.map((line) => (line.id === id ? { ...line, value } : line)));
  };

  const removeLine = (id: string) => {
    onChange(lines.filter((line) => line.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs text-cyan-400">Terminal Identity</h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...lines, { id: crypto.randomUUID(), value: 'LABEL=value' }])}
          className="border border-cyan-400/30 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
        >
          Add line
        </button>
      </div>

      <div className="grid gap-2">
        {lines.map((line) => (
          <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={line.value}
              onChange={(event) => updateLine(line.id, event.target.value)}
              disabled={disabled}
              className="w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600"
              placeholder="LABEL=value"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeLine(line.id)}
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
