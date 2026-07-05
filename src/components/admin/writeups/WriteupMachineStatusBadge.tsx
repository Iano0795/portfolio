import type { WriteupMachineStatus } from './types';

type WriteupMachineStatusBadgeProps = {
  status: WriteupMachineStatus;
};

export function WriteupMachineStatusBadge({ status }: WriteupMachineStatusBadgeProps) {
  const styles = {
    active: 'border-[#ff5f56]/35 bg-[#ff5f56]/10 text-[#ff5f56]',
    retired: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300',
    other: 'border-gray-500/35 bg-gray-500/10 text-gray-400',
  };

  const labels = {
    active: 'ACTIVE',
    retired: 'RETIRED',
    other: 'OTHER',
  };

  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
