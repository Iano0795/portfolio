'use client';

import type { EditableCredentialSkill } from './types';

type CredentialSkillsFieldsProps = {
  disabled: boolean;
  skills: EditableCredentialSkill[];
  onChange: (skills: EditableCredentialSkill[]) => void;
};

export function CredentialSkillsFields({ disabled, skills, onChange }: CredentialSkillsFieldsProps) {
  const updateSkill = (id: string, value: string) => {
    onChange(skills.map((skill) => (skill.id === id ? { ...skill, value } : skill)));
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-xs text-cyan-400">Skills / Topics</h3>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...skills, { id: crypto.randomUUID(), value: '' }])}
          className="border border-cyan-400/30 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
        >
          Add topic
        </button>
      </div>

      <div className="grid gap-2">
        {skills.map((skill) => (
          <div key={skill.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={skill.value}
              onChange={(event) => updateSkill(skill.id, event.target.value)}
              disabled={disabled}
              maxLength={80}
              className="w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600"
              placeholder="SOC Analysis"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeSkill(skill.id)}
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
