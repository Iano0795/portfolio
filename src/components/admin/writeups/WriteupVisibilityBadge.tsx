import type { WriteupVisibility } from './types';

type WriteupVisibilityBadgeProps = {
  visibility: WriteupVisibility;
};

export function WriteupVisibilityBadge({ visibility }: WriteupVisibilityBadgeProps) {
  const styles = {
    public: 'border-[#00ff88]/35 bg-[#00ff88]/10 text-[#00ff88]',
    restricted: 'border-[#ffbd2e]/35 bg-[#ffbd2e]/10 text-[#ffbd2e]',
    private: 'border-gray-500/35 bg-gray-500/10 text-gray-400',
  };

  const labels = {
    public: 'PUBLIC',
    restricted: 'RESTRICTED',
    private: 'PRIVATE',
  };

  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase ${styles[visibility]}`}>
      {labels[visibility]}
    </span>
  );
}
