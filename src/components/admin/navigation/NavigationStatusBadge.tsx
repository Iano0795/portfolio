type NavigationStatusBadgeProps = {
  isActive: boolean;
  isVisible: boolean;
};

export function NavigationStatusBadge({ isActive, isVisible }: NavigationStatusBadgeProps) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center border border-gray-600/30 bg-gray-700/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500">
        Archived
      </span>
    );
  }

  if (!isVisible) {
    return (
      <span className="inline-flex items-center border border-[#ffbd2e]/30 bg-[#ffbd2e]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#ffbd2e]">
        Hidden
      </span>
    );
  }

  return (
    <span className="inline-flex items-center border border-[#00ff88]/30 bg-[#00ff88]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#00ff88]">
      Visible
    </span>
  );
}
