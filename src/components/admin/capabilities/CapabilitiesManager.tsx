'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { CapabilityForm } from './CapabilityForm';
import { CapabilitiesList } from './CapabilitiesList';
import type { CapabilityEditorValue, CapabilityMutationResult, CapabilityPayload } from './types';

type CapabilitiesManagerProps = {
  archiveCapability: (capabilityId: string) => Promise<CapabilityMutationResult>;
  createCapability: (payload: CapabilityPayload) => Promise<CapabilityMutationResult>;
  initialCapabilities: CapabilityEditorValue[];
  portfolio: Portfolio;
  reorderCapabilities: (capabilityId: string, direction: 'up' | 'down') => Promise<CapabilityMutationResult>;
  restoreCapability: (capabilityId: string) => Promise<CapabilityMutationResult>;
  role: PortfolioRole;
  updateCapability: (capabilityId: string, payload: CapabilityPayload) => Promise<CapabilityMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function sortedCapabilities(capabilities: CapabilityEditorValue[]) {
  return [...capabilities].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftCapability(nextOrderIndex: number): CapabilityEditorValue {
  return {
    id: null,
    title: '',
    description: '',
    icon: '',
    orderIndex: nextOrderIndex,
    isActive: true,
  };
}

function capabilityToPayload(capability: CapabilityEditorValue): CapabilityPayload {
  return {
    title: capability.title,
    description: capability.description,
    icon: capability.icon,
    orderIndex: capability.orderIndex,
    isActive: capability.isActive,
  };
}

function cloneCapability(capability: CapabilityEditorValue): CapabilityEditorValue {
  return { ...capability };
}

export function CapabilitiesManager({
  archiveCapability,
  createCapability,
  initialCapabilities,
  portfolio,
  reorderCapabilities,
  restoreCapability,
  role,
  updateCapability,
}: CapabilitiesManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [capabilities, setCapabilities] = useState(() => sortedCapabilities(initialCapabilities));
  const [editingCapability, setEditingCapability] = useState<CapabilityEditorValue | null>(null);
  const [message, setMessage] = useState<CapabilityMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCapabilities(sortedCapabilities(initialCapabilities));
  }, [initialCapabilities]);

  const nextOrderIndex = capabilities.length > 0 ? Math.max(...capabilities.map((c) => c.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: CapabilityMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingCapability(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<CapabilityMutationResult>, closeEditor = false) => {
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

  const handleNewCapability = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingCapability(createDraftCapability(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingCapability || readOnly) {
      return;
    }

    const payload = capabilityToPayload(editingCapability);

    void runMutation(
      () => (editingCapability.id ? updateCapability(editingCapability.id, payload) : createCapability(payload)),
      true,
    );
  };

  const handleArchive = (capabilityId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveCapability(capabilityId));
  };

  const handleRestore = (capabilityId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreCapability(capabilityId));
  };

  const handleMove = (capabilityId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    void runMutation(() => reorderCapabilities(capabilityId, direction));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">capabilities.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Capabilities Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage the capability cards that describe what this portfolio owner can do.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewCapability}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Capability
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
          <div className="border-b border-cyan-400/10 pb-2 font-mono text-xs text-cyan-400">Capability Index</div>
          <CapabilitiesList
            capabilities={capabilities}
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(capability) => {
              setMessage({});
              setEditingCapability(cloneCapability(capability));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
          />
        </section>

        <aside>
          {editingCapability ? (
            <CapabilityForm
              capability={editingCapability}
              disabled={readOnly}
              mode={editingCapability.id ? 'edit' : 'create'}
              onCancel={() => setEditingCapability(null)}
              onChange={setEditingCapability}
              onSave={handleSave}
              pending={pending}
            />
          ) : (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
              Select a capability to edit or create a new capability record.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
