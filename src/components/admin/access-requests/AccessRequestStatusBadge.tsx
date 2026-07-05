import { CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';
import type { WriteupAccessRequestStatus } from '@/types/portfolio';

type AccessRequestStatusBadgeProps = {
  status: WriteupAccessRequestStatus;
};

export function AccessRequestStatusBadge({ status }: AccessRequestStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'border-yellow-500/35 bg-yellow-500/10 text-yellow-400',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle2,
      className: 'border-green-500/35 bg-green-500/10 text-green-400',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'border-red-500/35 bg-red-500/10 text-red-400',
    },
    cancelled: {
      label: 'Cancelled',
      icon: Ban,
      className: 'border-gray-500/35 bg-gray-500/10 text-gray-400',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </span>
  );
}
