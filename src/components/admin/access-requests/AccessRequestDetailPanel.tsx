"use client";

import { useState } from 'react';
import { X, Calendar, Mail, Building2, FileText, Shield } from 'lucide-react';
import type { AccessRequestWithDetails } from '@/lib/cms/writeup-access';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';
import { GrantStatusBadge } from './GrantStatusBadge';
import { AccessRequestActions } from './AccessRequestActions';
import { ApprovalForm } from './ApprovalForm';
import { RejectionForm } from './RejectionForm';
import type { PortfolioRole } from '@/types/portfolio';

type AccessRequestDetailPanelProps = {
  request: AccessRequestWithDetails;
  role: PortfolioRole;
  portfolioSlug: string;
  onClose: () => void;
  onApprove: (data: any) => Promise<any>;
  onReject: (data: any) => Promise<any>;
  onRevoke: (data: any) => Promise<any>;
};

type ActiveForm = 'none' | 'approve' | 'reject' | 'revoke';

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccessRequestDetailPanel({
  request,
  role,
  portfolioSlug,
  onClose,
  onApprove,
  onReject,
  onRevoke,
}: AccessRequestDetailPanelProps) {
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');

  const canMutate = role !== 'viewer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-cyan-400/35 bg-[#0a0f1c] shadow-[0_0_40px_rgba(0,217,255,0.15)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/25 bg-[#0a0f1c]/95 p-4 backdrop-blur-sm">
          <h2 className="font-mono text-lg font-semibold text-cyan-400">
            Access Request Details
          </h2>
          <button
            onClick={onClose}
            className="rounded border border-gray-500/35 bg-gray-500/10 p-1.5 text-gray-400 transition-colors hover:bg-gray-500/20 hover:text-gray-300"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Status and Grant */}
          <div className="flex items-center gap-3">
            <AccessRequestStatusBadge status={request.status} />
            <GrantStatusBadge grant={request.grant || null} />
          </div>

          {/* Writeup Info */}
          <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-cyan-400" strokeWidth={1.8} />
              <div className="flex-1">
                <h3 className="font-mono text-sm font-semibold text-cyan-400">
                  {request.writeup_title || 'Unknown Writeup'}
                </h3>
                <p className="mt-1 font-mono text-xs text-gray-400">
                  Slug: <span className="text-cyan-300">{request.writeup_slug}</span>
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded border border-purple-500/35 bg-purple-500/10 px-2 py-0.5 font-mono text-xs text-purple-400">
                    {request.writeup_visibility}
                  </span>
                  <span className="rounded border border-blue-500/35 bg-blue-500/10 px-2 py-0.5 font-mono text-xs text-blue-400">
                    {request.writeup_machine_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Requester Info */}
          <div className="space-y-3">
            <h3 className="font-mono text-sm font-semibold text-cyan-400">Requester Information</h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Email
                </div>
                <p className="mt-1 font-mono text-xs text-cyan-300">{request.requester_email}</p>
              </div>

              <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Name
                </div>
                <p className="mt-1 font-mono text-xs text-cyan-300">{request.requester_name}</p>
              </div>
            </div>

            {request.requester_organization && (
              <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Organization
                </div>
                <p className="mt-1 font-mono text-xs text-cyan-300">
                  {request.requester_organization}
                </p>
              </div>
            )}

            <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                Reason for Access
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-300">
                {request.requester_reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
                Request Created
              </div>
              <p className="mt-1 font-mono text-xs text-cyan-300">
                {formatDate(request.created_at)}
              </p>
            </div>

            {request.reviewed_at && (
              <div className="rounded border border-gray-600/35 bg-[#050812]/55 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Reviewed At
                </div>
                <p className="mt-1 font-mono text-xs text-cyan-300">
                  {formatDate(request.reviewed_at)}
                </p>
              </div>
            )}
          </div>

          {/* Reviewer Note */}
          {request.reviewer_note && (
            <div className="rounded border border-yellow-500/35 bg-yellow-500/10 p-3">
              <p className="font-mono text-xs font-semibold text-yellow-400">Reviewer Note</p>
              <p className="mt-2 text-xs leading-relaxed text-yellow-300">
                {request.reviewer_note}
              </p>
            </div>
          )}

          {/* Grant Details */}
          {request.grant && (
            <div className="rounded-md border border-green-500/25 bg-green-500/5 p-4">
              <h3 className="font-mono text-sm font-semibold text-green-400">Grant Details</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Token Label</p>
                  <p className="mt-1 font-mono text-xs text-green-300">
                    {request.grant.token_label || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="mt-1 font-mono text-xs text-green-300">
                    {formatDate(request.grant.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expires</p>
                  <p className="mt-1 font-mono text-xs text-green-300">
                    {request.grant.expires_at ? formatDate(request.grant.expires_at) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Views Used</p>
                  <p className="mt-1 font-mono text-xs text-green-300">
                    {request.grant.views_used} / {request.grant.max_views ?? '∞'}
                  </p>
                </div>
              </div>
              {request.grant.revoked_at && (
                <div className="mt-3 rounded border border-red-500/35 bg-red-500/10 p-3">
                  <p className="font-mono text-xs font-semibold text-red-400">
                    Revoked: {formatDate(request.grant.revoked_at)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Forms */}
          {activeForm === 'approve' && (
            <div className="rounded-md border border-cyan-400/35 bg-[#050812]/55 p-4">
              <ApprovalForm
                requestId={request.id}
                writeupTitle={request.writeup_title || 'Unknown'}
                requesterEmail={request.requester_email}
                onApprove={onApprove}
                onCancel={() => setActiveForm('none')}
              />
            </div>
          )}

          {activeForm === 'reject' && (
            <div className="rounded-md border border-cyan-400/35 bg-[#050812]/55 p-4">
              <RejectionForm
                requestId={request.id}
                writeupTitle={request.writeup_title || 'Unknown'}
                requesterEmail={request.requester_email}
                onReject={onReject}
                onCancel={() => setActiveForm('none')}
              />
            </div>
          )}

          {/* Actions */}
          {activeForm === 'none' && canMutate && (
            <AccessRequestActions
              request={request}
              onApprove={() => setActiveForm('approve')}
              onReject={() => setActiveForm('reject')}
              onRevoke={async () => {
                if (request.grant && confirm('Are you sure you want to revoke this grant?')) {
                  await onRevoke({ grantId: request.grant.id });
                }
              }}
            />
          )}

          {!canMutate && (
            <div className="rounded border border-gray-500/35 bg-gray-500/10 p-3 text-center">
              <p className="font-mono text-xs text-gray-400">
                Read-only access. You cannot modify this request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
