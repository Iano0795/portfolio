"use client";

import { useState } from 'react';
import type { AccessRequestWithDetails } from '@/lib/cms/writeup-access';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { AccessRequestsList } from './AccessRequestsList';
import { AccessRequestDetailPanel } from './AccessRequestDetailPanel';

type AccessRequestsManagerProps = {
  initialRequests: AccessRequestWithDetails[];
  portfolio: Portfolio;
  role: PortfolioRole;
  onApprove: (requestId: string, data: any) => Promise<any>;
  onReject: (requestId: string, data: any) => Promise<any>;
  onRevoke: (grantId: string, data: any) => Promise<any>;
};

export function AccessRequestsManager({
  initialRequests,
  portfolio,
  role,
  onApprove,
  onReject,
  onRevoke,
}: AccessRequestsManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequestWithDetails | null>(null);

  const handleApprove = async (data: any) => {
    if (!selectedRequest) return { success: false, error: 'No request selected' };
    return onApprove(selectedRequest.id, data);
  };

  const handleReject = async (data: any) => {
    if (!selectedRequest) return { success: false, error: 'No request selected' };
    return onReject(selectedRequest.id, data);
  };

  const handleRevoke = async (data: { grantId: string }) => {
    return onRevoke(data.grantId, {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-400/25 pb-4">
        <h1 className="font-mono text-2xl font-bold text-cyan-400">Access Requests</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Review restricted writeup access requests and manage approved grants.
        </p>
        {role === 'viewer' && (
          <div className="mt-3 rounded border border-yellow-500/35 bg-yellow-500/10 p-3">
            <p className="font-mono text-xs font-semibold text-yellow-400">
              Read-only access
            </p>
            <p className="mt-1 text-xs text-yellow-300">
              You can view requests but cannot approve, reject, or revoke grants.
            </p>
          </div>
        )}
      </div>

      {/* Requests List */}
      <AccessRequestsList
        requests={initialRequests}
        onSelectRequest={setSelectedRequest}
      />

      {/* Detail Panel */}
      {selectedRequest && (
        <AccessRequestDetailPanel
          request={selectedRequest}
          role={role}
          portfolioSlug={portfolio.slug}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onRevoke={handleRevoke}
        />
      )}
    </div>
  );
}
