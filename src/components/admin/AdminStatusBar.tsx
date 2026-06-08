type AdminStatusBarProps = {
  adminRole: string;
  environment: string;
};

export function AdminStatusBar({ adminRole, environment }: AdminStatusBarProps) {
  return (
    <footer className="relative z-10 min-h-10 flex-shrink-0 border-t border-[#00ff88]/20 bg-[#090d16]/95 px-4 py-2 font-mono text-xs shadow-[0_0_18px_rgba(0,255,136,0.08)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 truncate">
          <span className="text-gray-500">stdout:</span>
          <span className="ml-2 text-cyan-300">control center mounted. dashboard module ready.</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-gray-500">role</span>
          <span className="text-[#00ff88]">{adminRole}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">env</span>
          <span className="text-cyan-400">{environment}</span>
        </div>
      </div>
    </footer>
  );
}
