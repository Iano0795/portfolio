"use client";

import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import type { AccessRequestWithDetails } from '@/lib/cms/writeup-access';
import type { WriteupAccessRequestStatus } from '@/types/portfolio';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';
import { GrantStatusBadge } from './GrantStatusBadge';

type AccessRequestsListProps = {
  requests: AccessRequestWithDetails[];
  onSelectRequest: (request: AccessRequestWithDetails) => void;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AccessRequestsList({ requests, onSelectRequest }: AccessRequestsListProps) {
  const [statusFilter, setStatusFilter] = useState<WriteupAccessRequestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = request.requester_name?.toLowerCase().includes(query);
      const matchesEmail = request.requester_email?.toLowerCase().includes(query);
      const matchesWriteup = request.writeup_title?.toLowerCase().includes(query);
      return matchesName || matchesEmail || matchesWriteup;
    }

    return true;
  });

  // Count by status
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-yellow-500/35 bg-yellow-500/10 p-3">
          <p className="font-mono text-xs text-yellow-400">Pending</p>
          <p className="mt-1 font-mono text-2xl font-bold text-yellow-300">{counts.pending}</p>
        </div>
        <div className="rounded border border-green-500/35 bg-green-500/10 p-3">
          <p className="font-mono text-xs text-green-400">Approved</p>
          <p className="mt-1 font-mono text-2xl font-bold text-green-300">{counts.approved}</p>
        </div>
        <div className="rounded border border-red-500/35 bg-red-500/10 p-3">
          <p className="font-mono text-xs text-red-400">Rejected</p>
          <p className="mt-1 font-mono text-2xl font-bold text-red-300">{counts.rejected}</p>
        </div>
        <div className="rounded border border-gray-500/35 bg-gray-500/10 p-3">
          <p className="font-mono text-xs text-gray-400">Total</p>
          <p className="mt-1 font-mono text-2xl font-bold text-gray-300">{counts.all}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" strokeWidth={1.8} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or writeup..."
              className="w-full rounded border border-gray-600/35 bg-[#050812]/55 py-2 pl-10 pr-3 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded border px-3 py-2 font-mono text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? 'border-cyan-400/45 bg-cyan-400/10 text-cyan-400'
                  : 'border-gray-600/35 bg-gray-600/10 text-gray-400 hover:border-gray-500/45 hover:bg-gray-500/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-8 text-center">
          <p className="font-mono text-sm text-gray-400">
            {searchQuery || statusFilter !== 'all'
              ? 'No requests match your filters'
              : 'No access requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="group rounded border border-gray-600/35 bg-[#050812]/55 p-4 transition-all hover:border-cyan-400/35 hover:bg-cyan-400/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <AccessRequestStatusBadge status={request.status} />
                    <GrantStatusBadge grant={request.grant || null} />
                  </div>
                  
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-cyan-400">
                      {request.writeup_title || 'Unknown Writeup'}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      Slug: <span className="text-cyan-300">{request.writeup_slug}</span>
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Requester</p>
                      <p className="mt-0.5 font-mono text-xs text-gray-300">
                        {request.requester_name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-cyan-300">
                        {request.requester_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Requested</p>
                      <p className="mt-0.5 font-mono text-xs text-gray-300">
                        {formatDate(request.created_at)}
                      </p>
                      {request.reviewed_at && (
                        <p className="mt-0.5 font-mono text-xs text-gray-500">
                          Reviewed: {formatDate(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {request.requester_reason && (
                    <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-2">
                      <p className="text-xs text-gray-500">Reason (preview)</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400">
                        {request.requester_reason}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectRequest(request)}
                  className="flex items-center gap-2 rounded border border-cyan-400/45 bg-cyan-400/10 px-3 py-2 font-mono text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-400/20"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
