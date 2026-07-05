'use client';

import { useState } from 'react';
import { Search, Edit, Trash2, ArrowUp, ArrowDown, RotateCcw, ExternalLink } from 'lucide-react';
import { ContactStatusBadge } from './ContactStatusBadge';
import type { ContactLinkEditorValue } from './types';

type ContactLinksListProps = {
  contactLinks: ContactLinkEditorValue[];
  disabled: boolean;
  onArchive: (contactLinkId: string) => void;
  onEdit: (contactLink: ContactLinkEditorValue) => void;
  onMove: (contactLinkId: string, direction: 'up' | 'down') => void;
  onRestore: (contactLinkId: string) => void;
  pending: boolean;
  selectedContactLinkId: string | null;
};

export function ContactLinksList({
  contactLinks,
  disabled,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
  selectedContactLinkId,
}: ContactLinksListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredContactLinks = contactLinks.filter((link) => {
    if (!showArchived && !link.isActive) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        link.label.toLowerCase().includes(query) ||
        link.type.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const activeLinks = filteredContactLinks.filter((link) => link.isActive);
  const archivedLinks = filteredContactLinks.filter((link) => !link.isActive);

  if (contactLinks.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No contact links found. Create your first link to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by label, type, or URL..."
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

      {filteredContactLinks.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No contact links match your search.
        </div>
      ) : (
        <div className="space-y-2">
          {activeLinks.map((link, index) => {
            const isSelected = link.id === selectedContactLinkId;

            return (
              <div
                key={link.id ?? `draft-${index}`}
                className={`flex items-center justify-between gap-4 border bg-[#050812]/40 px-4 py-3 transition-all ${
                  isSelected
                    ? 'border-[#00ff88]/45 bg-[#00ff88]/5 shadow-[inset_3px_0_0_#00ff88]'
                    : 'border-cyan-400/10 hover:border-cyan-400/20 hover:bg-[#090d16]/40'
                }`}
              >
                <div className="flex flex-1 items-center gap-4">
                  <span className="font-mono text-xs text-gray-500">#{link.orderIndex}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-white">{link.label}</span>
                      {link.type && (
                        <span className="inline-block border border-cyan-400/20 bg-cyan-400/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-cyan-400">
                          {link.type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span className="truncate">{link.url}</span>
                    </div>
                  </div>
                  <ContactStatusBadge isActive={link.isActive} />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={disabled || pending || index === 0}
                    onClick={() => link.id && onMove(link.id, 'up')}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending || index === activeLinks.length - 1}
                    onClick={() => link.id && onMove(link.id, 'down')}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => onEdit(link)}
                    className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => link.id && onArchive(link.id)}
                    className="border border-[#ff5f56]/25 bg-[#050812]/40 p-1.5 text-[#ff5f56] transition-all hover:border-[#ff5f56]/45 hover:bg-[#ff5f56]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                    title="Archive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}

          {showArchived && archivedLinks.length > 0 && (
            <>
              <div className="mt-4 border-t border-cyan-400/10 pt-3 font-mono text-xs text-gray-500">Archived Links</div>
              {archivedLinks.map((link, index) => (
                <div
                  key={link.id ?? `archived-${index}`}
                  className="flex items-center justify-between gap-4 border border-gray-700/20 bg-gray-900/10 px-4 py-3 opacity-60"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="font-mono text-xs text-gray-600">#{link.orderIndex}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-400 line-through">{link.label}</span>
                        {link.type && (
                          <span className="inline-block border border-gray-600/20 bg-gray-700/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500">
                            {link.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        <span className="truncate">{link.url}</span>
                      </div>
                    </div>
                    <ContactStatusBadge isActive={link.isActive} />
                  </div>

                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={() => link.id && onRestore(link.id)}
                    className="inline-flex items-center gap-1.5 border border-cyan-400/25 bg-[#050812]/40 px-3 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Restore
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
