import { FileText } from 'lucide-react';
import type { WriteupEditorValue } from './types';
import { WriteupVisibilityBadge } from './WriteupVisibilityBadge';
import { WriteupMachineStatusBadge } from './WriteupMachineStatusBadge';

type WriteupPreviewCardProps = {
  writeup: WriteupEditorValue | null;
};

export function WriteupPreviewCard({ writeup }: WriteupPreviewCardProps) {
  if (!writeup) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
        Preview will appear here when editing a writeup.
      </div>
    );
  }

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Preview</div>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="mb-2 text-lg font-bold text-white">{writeup.title || 'Untitled Writeup'}</h3>
          <div className="flex flex-wrap gap-2">
            <WriteupVisibilityBadge visibility={writeup.visibility} />
            <WriteupMachineStatusBadge status={writeup.machineStatus} />
            {writeup.isFeatured && (
              <span className="border border-[#ffbd2e]/35 bg-[#ffbd2e]/10 px-2 py-0.5 font-mono text-[10px] text-[#ffbd2e]">
                FEATURED
              </span>
            )}
          </div>
        </div>

        {writeup.publicTeaser && (
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase text-gray-600">Teaser</div>
            <p className="text-sm leading-relaxed text-gray-400">{writeup.publicTeaser}</p>
          </div>
        )}

        <div className="grid gap-2 border-t border-cyan-400/10 pt-4 font-mono text-xs">
          {writeup.platform && (
            <div>
              <span className="text-gray-600">Platform:</span> <span className="text-gray-300">{writeup.platform}</span>
            </div>
          )}
          {writeup.difficulty && (
            <div>
              <span className="text-gray-600">Difficulty:</span> <span className="text-gray-300">{writeup.difficulty}</span>
            </div>
          )}
          {writeup.category && (
            <div>
              <span className="text-gray-600">Category:</span> <span className="text-gray-300">{writeup.category}</span>
            </div>
          )}
          {writeup.slug && (
            <div>
              <span className="text-gray-600">Slug:</span> <span className="text-gray-300">{writeup.slug}</span>
            </div>
          )}
        </div>

        {writeup.tools.length > 0 && (
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase text-gray-600">Tools</div>
            <div className="flex flex-wrap gap-1">
              {writeup.tools.map((tool) => (
                <span
                  key={tool.id}
                  className="border border-cyan-400/30 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] text-cyan-300"
                >
                  {tool.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {writeup.skills.length > 0 && (
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase text-gray-600">Skills</div>
            <div className="flex flex-wrap gap-1">
              {writeup.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="border border-[#00ff88]/30 bg-[#00ff88]/5 px-2 py-0.5 font-mono text-[10px] text-[#00ff88]"
                >
                  {skill.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {writeup.tags.length > 0 && (
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase text-gray-600">Tags</div>
            <div className="flex flex-wrap gap-1">
              {writeup.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="border border-gray-500/30 bg-gray-500/5 px-2 py-0.5 font-mono text-[10px] text-gray-400"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {writeup.fileName && (
          <div className="border-t border-cyan-400/10 pt-4">
            <div className="flex items-center gap-2 text-[#00ff88]">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono text-xs">{writeup.fileName}</span>
            </div>
            {writeup.fileType && (
              <div className="mt-1 font-mono text-[10px] text-gray-600">{writeup.fileType}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
