type WriteupStatusBadgeProps = {
  isActive: boolean;
};

export function WriteupStatusBadge({ isActive }: WriteupStatusBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-block border border-[#00ff88]/35 bg-[#00ff88]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#00ff88]">
        ACTIVE
      </span>
    );
  }

  return (
    <span className="inline-block border border-gray-600/35 bg-gray-600/10 px-2 py-0.5 font-mono text-[10px] uppercase text-gray-500">
      ARCHIVED
    </span>
  );
}
