'use client';

import { ExternalLink, Download, CheckCircle, Archive, Calendar } from 'lucide-react';
import { ResumeStatusBadge } from './ResumeStatusBadge';
import type { ResumeAssetEditorValue } from './types';

type ResumeListProps = {
  disabled: boolean;
  onArchive: (resumeId: string) => void;
  onSetActive: (resumeId: string) => void;
  pending: boolean;
  resumes: ResumeAssetEditorValue[];
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function ResumeList({ disabled, onArchive, onSetActive, pending, resumes }: ResumeListProps) {
  if (resumes.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-8 text-center">
        <p className="font-mono text-sm text-gray-400">No resumes uploaded yet. Upload your first resume to get started.</p>
      </div>
    );
  }

  // Sort: active first, then by uploaded_at desc
  const sortedResumes = [...resumes].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });

  return (
    <div className="space-y-2">
      {sortedResumes.map((resume) => {
        if (!resume.id) return null;

        return (
          <div
            key={resume.id}
            className={`flex items-center justify-between gap-4 border bg-[#050812]/40 px-4 py-3 transition-all ${
              resume.isActive
                ? 'border-[#00ff88]/45 bg-[#00ff88]/5 shadow-[inset_3px_0_0_#00ff88]'
                : 'border-cyan-400/10 hover:border-cyan-400/20 hover:bg-[#090d16]/40'
            }`}
          >
            <div className="flex flex-1 items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm font-medium text-white">{resume.fileName}</div>
                  <ResumeStatusBadge isActive={resume.isActive} />
                </div>

                {resume.versionLabel && (
                  <div className="inline-block border border-[#ffbd2e]/25 bg-[#ffbd2e]/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#ffbd2e]">
                    {resume.versionLabel}
                  </div>
                )}

                <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span>{formatDate(resume.uploadedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <a
                href={resume.fileUrl}
                download={resume.fileName}
                className="border border-cyan-400/25 bg-[#050812]/40 p-1.5 text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              {!resume.isActive && (
                <button
                  type="button"
                  disabled={disabled || pending}
                  onClick={() => onSetActive(resume.id!)}
                  className="border border-[#00ff88]/25 bg-[#050812]/40 p-1.5 text-[#00ff88] transition-all hover:border-[#00ff88]/45 hover:bg-[#00ff88]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Set as active"
                >
                  <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}

              {resume.isActive && (
                <button
                  type="button"
                  disabled={disabled || pending}
                  onClick={() => onArchive(resume.id!)}
                  className="border border-[#ff5f56]/25 bg-[#050812]/40 p-1.5 text-[#ff5f56] transition-all hover:border-[#ff5f56]/45 hover:bg-[#ff5f56]/10 disabled:cursor-not-allowed disabled:border-gray-700/25 disabled:text-gray-600"
                  title="Deactivate"
                >
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
