import { CheckCircle2, XCircle, ShieldOff } from 'lucide-react';
import type { AccessRequestWithDetails } from '@/lib/cms/writeup-access';

type AccessRequestActionsProps = {
  request: AccessRequestWithDetails;
  onApprove: () => void;
  onReject: () => void;
  onRevoke: () => void;
};

export function AccessRequestActions({
  request,
  onApprove,
  onReject,
  onRevoke,
}: AccessRequestActionsProps) {
  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const hasActiveGrant = request.grant && !request.grant.revoked_at;

  return (
    <div className="flex flex-wrap gap-3 border-t border-gray-600/35 pt-4">
      {isPending && (
        <>
          <button
            onClick={onApprove}
            className="flex items-center gap-2 rounded border border-green-500/45 bg-green-500/10 px-4 py-2 font-mono text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/20"
          >
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            Approve Request
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-2 rounded border border-red-500/45 bg-red-500/10 px-4 py-2 font-mono text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
            Reject Request
          </button>
        </>
      )}

      {isApproved && hasActiveGrant && (
        <button
          onClick={onRevoke}
          className="flex items-center gap-2 rounded border border-orange-500/45 bg-orange-500/10 px-4 py-2 font-mono text-xs font-semibold text-orange-400 transition-colors hover:bg-orange-500/20"
        >
          <ShieldOff className="h-3.5 w-3.5" strokeWidth={1.8} />
          Revoke Grant
        </button>
      )}

      {!isPending && !hasActiveGrant && (
        <div className="rounded border border-gray-500/35 bg-gray-500/10 px-4 py-2">
          <p className="font-mono text-xs text-gray-400">No actions available</p>
        </div>
      )}
    </div>
  );
}
