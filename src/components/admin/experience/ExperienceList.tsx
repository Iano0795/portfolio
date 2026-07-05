'use client';

import { useState } from 'react';
import { Search, Edit, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { ExperienceStatusBadge } from './ExperienceStatusBadge';
import type { ExperienceEditorValue } from './types';

type ExperienceListProps = {
  disabled: boolean;
  experiences: ExperienceEditorValue[];
  onArchive: (experienceId: string) => void;
  onEdit: (experience: ExperienceEditorValue) => void;
  onMove: (experienceId: string, direction: 'up' | 'down') => void;
  onRestore: (experienceId: string) => void;
  pending: boolean;
  selectedExperienceId: string | null;
};

export function ExperienceList({
  disabled,
  experiences,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
  selectedExperienceId,
}: ExperienceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredExperiences = experiences.filter((experience) => {
    if (!showArchived && !experience.isActive) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        experience.title.toLowerCase().includes(query) ||
        experience.organization.toLowerCase().includes(query) ||
        experience.stageLabel.toLowerCase().includes(query) ||
        experience.period.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const activeExperiences = filteredExperiences.filter((exp) => exp.isActive);
  const archivedExperiences = filteredExperiences.filter((exp) => !exp.isActive);

  if (experiences.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No experience entries found. Create your first entry to get started.</p>
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
            placeholder="Search by title, organization, stage, period..."
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

      {filteredExperiences.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No experience entries match your search.
        </div>
      ) : (
        <div className="space-y-2">
          {activeExperiences.map((experience, index) => {
            const isSelected = experience.id === selectedExperienceId;

            return (
              <div
                key={experience.id ?? `draft-${index}`}
                className={`flex items-center justify-between gap-4 border bg-[#050812]/40 px-4 py-3 transition-all ${
                  isSelected
                    ? 'border-[#00ff88]/45 bg-[#00ff88]/5 shadow-[inset_3px_0_0_#00ff88]'
                    : 'border-cyan-400/10 hover:border-cyan-400/20 hover:bg-[#090d16]/40'
                }`}
              >
                <div className="flex flex-1 items-start gap-4">
                  <span className="pt-1 font-mono text-xs text-gray-500">#{experience.orderIndex}</span>
                  <div className="flex-1 space-y-1">
                    {experience.stageLabel && (
                      <div className="mb-1 inline-block border border-[#ffbd2e]/25 bg-[#ffbd2e]/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-[#ffbd2e]">
                        {experience.stageLabel}
                      </div>
                    )}
                    <div className="font-mono text-sm font-medium text-white">{experience.title}</div>
                    {(experience.organization || experience.period) && (
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-gray-400">
                        {experience.organization && <span>{experience.organization}</span>}
                        {experience.organization && experience.period && <span className="text-cyan-400">•</span>}
                        {experience.period && <span>{experience.period}</span>}
                      </div>
                    )}
                  </div>
                  <ExperienceStatusBadge isActive={experience.isActive} />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={disabled || pending || index === 0}
                    onClick={() => experience.id && onMove(experience.id, 'up')}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending || index === activeExperiences.length - 1}
                    onClick={() => experience.id && onMove(experience.id, 'down')}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => onEdit(experience)}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => experience.id && onArchive(experience.id)}
                    className="border border-[#ff5f56]/25 bg-[#050812]/40 p-1.5 text-[#ff5f56] transition-all hover:border-[#ff5f56]/45 hover:bg-[#ff5f56]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Archive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}

          {showArchived && archivedExperiences.length > 0 && (
            <>
              <div className="mt-4 border-t border-cyan-400/10 pt-3 font-mono text-xs text-gray-500">Archived Entries</div>
              {archivedExperiences.map((experience, index) => (
                <div
                  key={experience.id ?? `archived-${index}`}
                  className="flex items-center justify-between gap-4 border border-gray-700/20 bg-gray-900/10 px-4 py-3 opacity-60"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <span className="pt-1 font-mono text-xs text-gray-600">#{experience.orderIndex}</span>
                    <div className="flex-1 space-y-1">
                      {experience.stageLabel && (
                        <div className="mb-1 inline-block border border-gray-600/25 bg-gray-700/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-gray-500">
                          {experience.stageLabel}
                        </div>
                      )}
                      <div className="font-mono text-sm text-gray-400 line-through">{experience.title}</div>
                      {(experience.organization || experience.period) && (
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-gray-500">
                          {experience.organization && <span>{experience.organization}</span>}
                          {experience.organization && experience.period && <span>•</span>}
                          {experience.period && <span>{experience.period}</span>}
                        </div>
                      )}
                    </div>
                    <ExperienceStatusBadge isActive={experience.isActive} />
                  </div>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => experience.id && onRestore(experience.id)}
                    className="inline-flex items-center gap-1.5 border border-cyan-400/25 bg-[#050812]/40 px-3 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Restore
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
