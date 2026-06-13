'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ProcessForm } from './ProcessForm';
import { ProcessList } from './ProcessList';
import type { ProcessStepEditorValue, ProcessStepMutationResult, ProcessStepPayload } from './types';

type ProcessManagerProps = {
  archiveProcessStep: (stepId: string) => Promise<ProcessStepMutationResult>;
  createProcessStep: (payload: ProcessStepPayload) => Promise<ProcessStepMutationResult>;
  initialSteps: ProcessStepEditorValue[];
  portfolio: Portfolio;
  reorderProcessSteps: (stepId: string, direction: 'up' | 'down') => Promise<ProcessStepMutationResult>;
  restoreProcessStep: (stepId: string) => Promise<ProcessStepMutationResult>;
  role: PortfolioRole;
  updateProcessStep: (stepId: string, payload: ProcessStepPayload) => Promise<ProcessStepMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function sortedSteps(steps: ProcessStepEditorValue[]) {
  return [...steps].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftStep(nextOrderIndex: number): ProcessStepEditorValue {
  return {
    id: null,
    title: '',
    description: '',
    command: '',
    label: '',
    orderIndex: nextOrderIndex,
    isActive: true,
  };
}

function stepToPayload(step: ProcessStepEditorValue): ProcessStepPayload {
  return {
    title: step.title,
    description: step.description,
    command: step.command,
    label: step.label,
    orderIndex: step.orderIndex,
    isActive: step.isActive,
  };
}

function cloneStep(step: ProcessStepEditorValue): ProcessStepEditorValue {
  return { ...step };
}

export function ProcessManager({
  archiveProcessStep,
  createProcessStep,
  initialSteps,
  portfolio,
  reorderProcessSteps,
  restoreProcessStep,
  role,
  updateProcessStep,
}: ProcessManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [steps, setSteps] = useState(() => sortedSteps(initialSteps));
  const [editingStep, setEditingStep] = useState<ProcessStepEditorValue | null>(null);
  const [message, setMessage] = useState<ProcessStepMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSteps(sortedSteps(initialSteps));
  }, [initialSteps]);

  const nextOrderIndex = steps.length > 0 ? Math.max(...steps.map((s) => s.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: ProcessStepMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingStep(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<ProcessStepMutationResult>, closeEditor = false) => {
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

  const handleNewStep = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingStep(createDraftStep(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingStep || readOnly) {
      return;
    }

    const payload = stepToPayload(editingStep);

    void runMutation(
      () => (editingStep.id ? updateProcessStep(editingStep.id, payload) : createProcessStep(payload)),
      true,
    );
  };

  const handleArchive = (stepId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveProcessStep(stepId));
  };

  const handleRestore = (stepId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreProcessStep(stepId));
  };

  const handleMove = (stepId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    void runMutation(() => reorderProcessSteps(stepId, direction));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">process.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Process Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage the workflow/pipeline steps shown on this portfolio.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewStep}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Process Step
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
          <div className="border-b border-cyan-400/10 pb-2 font-mono text-xs text-cyan-400">Process Pipeline</div>
          <ProcessList
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(step) => {
              setMessage({});
              setEditingStep(cloneStep(step));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            steps={steps}
          />
        </section>

        <aside>
          {editingStep ? (
            <ProcessForm
              disabled={readOnly}
              mode={editingStep.id ? 'edit' : 'create'}
              onCancel={() => setEditingStep(null)}
              onChange={setEditingStep}
              onSave={handleSave}
              pending={pending}
              step={editingStep}
            />
          ) : (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
              Select a process step to edit or create a new process step record.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
