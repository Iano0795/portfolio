'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { SkillForm } from './SkillForm';
import { SkillsList } from './SkillsList';
import type { SkillEditorValue, SkillMutationResult, SkillPayload } from './types';

type SkillsManagerProps = {
  archiveSkill: (skillId: string) => Promise<SkillMutationResult>;
  createSkill: (payload: SkillPayload) => Promise<SkillMutationResult>;
  initialSkills: SkillEditorValue[];
  portfolio: Portfolio;
  reorderSkills: (skillId: string, direction: 'up' | 'down') => Promise<SkillMutationResult>;
  restoreSkill: (skillId: string) => Promise<SkillMutationResult>;
  role: PortfolioRole;
  updateSkill: (skillId: string, payload: SkillPayload) => Promise<SkillMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function sortedSkills(skills: SkillEditorValue[]) {
  return [...skills].sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;
    return a.orderIndex - b.orderIndex || a.name.localeCompare(b.name);
  });
}

function createDraftSkill(nextOrderIndex: number): SkillEditorValue {
  return {
    id: null,
    name: '',
    category: '',
    level: '',
    orderIndex: nextOrderIndex,
    isActive: true,
  };
}

function skillToPayload(skill: SkillEditorValue): SkillPayload {
  return {
    name: skill.name,
    category: skill.category,
    level: skill.level,
    orderIndex: skill.orderIndex,
    isActive: skill.isActive,
  };
}

function cloneSkill(skill: SkillEditorValue): SkillEditorValue {
  return { ...skill };
}

export function SkillsManager({
  archiveSkill,
  createSkill,
  initialSkills,
  portfolio,
  reorderSkills,
  restoreSkill,
  role,
  updateSkill,
}: SkillsManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [skills, setSkills] = useState(() => sortedSkills(initialSkills));
  const [editingSkill, setEditingSkill] = useState<SkillEditorValue | null>(null);
  const [message, setMessage] = useState<SkillMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSkills(sortedSkills(initialSkills));
  }, [initialSkills]);

  const nextOrderIndex = skills.length > 0 ? Math.max(...skills.map((skill) => skill.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const existingCategories = Array.from(new Set(skills.map((skill) => skill.category).filter(Boolean))).sort();

  const finishMutation = (result: SkillMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingSkill(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<SkillMutationResult>, closeEditor = false) => {
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

  const handleNewSkill = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingSkill(createDraftSkill(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingSkill || readOnly) {
      return;
    }

    const payload = skillToPayload(editingSkill);

    void runMutation(
      () => (editingSkill.id ? updateSkill(editingSkill.id, payload) : createSkill(payload)),
      true,
    );
  };

  const handleArchive = (skillId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveSkill(skillId));
  };

  const handleRestore = (skillId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreSkill(skillId));
  };

  const handleMove = (skillId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    void runMutation(() => reorderSkills(skillId, direction));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">skills.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Skills Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage toolchain, technical categories, and visible skills.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewSkill}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Skill
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="space-y-4">
          <div className="border-b border-cyan-400/10 pb-2 font-mono text-xs text-cyan-400">Skill Index</div>
          <SkillsList
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(skill) => {
              setMessage({});
              setEditingSkill(cloneSkill(skill));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            skills={skills}
          />
        </section>

        <aside>
          {editingSkill ? (
            <SkillForm
              disabled={readOnly}
              existingCategories={existingCategories}
              mode={editingSkill.id ? 'edit' : 'create'}
              onCancel={() => setEditingSkill(null)}
              onChange={setEditingSkill}
              onSave={handleSave}
              pending={pending}
              skill={editingSkill}
            />
          ) : (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
              Select a skill to edit or create a new skill record.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
