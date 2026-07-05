"use client";

import { useState } from "react";
import type { AccessRequestWithDetails } from "@/lib/cms/writeup-access";
import type { Portfolio, PortfolioRole } from "@/types/portfolio";
import { AccessRequestsList } from "./AccessRequestsList";
import { AccessRequestDetailPanel } from "./AccessRequestDetailPanel";
import type {
  ApproveEmailResult,
  RejectEmailResult,
  RevokeEmailResult,
} from "@/app/admin/portfolio/[portfolioSlug]/access-requests/actions";

type ApproveServerResult =
  | {
      success: true;
      data: {
        rawToken: string;
        grantId: string;
        emailStatus: ApproveEmailResult;
      };
    }
  | { success: false; error: string };

type RejectServerResult =
  | { success: true; data: { emailStatus: RejectEmailResult } }
  | { success: false; error: string };

type RevokeServerResult =
  | { success: true; data: { emailStatus: RevokeEmailResult } }
  | { success: false; error: string };

// Flat result types the forms consume
export type FlatApproveResult = {
  success: boolean;
  error?: string;
  rawToken?: string;
  grantId?: string;
  emailStatus?: ApproveEmailResult;
};

export type FlatRejectResult = {
  success: boolean;
  error?: string;
  emailStatus?: RejectEmailResult;
};

export type FlatRevokeResult = {
  success: boolean;
  error?: string;
  emailStatus?: RevokeEmailResult;
};

type AccessRequestsManagerProps = {
  initialRequests: AccessRequestWithDetails[];
  portfolio: Portfolio;
  role: PortfolioRole;
  onApprove: (requestId: string, data: any) => Promise<ApproveServerResult>;
  onReject: (requestId: string, data: any) => Promise<RejectServerResult>;
  onRevoke: (grantId: string, data: any) => Promise<RevokeServerResult>;
};

export function AccessRequestsManager({
  initialRequests,
  portfolio,
  role,
  onApprove,
  onReject,
  onRevoke,
}: AccessRequestsManagerProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<AccessRequestWithDetails | null>(null);

  // Flatten server action results into the shape the child forms expect
  const handleApprove = async (data: any): Promise<FlatApproveResult> => {
    if (!selectedRequest)
      return { success: false, error: "No request selected" };
    const result = await onApprove(selectedRequest.id, data);
    if (!result.success) return { success: false, error: result.error };
    return {
      success: true,
      rawToken: result.data.rawToken,
      grantId: result.data.grantId,
      emailStatus: result.data.emailStatus,
    };
  };

  const handleReject = async (data: any): Promise<FlatRejectResult> => {
    if (!selectedRequest)
      return { success: false, error: "No request selected" };
    const result = await onReject(selectedRequest.id, data);
    if (!result.success) return { success: false, error: result.error };
    return {
      success: true,
      emailStatus: result.data.emailStatus,
    };
  };

  const handleRevoke = async (data: {
    grantId: string;
  }): Promise<FlatRevokeResult> => {
    const result = await onRevoke(data.grantId, {});
    if (!result.success) return { success: false, error: result.error };
    return {
      success: true,
      emailStatus: result.data.emailStatus,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-400/25 pb-4">
        <h1 className="font-mono text-2xl font-bold text-cyan-400">
          Access Requests
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Review restricted writeup access requests and manage approved grants.
        </p>
        {role === "viewer" && (
          <div className="mt-3 rounded border border-yellow-500/35 bg-yellow-500/10 p-3">
            <p className="font-mono text-xs font-semibold text-yellow-400">
              Read-only access
            </p>
            <p className="mt-1 text-xs text-yellow-300">
              You can view requests but cannot approve, reject, or revoke
              grants.
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
