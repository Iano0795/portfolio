'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ResumeUploadForm } from './ResumeUploadForm';
import { ResumeList } from './ResumeList';
import { ResumePreviewCard } from './ResumePreviewCard';
import type { ResumeAssetEditorValue, ResumeMutationResult } from './types';

type ResumeManagerProps = {
  archiveResume: (resumeId: string) => Promise<ResumeMutationResult>;
  initialResumes: ResumeAssetEditorValue[];
  portfolio: Portfolio;
  role: PortfolioRole;
  setActiveResume: (resumeId: string) => Promise<ResumeMutationResult>;
  uploadResume: (formData: FormData) => Promise<ResumeMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export function ResumeManager({
  archiveResume,
  initialResumes,
  portfolio,
  role,
  setActiveResume,
  uploadResume,
}: ResumeManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [resumes, setResumes] = useState(initialResumes);
  const [message, setMessage] = useState<ResumeMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setResumes(initialResumes);
  }, [initialResumes]);

  const readOnly = !manager;
  const activeResume = resumes.find((resume) => resume.isActive) || null;

  const finishMutation = (result: ResumeMutationResult) => {
    setMessage(result);

    if (result.success) {
      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<ResumeMutationResult>) => {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage({});

    try {
      finishMutation(await mutation());
    } finally {
      setPending(false);
    }
  };

  const handleUpload = async (formData: FormData) => {
    if (readOnly) {
      return;
    }

    await runMutation(() => uploadResume(formData));
  };

  const handleSetActive = (resumeId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => setActiveResume(resumeId));
  };

  const handleArchive = (resumeId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveResume(resumeId));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">resume.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Resume Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Upload, version, and manage the active resume for this portfolio.
            </p>
          </div>
        </div>
      </header>

      {message.error && (
        <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
          {message.error}
        </div>
      )}
      {message.success && (
        <div className="border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
          {message.success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="border border-cyan-400/20 bg-[#090d16]/80">
            <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Resume Versions</div>
            <div className="p-4">
              <ResumeList
                disabled={readOnly}
                onArchive={handleArchive}
                onSetActive={handleSetActive}
                pending={pending}
                resumes={resumes}
              />
            </div>
          </section>

          {!readOnly && (
            <ResumeUploadForm
              disabled={readOnly}
              onUpload={handleUpload}
              pending={pending}
            />
          )}

          {readOnly && (
            <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 text-center font-mono text-xs text-gray-500">
              Read-only access: You cannot upload or manage resumes.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <ResumePreviewCard resume={activeResume} />

          {activeResume && (
            <div className="border border-cyan-400/10 bg-[#090d16]/80 p-4">
              <div className="mb-2 font-mono text-xs text-cyan-400">Public URL</div>
              <div className="break-all font-mono text-xs text-gray-400">{activeResume.fileUrl}</div>
              <p className="mt-2 font-mono text-[10px] text-gray-500">
                This URL can be used in your public portfolio for resume downloads.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
