'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ExperienceForm } from './ExperienceForm';
import { ExperienceList } from './ExperienceList';
import { ExperiencePreviewCard } from './ExperiencePreviewCard';
import type { EditableListItem, ExperienceEditorValue, ExperienceMutationResult, ExperiencePayload } from './types';

type ExperienceManagerProps = {
  archiveExperience: (experienceId: string) => Promise<ExperienceMutationResult>;
  createExperience: (payload: ExperiencePayload) => Promise<ExperienceMutationResult>;
  initialExperiences: ExperienceEditorValue[];
  portfolio: Portfolio;
  reorderExperiences: (orderedExperienceIds: string[]) => Promise<ExperienceMutationResult>;
  restoreExperience: (experienceId: string) => Promise<ExperienceMutationResult>;
  role: PortfolioRole;
  updateExperience: (experienceId: string, payload: ExperiencePayload) => Promise<ExperienceMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

function sortedExperiences(experiences: ExperienceEditorValue[]) {
  return [...experiences].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftExperience(nextOrderIndex: number): ExperienceEditorValue {
  return {
    id: null,
    stageLabel: '',
    title: '',
    organization: '',
    period: '',
    description: '',
    achievements: [],
    orderIndex: nextOrderIndex,
    isActive: true,
  };
}

function experienceToPayload(experience: ExperienceEditorValue): ExperiencePayload {
  return {
    stageLabel: experience.stageLabel,
    title: experience.title,
    organization: experience.organization,
    period: experience.period,
    description: experience.description,
    achievements: experience.achievements.map((item) => item.value),
    orderIndex: experience.orderIndex,
    isActive: experience.isActive,
  };
}

function cloneExperience(experience: ExperienceEditorValue): ExperienceEditorValue {
  return {
    ...experience,
    achievements: experience.achievements.map((item) => createItem(item.value)),
  };
}

export function ExperienceManager({
  archiveExperience,
  createExperience,
  initialExperiences,
  portfolio,
  reorderExperiences,
  restoreExperience,
  role,
  updateExperience,
}: ExperienceManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [experiences, setExperiences] = useState(() => sortedExperiences(initialExperiences));
  const [editingExperience, setEditingExperience] = useState<ExperienceEditorValue | null>(null);
  const [message, setMessage] = useState<ExperienceMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setExperiences(sortedExperiences(initialExperiences));
  }, [initialExperiences]);

  const nextOrderIndex = experiences.length > 0 ? Math.max(...experiences.map((exp) => exp.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: ExperienceMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingExperience(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<ExperienceMutationResult>, closeEditor = false) => {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage({});

    try {
      finishMutation(await mutation(), closeEditor);
    } finally {
      setPending(false);
    }
  };

  const handleNewExperience = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingExperience(createDraftExperience(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingExperience || readOnly) {
      return;
    }

    const payload = experienceToPayload(editingExperience);

    void runMutation(
      () => (editingExperience.id ? updateExperience(editingExperience.id, payload) : createExperience(payload)),
      true,
    );
  };

  const handleArchive = (experienceId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveExperience(experienceId));
  };

  const handleRestore = (experienceId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreExperience(experienceId));
  };

  const handleMove = (experienceId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    const ordered = sortedExperiences(experiences.filter((exp) => exp.isActive));
    const currentIndex = ordered.findIndex((exp) => exp.id === experienceId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const reordered = [...ordered];
    const [experience] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, experience);

    setExperiences([
      ...reordered.map((item, index) => ({ ...item, orderIndex: index })),
      ...experiences.filter((exp) => !exp.isActive),
    ]);

    void runMutation(() => reorderExperiences(reordered.map((item) => item.id).filter((id): id is string => Boolean(id))));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">experience.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Experience Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage career logs, roles, milestones, and achievement history.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewExperience}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Experience Entry
          </button>
        </div>
      </header>

      {message.error && (
        <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
          {message.error}
        </div>
      )}
      {message.success && (
        <div className="border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
          {message.success}
        </div>
      )}

      <section className="border border-cyan-400/20 bg-[#090d16]/80">
        <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Experience Index</div>
        <div className="p-4">
          <ExperienceList
            disabled={readOnly}
            experiences={experiences}
            onArchive={handleArchive}
            onEdit={(experience) => {
              setMessage({});
              setEditingExperience(cloneExperience(experience));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            selectedExperienceId={editingExperience?.id ?? null}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {editingExperience ? (
          <ExperienceForm
            disabled={readOnly}
            experience={editingExperience}
            mode={editingExperience.id ? 'edit' : 'create'}
            onCancel={() => setEditingExperience(null)}
            onChange={setEditingExperience}
            onSave={handleSave}
            pending={pending}
          />
        ) : (
          <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
            Select an entry to edit or create a new experience record.
          </div>
        )}

        <ExperiencePreviewCard experience={editingExperience} />
      </section>
    </div>
  );
}
