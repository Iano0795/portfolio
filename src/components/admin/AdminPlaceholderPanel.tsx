import type { ReactNode } from 'react';

type AdminPlaceholderPanelProps = {
  children: ReactNode;
  tone?: 'cyan' | 'green';
  title: string;
};

const borderClasses = {
  cyan: 'border-cyan-400/20',
  green: 'border-[#00ff88]/20',
};

const titleClasses = {
  cyan: 'text-cyan-400',
  green: 'text-[#00ff88]',
};

export function AdminPlaceholderPanel({ children, tone = 'cyan', title }: AdminPlaceholderPanelProps) {
  return (
    <aside className={`border ${borderClasses[tone]} bg-black/25 p-4`}>
      <div className={`mb-3 font-mono text-xs ${titleClasses[tone]}`}>{title}</div>
      {children}
    </aside>
  );
}
