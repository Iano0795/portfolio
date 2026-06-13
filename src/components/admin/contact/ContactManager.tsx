'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ContactForm } from './ContactForm';
import { ContactLinksList } from './ContactLinksList';
import { ContactPreviewCard } from './ContactPreviewCard';
import type { ContactLinkEditorValue, ContactMutationResult, ContactLinkPayload } from './types';

type ContactManagerProps = {
  archiveContactLink: (contactLinkId: string) => Promise<ContactMutationResult>;
  createContactLink: (payload: ContactLinkPayload) => Promise<ContactMutationResult>;
  initialContactLinks: ContactLinkEditorValue[];
  portfolio: Portfolio;
  reorderContactLinks: (orderedContactLinkIds: string[]) => Promise<ContactMutationResult>;
  restoreContactLink: (contactLinkId: string) => Promise<ContactMutationResult>;
  role: PortfolioRole;
  updateContactLink: (contactLinkId: string, payload: ContactLinkPayload) => Promise<ContactMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function sortedContactLinks(links: ContactLinkEditorValue[]) {
  return [...links].sort((a, b) => a.orderIndex - b.orderIndex || a.label.localeCompare(b.label));
}

function createDraftContactLink(nextOrderIndex: number): ContactLinkEditorValue {
  return {
    id: null,
    label: '',
    type: '',
    url: '',
    icon: '',
    orderIndex: nextOrderIndex,
    isActive: true,
  };
}

function contactLinkToPayload(link: ContactLinkEditorValue): ContactLinkPayload {
  return {
    label: link.label,
    type: link.type,
    url: link.url,
    icon: link.icon,
    orderIndex: link.orderIndex,
    isActive: link.isActive,
  };
}

function cloneContactLink(link: ContactLinkEditorValue): ContactLinkEditorValue {
  return { ...link };
}

export function ContactManager({
  archiveContactLink,
  createContactLink,
  initialContactLinks,
  portfolio,
  reorderContactLinks,
  restoreContactLink,
  role,
  updateContactLink,
}: ContactManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [contactLinks, setContactLinks] = useState(() => sortedContactLinks(initialContactLinks));
  const [editingContactLink, setEditingContactLink] = useState<ContactLinkEditorValue | null>(null);
  const [message, setMessage] = useState<ContactMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setContactLinks(sortedContactLinks(initialContactLinks));
  }, [initialContactLinks]);

  const nextOrderIndex = contactLinks.length > 0 ? Math.max(...contactLinks.map((link) => link.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: ContactMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingContactLink(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<ContactMutationResult>, closeEditor = false) => {
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

  const handleNewContactLink = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingContactLink(createDraftContactLink(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingContactLink || readOnly) {
      return;
    }

    const payload = contactLinkToPayload(editingContactLink);

    void runMutation(
      () => (editingContactLink.id ? updateContactLink(editingContactLink.id, payload) : createContactLink(payload)),
      true,
    );
  };

  const handleArchive = (contactLinkId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveContactLink(contactLinkId));
  };

  const handleRestore = (contactLinkId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreContactLink(contactLinkId));
  };

  const handleMove = (contactLinkId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    const ordered = sortedContactLinks(contactLinks.filter((link) => link.isActive));
    const currentIndex = ordered.findIndex((link) => link.id === contactLinkId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const reordered = [...ordered];
    const [link] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, link);

    setContactLinks([
      ...reordered.map((item, index) => ({ ...item, orderIndex: index })),
      ...contactLinks.filter((link) => !link.isActive),
    ]);

    void runMutation(() => reorderContactLinks(reordered.map((item) => item.id).filter((id): id is string => Boolean(id))));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">contact.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Contact Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage public contact routes, social links, and portfolio connection points.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewContactLink}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Contact Link
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
        <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Contact Links Index</div>
        <div className="p-4">
          <ContactLinksList
            contactLinks={contactLinks}
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(link) => {
              setMessage({});
              setEditingContactLink(cloneContactLink(link));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            selectedContactLinkId={editingContactLink?.id ?? null}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {editingContactLink ? (
          <ContactForm
            contactLink={editingContactLink}
            disabled={readOnly}
            mode={editingContactLink.id ? 'edit' : 'create'}
            onCancel={() => setEditingContactLink(null)}
            onChange={setEditingContactLink}
            onSave={handleSave}
            pending={pending}
          />
        ) : (
          <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
            Select a link to edit or create a new contact link.
          </div>
        )}

        <ContactPreviewCard contactLink={editingContactLink} />
      </section>
    </div>
  );
}
