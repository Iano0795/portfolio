'use client';

import { FileText, ExternalLink, Download, Calendar } from 'lucide-react';
import type { ResumeAssetEditorValue } from './types';

type ResumePreviewCardProps = {
  resume: ResumeAssetEditorValue | null;
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

export function ResumePreviewCard({ resume }: ResumePreviewCardProps) {
  if (!resume) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <FileText className="h-12 w-12 text-gray-700" aria-hidden="true" />
          <p className="font-mono text-xs text-gray-500">No active resume</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">
        {resume.isActive ? 'Active Resume' : 'Resume Preview'}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-cyan-400/30 bg-cyan-400/10">
            <FileText className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="font-mono text-sm font-medium text-white">{resume.fileName}</div>
            
            {resume.versionLabel && (
              <div className="inline-block border border-[#ffbd2e]/30 bg-[#ffbd2e]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#ffbd2e]">
                {resume.versionLabel}
              </div>
            )}

            <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>{formatDate(resume.uploadedAt)}</span>
            </div>
          </div>
        </div>

        {resume.fileUrl && (
          <div className="space-y-2">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 border border-cyan-400/45 bg-cyan-400/10 px-4 py-2.5 font-mono text-sm text-cyan-400 transition-all hover:bg-cyan-400/18"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open in New Tab
            </a>

            <a
              href={resume.fileUrl}
              download={resume.fileName}
              className="inline-flex w-full items-center justify-center gap-2 border border-cyan-400/25 bg-[#050812]/40 px-4 py-2.5 font-mono text-sm text-cyan-400 transition-all hover:border-cyan-400/45 hover:bg-cyan-400/10"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </a>
          </div>
        )}

        <div className="space-y-2 border-t border-cyan-400/10 pt-3 font-mono text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={resume.isActive ? 'text-[#00ff88]' : 'text-gray-500'}>
              {resume.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>File Size:</span>
            <span className="text-cyan-400">PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
