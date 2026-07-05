type ContactStatusBadgeProps = {
  isActive: boolean;
};

export function ContactStatusBadge({ isActive }: ContactStatusBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex items-center border border-[#00ff88]/30 bg-[#00ff88]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#00ff88]">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center border border-gray-600/30 bg-gray-700/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500">
      Archived
    </span>
  );
}
