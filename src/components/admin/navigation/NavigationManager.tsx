'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { NavigationForm } from './NavigationForm';
import { NavigationItemsList } from './NavigationItemsList';
import type { NavigationItemEditorValue, NavigationItemMutationResult, NavigationItemPayload } from './types';

type NavigationManagerProps = {
  archiveNavigationItem: (itemId: string) => Promise<NavigationItemMutationResult>;
  createNavigationItem: (payload: NavigationItemPayload) => Promise<NavigationItemMutationResult>;
  hideNavigationItem: (itemId: string) => Promise<NavigationItemMutationResult>;
  initialItems: NavigationItemEditorValue[];
  portfolio: Portfolio;
  reorderNavigationItems: (itemId: string, direction: 'up' | 'down') => Promise<NavigationItemMutationResult>;
  restoreNavigationItem: (itemId: string) => Promise<NavigationItemMutationResult>;
  role: PortfolioRole;
  showNavigationItem: (itemId: string) => Promise<NavigationItemMutationResult>;
  updateNavigationItem: (itemId: string, payload: NavigationItemPayload) => Promise<NavigationItemMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function sortedItems(items: NavigationItemEditorValue[]) {
  return [...items].sort((a, b) => a.orderIndex - b.orderIndex || a.label.localeCompare(b.label));
}

function createDraftItem(nextOrderIndex: number): NavigationItemEditorValue {
  return {
    id: null,
    sectionId: '',
    label: '',
    systemLabel: '',
    command: '',
    icon: '',
    orderIndex: nextOrderIndex,
    isVisible: true,
    isActive: true,
  };
}

function itemToPayload(item: NavigationItemEditorValue): NavigationItemPayload {
  return {
    sectionId: item.sectionId,
    label: item.label,
    systemLabel: item.systemLabel,
    command: item.command,
    icon: item.icon,
    orderIndex: item.orderIndex,
    isVisible: item.isVisible,
    isActive: item.isActive,
  };
}

function cloneItem(item: NavigationItemEditorValue): NavigationItemEditorValue {
  return { ...item };
}

export function NavigationManager({
  archiveNavigationItem,
  createNavigationItem,
  hideNavigationItem,
  initialItems,
  portfolio,
  reorderNavigationItems,
  restoreNavigationItem,
  role,
  showNavigationItem,
  updateNavigationItem,
}: NavigationManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [items, setItems] = useState(() => sortedItems(initialItems));
  const [editingItem, setEditingItem] = useState<NavigationItemEditorValue | null>(null);
  const [message, setMessage] = useState<NavigationItemMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setItems(sortedItems(initialItems));
  }, [initialItems]);

  const nextOrderIndex = items.length > 0 ? Math.max(...items.map((i) => i.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: NavigationItemMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingItem(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<NavigationItemMutationResult>, closeEditor = false) => {
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

  const handleNewItem = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingItem(createDraftItem(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingItem || readOnly) {
      return;
    }

    const payload = itemToPayload(editingItem);

    void runMutation(
      () => (editingItem.id ? updateNavigationItem(editingItem.id, payload) : createNavigationItem(payload)),
      true,
    );
  };

  const handleArchive = (itemId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveNavigationItem(itemId));
  };

  const handleRestore = (itemId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreNavigationItem(itemId));
  };

  const handleHide = (itemId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => hideNavigationItem(itemId));
  };

  const handleShow = (itemId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => showNavigationItem(itemId));
  };

  const handleMove = (itemId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    void runMutation(() => reorderNavigationItems(itemId, direction));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">navigation.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Navigation Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage visible portfolio modules, labels, commands, and navigation order.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewItem}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Navigation Item
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="border-b border-cyan-400/10 pb-2 font-mono text-xs text-cyan-400">Navigation Index</div>
          <NavigationItemsList
            items={items}
            disabled={readOnly}
            onArchive={handleArchive}
            onEdit={(item) => {
              setMessage({});
              setEditingItem(cloneItem(item));
            }}
            onHide={handleHide}
            onMove={handleMove}
            onRestore={handleRestore}
            onShow={handleShow}
            pending={pending}
          />
        </section>

        <aside>
          {editingItem ? (
            <NavigationForm
              item={editingItem}
              disabled={readOnly}
              mode={editingItem.id ? 'edit' : 'create'}
              onCancel={() => setEditingItem(null)}
              onChange={setEditingItem}
              onSave={handleSave}
              pending={pending}
            />
          ) : (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
              Select a navigation item to edit or create a new navigation record.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
