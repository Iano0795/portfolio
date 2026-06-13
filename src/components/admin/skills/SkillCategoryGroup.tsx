'use client';

import { ChevronDown, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { SkillStatusBadge } from './SkillStatusBadge';
import type { SkillEditorValue } from './types';

type SkillCategoryGroupProps = {
  category: string;
  disabled: boolean;
  onArchive: (skillId: string) => void;
  onEdit: (skill: SkillEditorValue) => void;
  onMove: (skillId: string, direction: 'up' | 'down') => void;
  onRestore: (skillId: string) => void;
  pending: boolean;
  skills: SkillEditorValue[];
};

export function SkillCategoryGroup({
  category,
  disabled,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
  skills,
}: SkillCategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  const activeSkills = skills.filter((skill) => skill.isActive);
  const archivedSkills = skills.filter((skill) => !skill.isActive);
  const hasArchived = archivedSkills.length > 0;

  return (
    <div className="border border-cyan-400/10 bg-[#050812]/40">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between border-b border-cyan-400/10 bg-[#090d16]/60 px-4 py-3 text-left font-mono text-sm text-cyan-400 transition-colors hover:bg-[#090d16]/80"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            aria-hidden="true"
          />
          {category}
          <span className="ml-2 text-xs text-gray-500">({skills.length})</span>
        </span>
      </button>

      {!collapsed && (
        <div className="divide-y divide-cyan-400/5">
          {activeSkills.map((skill, index) => (
            <div
              key={skill.id ?? `draft-${index}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#090d16]/40"
            >
              <div className="flex flex-1 items-center gap-4">
                <span className="font-mono text-xs text-gray-500">#{skill.orderIndex}</span>
                <div className="flex-1">
                  <div className="font-mono text-sm text-white">{skill.name}</div>
                  {skill.level && <div className="mt-1 font-mono text-xs text-gray-400">{skill.level}</div>}
                </div>
                <SkillStatusBadge isActive={skill.isActive} />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || pending || index === 0}
                  onClick={() => skill.id && onMove(skill.id, 'up')}
                  className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  disabled={disabled || pending || index === activeSkills.length - 1}
                  onClick={() => skill.id && onMove(skill.id, 'down')}
                  className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  disabled={disabled || pending}
                  onClick={() => onEdit(skill)}
                  className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Edit"
                >
                  <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  disabled={disabled || pending}
                  onClick={() => skill.id && onArchive(skill.id)}
                  className="border border-[#ff5f56]/25 bg-[#050812]/40 p-1.5 text-[#ff5f56] transition-all hover:border-[#ff5f56]/45 hover:bg-[#ff5f56]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Archive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

          {hasArchived && archivedSkills.length > 0 && (
            <>
              <div className="bg-gray-900/20 px-4 py-2 font-mono text-xs text-gray-500">Archived Skills</div>
              {archivedSkills.map((skill, index) => (
                <div
                  key={skill.id ?? `archived-${index}`}
                  className="flex items-center justify-between gap-4 bg-gray-900/10 px-4 py-3 opacity-60"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="font-mono text-xs text-gray-600">#{skill.orderIndex}</span>
                    <div className="flex-1">
                      <div className="font-mono text-sm text-gray-400 line-through">{skill.name}</div>
                      {skill.level && <div className="mt-1 font-mono text-xs text-gray-500">{skill.level}</div>}
                    </div>
                    <SkillStatusBadge isActive={skill.isActive} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={disabled || pending}
                      onClick={() => skill.id && onRestore(skill.id)}
                      className="border border-cyan-400/25 bg-[#050812]/40 px-3 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
