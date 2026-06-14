import { Archive, Edit, FileCheck, ChevronUp, ChevronDown, Undo2 } from 'lucide-react';
import type { WriteupEditorValue } from './types';
import { WriteupVisibilityBadge } from './WriteupVisibilityBadge';
import { WriteupMachineStatusBadge } from './WriteupMachineStatusBadge';
import { WriteupStatusBadge } from './WriteupStatusBadge';

type WriteupsListProps = {
  disabled: boolean;
  writeups: WriteupEditorValue[];
  onArchive: (writeupId: string) => void;
  onEdit: (writeup: WriteupEditorValue) => void;
  onMove: (writeupId: string, direction: 'up' | 'down') => void;
  onRestore: (writeupId: string) => void;
  pending: boolean;
  selectedWriteupId: string | null;
};

export function WriteupsList({
  disabled,
  writeups,
  onArchive,
  onEdit,
  onMove,
  onRestore,
  pending,
  selectedWriteupId,
}: WriteupsListProps) {
  const activeWriteups = writeups.filter((w) => w.isActive);
  const archivedWriteups = writeups.filter((w) => !w.isActive);

  if (writeups.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 text-center font-mono text-sm text-gray-500">
        No writeups found. Create your first writeup.
      </div>
    );
  }

  const renderWriteup = (writeup: WriteupEditorValue, showMove: boolean, isFirst: boolean, isLast: boolean) => {
    const isSelected = writeup.id === selectedWriteupId;

    return (
      <div
        key={writeup.id}
        className={`border-b border-cyan-400/10 p-3 transition-colors ${
          isSelected ? 'bg-cyan-400/5' : 'hover:bg-cyan-400/[0.02]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => onEdit(writeup)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-mono text-sm font-medium text-white">{writeup.title}</h3>
              <WriteupVisibilityBadge visibility={writeup.visibility} />
              <WriteupMachineStatusBadge status={writeup.machineStatus} />
              {!writeup.isActive && <WriteupStatusBadge isActive={false} />}
              {writeup.isFeatured && (
                <span className="border border-[#ffbd2e]/35 bg-[#ffbd2e]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#ffbd2e]">
                  FEATURED
                </span>
              )}
              {writeup.fileName && (
                <FileCheck className="h-3.5 w-3.5 text-[#00ff88]" aria-label="File attached" />
              )}
            </div>
            <div className="space-y-1 font-mono text-xs text-gray-500">
              <div>
                <span className="text-gray-600">slug:</span> {writeup.slug}
              </div>
              {writeup.platform && (
                <div>
                  <span className="text-gray-600">platform:</span> {writeup.platform}
                </div>
              )}
              {writeup.difficulty && (
                <div>
                  <span className="text-gray-600">difficulty:</span> {writeup.difficulty}
                </div>
              )}
              {writeup.category && (
                <div>
                  <span className="text-gray-600">category:</span> {writeup.category}
                </div>
              )}
              <div>
                <span className="text-gray-600">order:</span> {writeup.orderIndex}
              </div>
            </div>
          </button>

          <div className="flex flex-shrink-0 gap-1">
            {showMove && (
              <>
                <button
                  type="button"
                  disabled={disabled || pending || isFirst}
                  onClick={() => writeup.id && onMove(writeup.id, 'up')}
                  className="border border-cyan-400/30 bg-cyan-400/5 p-1.5 text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={disabled || pending || isLast}
                  onClick={() => writeup.id && onMove(writeup.id, 'down')}
                  className="border border-cyan-400/30 bg-cyan-400/5 p-1.5 text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              type="button"
              disabled={disabled || pending}
              onClick={() => onEdit(writeup)}
              className="border border-cyan-400/30 bg-cyan-400/5 p-1.5 text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </button>
            {writeup.id && writeup.isActive && (
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() => onArchive(writeup.id!)}
                className="border border-[#ff5f56]/30 bg-[#ff5f56]/10 p-1.5 text-[#ff5f56] hover:bg-[#ff5f56]/20 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Archive"
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {writeup.id && !writeup.isActive && (
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() => onRestore(writeup.id!)}
                className="border border-[#00ff88]/30 bg-[#00ff88]/10 p-1.5 text-[#00ff88] hover:bg-[#00ff88]/20 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Restore"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeWriteups.length > 0 && (
        <div>
          <h3 className="mb-2 border-b border-cyan-400/20 pb-2 font-mono text-xs text-cyan-400">
            Active Writeups ({activeWriteups.length})
          </h3>
          <div className="border border-cyan-400/20">
            {activeWriteups.map((writeup, index) =>
              renderWriteup(writeup, true, index === 0, index === activeWriteups.length - 1),
            )}
          </div>
        </div>
      )}

      {archivedWriteups.length > 0 && (
        <div>
          <h3 className="mb-2 border-b border-gray-600/20 pb-2 font-mono text-xs text-gray-500">
            Archived Writeups ({archivedWriteups.length})
          </h3>
          <div className="border border-gray-600/20">
            {archivedWriteups.map((writeup) => renderWriteup(writeup, false, false, false))}
          </div>
        </div>
      )}
    </div>
  );
}
