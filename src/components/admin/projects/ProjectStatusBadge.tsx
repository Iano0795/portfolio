type ProjectStatusBadgeProps = {
  label: string;
  tone?: 'green' | 'cyan' | 'amber' | 'red' | 'gray';
};

const toneClasses = {
  green: 'border-[#00ff88]/35 bg-[#00ff88]/10 text-[#00ff88]',
  cyan: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300',
  amber: 'border-[#ffbd2e]/35 bg-[#ffbd2e]/10 text-[#ffbd2e]',
  red: 'border-[#ff5f56]/35 bg-[#ff5f56]/10 text-[#ffb4ad]',
  gray: 'border-gray-700 bg-black/25 text-gray-500',
};

export function ProjectStatusBadge({ label, tone = 'gray' }: ProjectStatusBadgeProps) {
  return <span className={`inline-flex border px-2 py-1 font-mono text-[11px] leading-none ${toneClasses[tone]}`}>{label}</span>;
}
