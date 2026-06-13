type ThemeStatusBadgeProps = {
  label: string;
  tone?: 'cyan' | 'green' | 'yellow' | 'red';
};

const toneClassName = {
  cyan: 'border-cyan-400/25 text-cyan-300',
  green: 'border-[#00ff88]/25 text-[#00ff88]',
  yellow: 'border-[#ffbd2e]/35 text-[#ffbd2e]',
  red: 'border-[#ff5f56]/35 text-[#ffb4ad]',
};

export function ThemeStatusBadge({ label, tone = 'cyan' }: ThemeStatusBadgeProps) {
  return <span className={`border px-2 py-1 font-mono text-xs ${toneClassName[tone]}`}>{label}</span>;
}
