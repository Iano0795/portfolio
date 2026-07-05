'use client';

import { Archive, ArrowDown, ArrowUp, Pencil, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CredentialStatusBadge } from './CredentialStatusBadge';
import type { CredentialEditorValue } from './types';

type CredentialsListProps = {
  credentials: CredentialEditorValue[];
  disabled: boolean;
  onArchive: (credentialId: string) => void;
  onEdit: (credential: CredentialEditorValue) => void;
  onMove: (credentialId: string, direction: 'up' | 'down') => void;
  onRestore: (credentialId: string) => void;
  pending: boolean;
  selectedCredentialId: string | null;
};

function actionClass(disabled: boolean) {
  return `inline-flex items-center gap-1 border px-2 py-1 font-mono text-[11px] transition-colors ${
    disabled
      ? 'cursor-not-allowed border-gray-800 text-gray-700'
      : 'border-gray-700 text-gray-400 hover:border-cyan-400/35 hover:text-cyan-300'
  }`;
}

export function CredentialsList({
  credentials,
  disabled,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
  selectedCredentialId,
}: CredentialsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(credentials.map((credential) => credential.category).filter(Boolean))).sort(),
    [credentials],
  );

  const filteredCredentials = credentials.filter((credential) => {
    if (!showArchived && !credential.isActive) {
      return false;
    }

    if (categoryFilter !== 'all' && credential.category !== categoryFilter) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const query = searchQuery.toLowerCase();

    return (
      credential.title.toLowerCase().includes(query) ||
      credential.issuer.toLowerCase().includes(query) ||
      credential.credentialType.toLowerCase().includes(query) ||
      credential.category.toLowerCase().includes(query)
    );
  });

  const activeCredentials = filteredCredentials.filter((credential) => credential.isActive);
  const archivedCredentials = filteredCredentials.filter((credential) => !credential.isActive);

  if (credentials.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No credentials exist for this portfolio yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full border border-cyan-400/20 bg-[#050812]/60 py-2 pl-10 pr-3 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="border border-cyan-400/20 bg-[#050812]/60 px-3 py-2 font-mono text-sm text-gray-300 focus:border-cyan-400/40 focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 border border-cyan-400/20 bg-[#050812]/60 px-3 py-2 font-mono text-xs text-gray-400">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="h-3.5 w-3.5 accent-cyan-400"
          />
          Show archived
        </label>
      </div>

      {filteredCredentials.length === 0 ? (
        <div className="border border-cyan-400/10 bg-[#050812]/40 p-6 text-center font-mono text-sm text-gray-500">
          No credentials match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-cyan-400/10">
          <table className="w-full min-w-[1040px] text-left font-mono text-xs">
            <thead className="border-b border-gray-800 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Credential</th>
                <th className="px-4 py-3 font-medium">Type / Category</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCredentials.map((credential, index) => {
                const rowDisabled = disabled || pending || !credential.id;
                const selected = credential.id === selectedCredentialId;

                return (
                  <tr key={credential.id ?? credential.title} className={`border-b border-gray-900 last:border-0 ${selected ? 'bg-[#00ff88]/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-gray-200">{credential.title || 'Untitled credential'}</div>
                      <div className="mt-1 text-gray-600">{credential.issuer || 'issuer unset'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <div>{credential.credentialType || 'type unset'}</div>
                      <div className="mt-1 text-gray-600">{credential.category || 'category unset'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{credential.issuedAt || 'unset'}</td>
                    <td className="px-4 py-3 text-gray-400">{credential.expiresAt || 'unset'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {credential.isFeatured && <CredentialStatusBadge label="FEATURED" tone="green" />}
                        <CredentialStatusBadge label={credential.isActive ? 'ACTIVE' : 'ARCHIVED'} tone={credential.isActive ? 'cyan' : 'gray'} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{credential.orderIndex}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" disabled={pending} onClick={() => onEdit(credential)} className={actionClass(pending)}>
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          Edit
                        </button>
                        <button type="button" disabled={rowDisabled} onClick={() => credential.id && onArchive(credential.id)} className={actionClass(rowDisabled)}>
                          <Archive className="h-3 w-3" aria-hidden="true" />
                          Archive
                        </button>
                        <button type="button" disabled={rowDisabled || index === 0} onClick={() => credential.id && onMove(credential.id, 'up')} className={actionClass(rowDisabled || index === 0)}>
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          Up
                        </button>
                        <button
                          type="button"
                          disabled={rowDisabled || index === activeCredentials.length - 1}
                          onClick={() => credential.id && onMove(credential.id, 'down')}
                          className={actionClass(rowDisabled || index === activeCredentials.length - 1)}
                        >
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          Down
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {showArchived &&
                archivedCredentials.map((credential) => {
                  const rowDisabled = disabled || pending || !credential.id;

                  return (
                    <tr key={credential.id ?? credential.title} className="border-b border-gray-900 bg-gray-900/10 opacity-60 last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-gray-400 line-through">{credential.title || 'Untitled credential'}</div>
                        <div className="mt-1 text-gray-600">{credential.issuer || 'issuer unset'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{credential.credentialType || credential.category || 'unset'}</td>
                      <td className="px-4 py-3 text-gray-500">{credential.issuedAt || 'unset'}</td>
                      <td className="px-4 py-3 text-gray-500">{credential.expiresAt || 'unset'}</td>
                      <td className="px-4 py-3">
                        <CredentialStatusBadge label="ARCHIVED" tone="gray" />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{credential.orderIndex}</td>
                      <td className="px-4 py-3">
                        <button type="button" disabled={rowDisabled} onClick={() => credential.id && onRestore(credential.id)} className={actionClass(rowDisabled)}>
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          Restore
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
