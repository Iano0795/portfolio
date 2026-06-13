'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SkillCategoryGroup } from './SkillCategoryGroup';
import type { SkillEditorValue } from './types';

type SkillsListProps = {
  disabled: boolean;
  onArchive: (skillId: string) => void;
  onEdit: (skill: SkillEditorValue) => void;
  onMove: (skillId: string, direction: 'up' | 'down') => void;
  onRestore: (skillId: string) => void;
  pending: boolean;
  skills: SkillEditorValue[];
};

export function SkillsList({ disabled, onArchive, onEdit, onMove, onRestore, pending, skills }: SkillsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredSkills = skills.filter((skill) => {
    if (!showArchived && !skill.isActive) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query) ||
        skill.level.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const groupedSkills = filteredSkills.reduce<Record<string, SkillEditorValue[]>>((groups, skill) => {
    const category = skill.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {});

  const sortedCategories = Object.keys(groupedSkills).sort();

  if (skills.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No skills found. Create your first skill to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search skills, categories, levels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-cyan-400/20 bg-[#050812]/60 py-2 pl-10 pr-3 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 border border-cyan-400/20 bg-[#050812]/60 px-3 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-400">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-3.5 w-3.5 border-cyan-400/30 bg-[#050812] text-cyan-400 focus:ring-cyan-400/30"
          />
          Show archived
        </label>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No skills match your search.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map((category) => (
            <SkillCategoryGroup
              key={category}
              category={category}
              disabled={disabled}
              onArchive={onArchive}
              onEdit={onEdit}
              onMove={(skillId, direction) => {
                const categorySkills = groupedSkills[category].filter((s) => s.isActive);
                onMove(skillId, direction);
              }}
              onRestore={onRestore}
              pending={pending}
              skills={groupedSkills[category].sort((a, b) => a.orderIndex - b.orderIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
