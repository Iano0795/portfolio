'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { EditableListItem } from './types';

type ExperienceAchievementsFieldsProps = {
  achievements: EditableListItem[];
  disabled: boolean;
  onChange: (achievements: EditableListItem[]) => void;
};

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

export function ExperienceAchievementsFields({ achievements, disabled, onChange }: ExperienceAchievementsFieldsProps) {
  const handleAdd = () => {
    onChange([...achievements, createItem('')]);
  };

  const handleRemove = (id: string) => {
    onChange(achievements.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, value: string) => {
    onChange(achievements.map((item) => (item.id === id ? { ...item, value } : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 border border-cyan-400/25 bg-[#050812]/40 px-2.5 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="border border-dashed border-cyan-400/20 bg-black/20 px-3 py-4 text-center font-mono text-xs text-gray-500">
          No achievements added. Click "Add Achievement" to create your first log line.
        </div>
      ) : (
        <div className="space-y-2">
          {achievements.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <div className="flex-1">
                <textarea
                  value={item.value}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  placeholder={`Achievement ${index + 1}`}
                  disabled={disabled}
                  maxLength={300}
                  rows={2}
                  className="w-full resize-none border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 font-mono text-[10px] text-gray-500">{item.value.length}/300 characters</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={disabled}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#ff5f56]/25 bg-[#050812]/40 text-[#ff5f56] transition-all hover:border-[#ff5f56]/45 hover:bg-[#ff5f56]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                title="Remove achievement"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
