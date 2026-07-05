'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { WriteupForm, type ExtractedDraft } from './WriteupForm';
import { WriteupsList } from './WriteupsList';
import { WriteupPreviewCard } from './WriteupPreviewCard';
import type {
  EditableListItem,
  WriteupEditorValue,
  WriteupFileUploadResult,
  WriteupMutationResult,
  WriteupPayload,
  ProjectOption,
} from './types';

type WriteupsManagerProps = {
  archiveWriteup: (writeupId: string) => Promise<WriteupMutationResult>;
  createWriteup: (payload: WriteupPayload) => Promise<WriteupMutationResult>;
  initialWriteups: WriteupEditorValue[];
  portfolio: Portfolio;
  removeWriteupFile: (writeupId: string) => Promise<WriteupMutationResult>;
  reorderWriteups: (orderedWriteupIds: string[]) => Promise<WriteupMutationResult>;
  restoreWriteup: (writeupId: string) => Promise<WriteupMutationResult>;
  role: PortfolioRole;
  updateWriteup: (writeupId: string, payload: WriteupPayload) => Promise<WriteupMutationResult>;
  uploadWriteupFile: (writeupId: string, formData: FormData) => Promise<WriteupFileUploadResult>;
  projects: ProjectOption[];
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

function sortedWriteups(writeups: WriteupEditorValue[]) {
  return [...writeups].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftWriteup(nextOrderIndex: number): WriteupEditorValue {
  return {
    id: null,
    projectId: null,
    title: '',
    slug: '',
    platform: '',
    difficulty: '',
    category: '',
    labType: '',
    machineStatus: 'retired',
    visibility: 'restricted',
    isRequestable: false,
    publicSummary: '',
    publicTeaser: '',
    contentMarkdown: '',
    coverImageUrl: '',
    readingTimeMinutes: null,
    publishedAt: '',
    tools: [],
    skills: [],
    tags: [],
    storageBucket: '',
    storagePath: '',
    fileName: '',
    fileType: '',
    isFeatured: false,
    isActive: true,
    orderIndex: nextOrderIndex,
  };
}

function writeupToPayload(writeup: WriteupEditorValue): WriteupPayload {
  return {
    projectId: writeup.projectId,
    title: writeup.title,
    slug: writeup.slug,
    platform: writeup.platform,
    difficulty: writeup.difficulty,
    category: writeup.category,
    labType: writeup.labType,
    machineStatus: writeup.machineStatus,
    visibility: writeup.visibility,
    isRequestable: writeup.visibility === 'restricted' ? writeup.isRequestable : false,
    publicSummary: writeup.publicSummary,
    publicTeaser: writeup.publicTeaser,
    contentMarkdown: writeup.contentMarkdown,
    coverImageUrl: writeup.coverImageUrl,
    readingTimeMinutes: writeup.readingTimeMinutes,
    publishedAt: writeup.publishedAt,
    tools: writeup.tools.map((item) => item.value),
    skills: writeup.skills.map((item) => item.value),
    tags: writeup.tags.map((item) => item.value),
    storageBucket: writeup.storageBucket,
    storagePath: writeup.storagePath,
    fileName: writeup.fileName,
    fileType: writeup.fileType,
    isFeatured: writeup.isFeatured,
    isActive: writeup.isActive,
    orderIndex: writeup.orderIndex,
  };
}

function cloneWriteup(writeup: WriteupEditorValue): WriteupEditorValue {
  return {
    ...writeup,
    tools: writeup.tools.map((item) => createItem(item.value)),
    skills: writeup.skills.map((item) => createItem(item.value)),
    tags: writeup.tags.map((item) => createItem(item.value)),
  };
}

function uploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Upload failed before the server returned a response. Check the file size, network connection, and server logs.';
}

export function WriteupsManager({
  archiveWriteup,
  createWriteup,
  initialWriteups,
  portfolio,
  removeWriteupFile,
  reorderWriteups,
  restoreWriteup,
  role,
  updateWriteup,
  uploadWriteupFile,
  projects,
}: WriteupsManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [writeups, setWriteups] = useState(() => sortedWriteups(initialWriteups));
  const [editingWriteup, setEditingWriteup] = useState<WriteupEditorValue | null>(null);
  const [message, setMessage] = useState<WriteupMutationResult>({});
  const [uploadMessage, setUploadMessage] = useState<WriteupMutationResult>({});
  const [pending, setPending] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<ExtractedDraft | null>(null);

  useEffect(() => {
    setWriteups(sortedWriteups(initialWriteups));
  }, [initialWriteups]);

  const nextOrderIndex = writeups.length > 0 ? Math.max(...writeups.map((w) => w.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: WriteupMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingWriteup(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<WriteupMutationResult>, closeEditor = false) => {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage({});

    try {
      finishMutation(await mutation(), closeEditor);
    } finally {
      setPending(false);
    }
  };

  const handleNewWriteup = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setUploadMessage({});
    setExtractedDraft(null);
    setEditingWriteup(createDraftWriteup(nextOrderIndex));
  };

  const handleUploadFile = async (file: File) => {
    if (readOnly || pending || !editingWriteup?.id) {
      return;
    }

    const writeupId = editingWriteup.id;

    setPending(true);
    setUploadMessage({ success: `Uploading and extracting ${file.name}...` });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadWriteupFile(writeupId, formData);

      if (result.error) {
        setUploadMessage({ error: result.error });
        return;
      }

      if (result.file) {
        setEditingWriteup((current) =>
          current && current.id === writeupId ? { ...current, ...result.file } : current,
        );
      }

      if (result.extractedMarkdown) {
        setExtractedDraft({
          markdown: result.extractedMarkdown,
          warning: result.extractionWarning ?? null,
        });
      } else {
        setExtractedDraft(null);
      }

      setUploadMessage({
        success: result.extractionWarning
          ? `${result.success} ${result.extractionWarning}`
          : result.success,
      });
      router.refresh();
    } catch (error) {
      console.error('Writeup file upload failed:', error);
      setUploadMessage({ error: uploadErrorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const handleRemoveFile = async () => {
    if (readOnly || pending || !editingWriteup?.id) {
      return;
    }

    const writeupId = editingWriteup.id;

    setPending(true);
    setUploadMessage({});

    try {
      const result = await removeWriteupFile(writeupId);

      if (result.error) {
        setUploadMessage({ error: result.error });
        return;
      }

      setEditingWriteup((current) =>
        current && current.id === writeupId
          ? { ...current, storageBucket: '', storagePath: '', fileName: '', fileType: '' }
          : current,
      );
      setExtractedDraft(null);
      setUploadMessage(result);
      router.refresh();
    } catch (error) {
      console.error('Writeup file removal failed:', error);
      setUploadMessage({ error: uploadErrorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const handleApplyExtracted = () => {
    if (!extractedDraft || !editingWriteup) {
      return;
    }

    setEditingWriteup({ ...editingWriteup, contentMarkdown: extractedDraft.markdown });
    setExtractedDraft(null);
  };

  const handleSave = () => {
    if (!editingWriteup || readOnly) {
      return;
    }

    const payload = writeupToPayload(editingWriteup);

    void runMutation(
      () => (editingWriteup.id ? updateWriteup(editingWriteup.id, payload) : createWriteup(payload)),
      true,
    );
  };

  const handleArchive = (writeupId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveWriteup(writeupId));
  };

  const handleRestore = (writeupId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => restoreWriteup(writeupId));
  };

  const handleMove = (writeupId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    const ordered = sortedWriteups(writeups.filter((w) => w.isActive));
    const currentIndex = ordered.findIndex((w) => w.id === writeupId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const reordered = [...ordered];
    const [writeup] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, writeup);

    setWriteups([
      ...reordered.map((item, index) => ({ ...item, orderIndex: index })),
      ...writeups.filter((w) => !w.isActive),
    ]);

    void runMutation(() => reorderWriteups(reordered.map((item) => item.id).filter((id): id is string => Boolean(id))));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">writeups.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Writeups Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage lab writeups, visibility, restricted files, and safe public summaries.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewWriteup}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Writeup
          </button>
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

      <section className="border border-cyan-400/20 bg-[#090d16]/80">
        <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Writeups Index</div>
        <div className="p-4">
          <WriteupsList
            disabled={readOnly}
            writeups={writeups}
            onArchive={handleArchive}
            onEdit={(writeup) => {
              setMessage({});
              setUploadMessage({});
              setExtractedDraft(null);
              setEditingWriteup(cloneWriteup(writeup));
            }}
            onMove={handleMove}
            onRestore={handleRestore}
            pending={pending}
            selectedWriteupId={editingWriteup?.id ?? null}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {editingWriteup ? (
          <WriteupForm
            disabled={readOnly}
            writeup={editingWriteup}
            mode={editingWriteup.id ? 'edit' : 'create'}
            onCancel={() => {
              setUploadMessage({});
              setExtractedDraft(null);
              setEditingWriteup(null);
            }}
            onChange={setEditingWriteup}
            onSave={handleSave}
            pending={pending}
            projects={projects}
            onUploadFile={(file) => void handleUploadFile(file)}
            onRemoveFile={() => void handleRemoveFile()}
            extractedDraft={extractedDraft}
            uploadMessage={uploadMessage}
            onApplyExtracted={handleApplyExtracted}
            onDismissExtracted={() => setExtractedDraft(null)}
          />
        ) : (
          <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
            Select a writeup to edit or create a new lab writeup.
          </div>
        )}

        <WriteupPreviewCard writeup={editingWriteup} />
      </section>
    </div>
  );
}
