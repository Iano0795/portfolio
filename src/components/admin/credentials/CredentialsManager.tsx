'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { CredentialForm } from './CredentialForm';
import { CredentialPreviewCard } from './CredentialPreviewCard';
import { CredentialsList } from './CredentialsList';
import type { CredentialEditorValue, CredentialMutationResult, CredentialPayload, EditableCredentialSkill } from './types';

type CredentialsManagerProps = {
  archiveCredential: (credentialId: string) => Promise<CredentialMutationResult>;
  createCredential: (payload: CredentialPayload) => Promise<CredentialMutationResult>;
  initialCredentials: CredentialEditorValue[];
  portfolio: Portfolio;
  reorderCredentials: (orderedCredentialIds: string[]) => Promise<CredentialMutationResult>;
  restoreCredential: (credentialId: string) => Promise<CredentialMutationResult>;
  role: PortfolioRole;
  updateCredential: (credentialId: string, payload: CredentialPayload) => Promise<CredentialMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function createSkill(value: string): EditableCredentialSkill {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

function cloneCredential(credential: CredentialEditorValue): CredentialEditorValue {
  return {
    ...credential,
    skills: credential.skills.map((skill) => createSkill(skill.value)),
  };
}

function sortedCredentials(credentials: CredentialEditorValue[]) {
  return [...credentials].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftCredential(nextOrderIndex: number): CredentialEditorValue {
  return {
    id: null,
    title: '',
    issuer: '',
    credentialType: '',
    category: '',
    description: '',
    issuedAt: '',
    expiresAt: '',
    credentialId: '',
    credentialUrl: '',
    imageUrl: '',
    skills: [],
    orderIndex: nextOrderIndex,
    isFeatured: false,
    isActive: true,
  };
}

function credentialToPayload(credential: CredentialEditorValue): CredentialPayload {
  return {
    title: credential.title,
    issuer: credential.issuer,
    credentialType: credential.credentialType,
    category: credential.category,
    description: credential.description,
    issuedAt: credential.issuedAt,
    expiresAt: credential.expiresAt,
    credentialId: credential.credentialId,
    credentialUrl: credential.credentialUrl,
    imageUrl: credential.imageUrl,
    skills: credential.skills.map((skill) => skill.value),
    orderIndex: credential.orderIndex,
    isFeatured: credential.isFeatured,
    isActive: credential.isActive,
  };
}

export function CredentialsManager({
  archiveCredential,
  createCredential,
  initialCredentials,
  portfolio,
  reorderCredentials,
  restoreCredential,
  role,
  updateCredential,
}: CredentialsManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [credentials, setCredentials] = useState(() => sortedCredentials(initialCredentials));
  const [editingCredential, setEditingCredential] = useState<CredentialEditorValue | null>(null);
  const [message, setMessage] = useState<CredentialMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCredentials(sortedCredentials(initialCredentials));
  }, [initialCredentials]);

  const readOnly = !manager;
  const nextOrderIndex = credentials.length > 0 ? Math.max(...credentials.map((credential) => credential.orderIndex)) + 1 : 0;

  const finishMutation = (result: CredentialMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingCredential(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<CredentialMutationResult>, closeEditor = false) => {
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

  const handleNewCredential = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingCredential(createDraftCredential(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingCredential || readOnly) {
      return;
    }

    const payload = credentialToPayload(editingCredential);

    void runMutation(
      () => (editingCredential.id ? updateCredential(editingCredential.id, payload) : createCredential(payload)),
      true,
    );
  };

  const handleArchive = (credentialId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveCredential(credentialId));
  };

  const handleRestore = (credentialId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreCredential(credentialId));
  };

  const handleMove = (credentialId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    const ordered = sortedCredentials(credentials).filter((credential) => credential.isActive);
    const currentIndex = ordered.findIndex((credential) => credential.id === credentialId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const reordered = [...ordered];
    const [credential] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, credential);
    setCredentials((current) => {
      const reorderedById = new Map(reordered.map((item, index) => [item.id, { ...item, orderIndex: index }]));

      return sortedCredentials(current.map((item) => (item.id && reorderedById.has(item.id) ? reorderedById.get(item.id)! : item)));
    });

    void runMutation(() => reorderCredentials(reordered.map((item) => item.id).filter((id): id is string => Boolean(id))));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">credentials.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Credentials Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage certifications, badges, training records, and professional credentials.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewCredential}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Credential
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
        <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Credential Index</div>
        <div className="p-4">
          <CredentialsList
            credentials={credentials}
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(credential) => {
              setMessage({});
              setEditingCredential(cloneCredential(credential));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            selectedCredentialId={editingCredential?.id ?? null}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {editingCredential ? (
          <CredentialForm
            credential={editingCredential}
            disabled={readOnly}
            mode={editingCredential.id ? 'edit' : 'create'}
            onCancel={() => setEditingCredential(null)}
            onChange={setEditingCredential}
            onSave={handleSave}
            pending={pending}
          />
        ) : (
          <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
            Select Edit on a credential or start a new credential record.
          </div>
        )}

        <CredentialPreviewCard credential={editingCredential} />
      </section>
    </div>
  );
}
