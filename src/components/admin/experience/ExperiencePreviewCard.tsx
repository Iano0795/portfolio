'use client';

import { Briefcase } from 'lucide-react';
import type { ExperienceEditorValue } from './types';

type ExperiencePreviewCardProps = {
  experience: ExperienceEditorValue | null;
};

export function ExperiencePreviewCard({ experience }: ExperiencePreviewCardProps) {
  if (!experience) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-700" aria-hidden="true" />
          <p className="font-mono text-xs text-gray-500">No experience entry selected</p>
        </div>
      </div>
    );
  }

  const hasContent = experience.title || experience.organization || experience.description;

  if (!hasContent) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-600" aria-hidden="true" />
          <p className="font-mono text-xs text-gray-500">Preview will appear as you type</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Entry Preview</div>

      <div className="space-y-4 p-4">
        {experience.stageLabel && (
          <div className="inline-block border border-[#ffbd2e]/30 bg-[#ffbd2e]/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-[#ffbd2e]">
            {experience.stageLabel}
          </div>
        )}

        {experience.title && <h3 className="text-lg font-bold text-white">{experience.title}</h3>}

        {(experience.organization || experience.period) && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm text-gray-400">
            {experience.organization && <span>{experience.organization}</span>}
            {experience.organization && experience.period && <span className="text-cyan-400">•</span>}
            {experience.period && <span>{experience.period}</span>}
          </div>
        )}

        {experience.description && <p className="text-sm leading-relaxed text-gray-300">{experience.description}</p>}

        {experience.achievements.length > 0 && experience.achievements.some((item) => item.value.trim()) && (
          <div className="space-y-2">
            <div className="border-t border-cyan-400/10 pt-3 font-mono text-xs text-cyan-400">Achievements</div>
            <ul className="space-y-1.5 font-mono text-xs text-gray-300">
              {experience.achievements
                .filter((item) => item.value.trim())
                .map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <span className="text-cyan-400">›</span>
                    <span>{item.value}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
