'use client';

import { useState } from 'react';
import { Archive, ArrowDown, ArrowUp, Edit, Eye, EyeOff, RefreshCcw, Search } from 'lucide-react';
import { NavigationStatusBadge } from './NavigationStatusBadge';
import type { NavigationItemEditorValue } from './types';

type NavigationItemsListProps = {
  disabled: boolean;
  items: NavigationItemEditorValue[];
  onArchive: (itemId: string) => void;
  onEdit: (item: NavigationItemEditorValue) => void;
  onHide: (itemId: string) => void;
  onMove: (itemId: string, direction: 'up' | 'down') => void;
  onRestore: (itemId: string) => void;
  onShow: (itemId: string) => void;
  pending: boolean;
};

export function NavigationItemsList({
  disabled,
  items,
  onArchive,
  onEdit,
  onHide,
  onMove,
  onRestore,
  onShow,
  pending,
}: NavigationItemsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredItems = items.filter((item) => {
    if (!showArchived && !item.isActive) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(query) ||
        item.sectionId.toLowerCase().includes(query) ||
        item.systemLabel.toLowerCase().includes(query) ||
        item.command.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No navigation items found. Create your first navigation item to get started.</p>
      </div>
    );
  }

  const activeItems = filteredItems.filter((i) => i.isActive);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search navigation items..."
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

      {filteredItems.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No navigation items match your search.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item, index) => {
            const currentIndex = activeItems.findIndex((i) => i.id === item.id);
            const canMoveUp = item.isActive && currentIndex > 0;
            const canMoveDown = item.isActive && currentIndex < activeItems.length - 1;

            return (
              <div
                key={item.id || `draft-${index}`}
                className="border border-cyan-400/20 bg-[#090d16]/60 p-4 transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">#{item.orderIndex}</span>
                      <NavigationStatusBadge isActive={item.isActive} isVisible={item.isVisible} />
                      <span className="border border-cyan-400/20 bg-[#050812]/60 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                        {item.sectionId}
                      </span>
                      {item.icon && (
                        <span className="border border-gray-600/20 bg-[#050812]/60 px-2 py-0.5 font-mono text-[10px] text-gray-500">
                          icon: {item.icon}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 font-mono text-sm font-medium text-white">{item.label}</h3>
                    <div className="space-y-0.5 text-xs text-gray-400">
                      {item.systemLabel && (
                        <p className="font-mono">
                          <span className="text-gray-600">module:</span> {item.systemLabel}
                        </p>
                      )}
                      {item.command && (
                        <p className="font-mono">
                          <span className="text-gray-600">command:</span> {item.command}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      disabled={pending}
                      className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    {item.id && item.isActive && (
                      <>
                        <button
                          type="button"
                          onClick={() => item.id && onMove(item.id, 'up')}
                          disabled={disabled || pending || !canMoveUp}
                          className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => item.id && onMove(item.id, 'down')}
                          disabled={disabled || pending || !canMoveDown}
                          className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        {item.isVisible ? (
                          <button
                            type="button"
                            onClick={() => onHide(item.id!)}
                            disabled={disabled || pending}
                            className="border border-[#ffbd2e]/30 bg-[#050812]/60 p-2 text-[#ffbd2e] transition-colors hover:border-[#ffbd2e]/50 hover:bg-[#ffbd2e]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Hide"
                          >
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onShow(item.id!)}
                            disabled={disabled || pending}
                            className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Show"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </>
                    )}

                    {item.id && (
                      <>
                        {item.isActive ? (
                          <button
                            type="button"
                            onClick={() => onArchive(item.id!)}
                            disabled={disabled || pending}
                            className="border border-gray-600/30 bg-[#050812]/60 p-2 text-gray-400 transition-colors hover:border-[#ff5f56]/50 hover:bg-[#ff5f56]/10 hover:text-[#ff5f56] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRestore(item.id!)}
                            disabled={disabled || pending}
                            className="border border-gray-600/30 bg-[#050812]/60 p-2 text-gray-400 transition-colors hover:border-[#00ff88]/50 hover:bg-[#00ff88]/10 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Restore"
                          >
                            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
