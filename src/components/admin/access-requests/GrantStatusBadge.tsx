import { Shield, ShieldAlert, ShieldOff, Clock } from 'lucide-react';

type GrantStatusBadgeProps = {
  grant: {
    revoked_at: string | null;
    expires_at: string | null;
    max_views: number | null;
    views_used: number;
  } | null;
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function isViewLimitReached(maxViews: number | null, viewsUsed: number): boolean {
  if (maxViews === null) return false;
  return viewsUsed >= maxViews;
}

export function GrantStatusBadge({ grant }: GrantStatusBadgeProps) {
  if (!grant) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-gray-500/25 bg-gray-500/5 px-2 py-1 font-mono text-xs font-medium text-gray-500">
        <ShieldOff className="h-3 w-3" strokeWidth={1.8} />
        No Grant
      </span>
    );
  }

  if (grant.revoked_at) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-red-500/35 bg-red-500/10 px-2 py-1 font-mono text-xs font-medium text-red-400">
        <ShieldAlert className="h-3 w-3" strokeWidth={1.8} />
        Revoked
      </span>
    );
  }

  if (isExpired(grant.expires_at)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-orange-500/35 bg-orange-500/10 px-2 py-1 font-mono text-xs font-medium text-orange-400">
        <Clock className="h-3 w-3" strokeWidth={1.8} />
        Expired
      </span>
    );
  }

  if (isViewLimitReached(grant.max_views, grant.views_used)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-orange-500/35 bg-orange-500/10 px-2 py-1 font-mono text-xs font-medium text-orange-400">
        <ShieldAlert className="h-3 w-3" strokeWidth={1.8} />
        View Limit Reached
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-green-500/35 bg-green-500/10 px-2 py-1 font-mono text-xs font-medium text-green-400">
      <Shield className="h-3 w-3" strokeWidth={1.8} />
      Active
    </span>
  );
}
