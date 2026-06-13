'use client';

import { useState } from 'react';
import { Archive, ArrowDown, ArrowUp, Edit, RefreshCcw, Search } from 'lucide-react';
import { CapabilityStatusBadge } from './CapabilityStatusBadge';
import type { CapabilityEditorValue } from './types';

type CapabilitiesListProps = {
  capabilities: CapabilityEditorValue[];
  disabled: boolean;
  onArchive: (capabilityId: string) => void;
  onEdit: (capability: CapabilityEditorValue) => void;
  onMove: (capabilityId: string, direction: 'up' | 'down') => void;
  onRestore: (capabilityId: string) => void;
  pending: boolean;
};

export function CapabilitiesList({
  capabilities,
  disabled,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
}: CapabilitiesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredCapabilities = capabilities.filter((capability) => {
    if (!showArchived && !capability.isActive) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        capability.title.toLowerCase().includes(query) ||
        capability.description.toLowerCase().includes(query) ||
        capability.icon.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (capabilities.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No capabilities found. Create your first capability to get started.</p>
      </div>
    );
  }

  const activeCapabilities = filteredCapabilities.filter((c) => c.isActive);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search capabilities..."
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

      {filteredCapabilities.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No capabilities match your search.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCapabilities.map((capability, index) => {
            const currentIndex = activeCapabilities.findIndex((c) => c.id === capability.id);
            const canMoveUp = capability.isActive && currentIndex > 0;
            const canMoveDown = capability.isActive && currentIndex < activeCapabilities.length - 1;

            return (
              <div
                key={capability.id || `draft-${index}`}
                className="border border-cyan-400/20 bg-[#090d16]/60 p-4 transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">#{capability.orderIndex}</span>
                      <CapabilityStatusBadge isActive={capability.isActive} />
                      {capability.icon && (
                        <span className="border border-cyan-400/20 bg-[#050812]/60 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                          {capability.icon}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 font-mono text-sm font-medium text-white">{capability.title}</h3>
                    {capability.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
                        {capability.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(capability)}
                      disabled={pending}
                      className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    {capability.id && (
                      <>
                        {capability.isActive && (
                          <>
                            <button
                              type="button"
                              onClick={() => capability.id && onMove(capability.id, 'up')}
                              disabled={disabled || pending || !canMoveUp}
                              className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Move up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => capability.id && onMove(capability.id, 'down')}
                              disabled={disabled || pending || !canMoveDown}
                              className="border border-cyan-400/30 bg-[#050812]/60 p-2 text-cyan-400 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </>
                        )}

                        {capability.isActive ? (
                          <button
                            type="button"
                            onClick={() => onArchive(capability.id!)}
                            disabled={disabled || pending}
                            className="border border-gray-600/30 bg-[#050812]/60 p-2 text-gray-400 transition-colors hover:border-[#ff5f56]/50 hover:bg-[#ff5f56]/10 hover:text-[#ff5f56] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRestore(capability.id!)}
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
