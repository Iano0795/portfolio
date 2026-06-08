import type { LucideIcon } from 'lucide-react';

type AdminStatCardProps = {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

export function AdminStatCard({ detail, icon: Icon, label, value }: AdminStatCardProps) {
  return (
    <article className="border border-gray-700 bg-[#090d16]/80 p-4 transition-colors hover:border-[#00ff88]/35">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="font-mono text-xs text-gray-500">{label}</div>
        <Icon className="h-4 w-4 text-cyan-400" aria-hidden="true" />
      </div>
      <div className="mb-2 text-xl font-semibold text-white">{value}</div>
      <p className="text-xs leading-relaxed text-gray-500">{detail}</p>
    </article>
  );
}
