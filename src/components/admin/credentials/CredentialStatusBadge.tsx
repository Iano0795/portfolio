type CredentialStatusBadgeProps = {
  label: string;
  tone: 'green' | 'cyan' | 'amber' | 'gray';
};

const toneClasses = {
  green: 'border-[#00ff88]/25 bg-[#00ff88]/10 text-[#00ff88]',
  cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  amber: 'border-[#ffbd2e]/25 bg-[#ffbd2e]/10 text-[#ffbd2e]',
  gray: 'border-gray-700 bg-gray-900/30 text-gray-500',
};

export function CredentialStatusBadge({ label, tone }: CredentialStatusBadgeProps) {
  return <span className={`border px-1.5 py-0.5 font-mono text-[10px] ${toneClasses[tone]}`}>{label}</span>;
}
