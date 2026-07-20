'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { List, Plus, X } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { WriteupForm, type ExtractedDraft } from './WriteupForm';
import { WriteupsList } from './WriteupsList';
import { WriteupPreviewCard } from './WriteupPreviewCard';
import type {
  EditableListItem,
  GithubExploitEditorItem,
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

function createExploitItem(value?: Partial<GithubExploitEditorItem>): GithubExploitEditorItem {
  return {
    id: crypto.randomUUID(),
    label: value?.label ?? '',
    url: value?.url ?? '',
    description: value?.description ?? '',
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
    githubExploits: [],
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
    githubExploits: writeup.githubExploits
      .map((item) => ({
        label: item.label,
        url: item.url,
        description: item.description,
      }))
      .filter((item) => item.label.trim() || item.url.trim() || item.description.trim()),
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
    githubExploits: writeup.githubExploits.map((item) => createExploitItem(item)),
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
  const [originalWriteup, setOriginalWriteup] = useState<WriteupEditorValue | null>(null);
  const [message, setMessage] = useState<WriteupMutationResult>({});
  const [formMessage, setFormMessage] = useState<WriteupMutationResult>({});
  const [uploadMessage, setUploadMessage] = useState<WriteupMutationResult>({});
  const [pending, setPending] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<ExtractedDraft | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setWriteups(sortedWriteups(initialWriteups));
  }, [initialWriteups]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const nextOrderIndex = writeups.length > 0 ? Math.max(...writeups.map((w) => w.orderIndex)) + 1 : 0;
  const readOnly = !manager;
  const isDirty = Boolean(
    editingWriteup && originalWriteup && JSON.stringify(editingWriteup) !== JSON.stringify(originalWriteup),
  );

  const finishMutation = (
    result: WriteupMutationResult,
    setter: (result: WriteupMutationResult) => void,
    closeEditor = false,
  ) => {
    setter(result);

    if (result.success) {
      if (closeEditor) {
        setEditingWriteup(null);
        setOriginalWriteup(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (
    mutation: () => Promise<WriteupMutationResult>,
    setter: (result: WriteupMutationResult) => void = setMessage,
    closeEditor = false,
  ) => {
    if (pending) {
      return;
    }

    setPending(true);
    setter({});

    try {
      finishMutation(await mutation(), setter, closeEditor);
    } finally {
      setPending(false);
    }
  };

  const confirmDiscard = () => !isDirty || confirm('Discard unsaved changes to this writeup?');

  const openEditor = (writeup: WriteupEditorValue) => {
    setMessage({});
    setFormMessage({});
    setUploadMessage({});
    setExtractedDraft(null);
    setEditingWriteup(writeup);
    setOriginalWriteup(writeup);
    setActiveTab('edit');
    setDrawerOpen(false);
  };

  const handleNewWriteup = () => {
    if (readOnly || !confirmDiscard()) {
      return;
    }

    openEditor(createDraftWriteup(nextOrderIndex));
  };

  const handleEditWriteup = (writeup: WriteupEditorValue) => {
    if (!confirmDiscard()) {
      return;
    }

    openEditor(cloneWriteup(writeup));
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

      if (result.file || result.extractedMarkdown) {
        setEditingWriteup((current) =>
          current && current.id === writeupId
            ? {
                ...current,
                ...(result.file ?? {}),
                ...(result.extractedMarkdown ? { contentMarkdown: result.extractedMarkdown } : {}),
              }
            : current,
        );
      }

      // File metadata is already persisted by the upload action, so it isn't an unsaved change.
      // Extracted markdown is only applied locally, so it stays a genuine pending change until Save.
      if (result.file) {
        setOriginalWriteup((current) => (current && current.id === writeupId ? { ...current, ...result.file } : current));
      }

      if (result.extractedMarkdown) {
        setExtractedDraft({
          markdown: result.extractedMarkdown,
          warning: result.extractionWarning ?? null,
          applied: true,
        });
      } else {
        setExtractedDraft(null);
      }

      setUploadMessage({
        success: result.extractionWarning
          ? `${result.success} ${result.extractionWarning}`
          : result.extractedMarkdown
            ? `${result.success} Extracted content was applied to the editor.`
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

      const clearedFile = { storageBucket: '', storagePath: '', fileName: '', fileType: '' };

      setEditingWriteup((current) => (current && current.id === writeupId ? { ...current, ...clearedFile } : current));
      setOriginalWriteup((current) => (current && current.id === writeupId ? { ...current, ...clearedFile } : current));
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
      setFormMessage,
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

  const listProps = {
    disabled: readOnly,
    writeups,
    onArchive: handleArchive,
    onEdit: handleEditWriteup,
    onMove: handleMove,
    onRestore: handleRestore,
    pending,
    selectedWriteupId: editingWriteup?.id ?? null,
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4">
      <header className="flex-shrink-0 border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 border border-cyan-400/45 bg-cyan-400/10 px-4 py-2.5 font-mono text-sm text-cyan-300 transition-all hover:bg-cyan-400/18 lg:hidden"
            >
              <List className="h-4 w-4" aria-hidden="true" />
              Writeups ({writeups.length})
            </button>
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
        </div>
      </header>

      {message.error && (
        <div className="flex-shrink-0 border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
          {message.error}
        </div>
      )}
      {message.success && (
        <div className="flex-shrink-0 border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
          {message.success}
        </div>
      )}

      <div className="flex flex-1 min-h-0 gap-4">
        <div className="hidden min-h-0 flex-col border border-cyan-400/20 bg-[#090d16]/80 lg:flex lg:w-1/3 lg:max-w-sm lg:flex-shrink-0">
          <div className="flex-shrink-0 border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">
            Writeups Index ({writeups.length})
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <WriteupsList {...listProps} />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col border border-cyan-400/20 bg-[#090d16]/80">
          <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-cyan-400/10 px-4 py-3">
            <span className="font-mono text-xs text-cyan-400">
              {editingWriteup ? (editingWriteup.id ? 'Edit Writeup' : 'Create New Writeup') : 'writeups.detail'}
            </span>
            {editingWriteup && (
              <div className="flex border border-cyan-400/20 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1 font-mono text-xs transition-colors ${
                    activeTab === 'edit' ? 'bg-cyan-400/15 text-cyan-300' : 'text-gray-500 hover:text-cyan-300'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 font-mono text-xs transition-colors ${
                    activeTab === 'preview' ? 'bg-cyan-400/15 text-cyan-300' : 'text-gray-500 hover:text-cyan-300'
                  }`}
                >
                  Preview
                </button>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {editingWriteup ? (
              activeTab === 'edit' ? (
                <WriteupForm
                  disabled={readOnly}
                  writeup={editingWriteup}
                  mode={editingWriteup.id ? 'edit' : 'create'}
                  onCancel={() => {
                    if (!confirmDiscard()) {
                      return;
                    }

                    setFormMessage({});
                    setUploadMessage({});
                    setExtractedDraft(null);
                    setEditingWriteup(null);
                    setOriginalWriteup(null);
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
                  message={formMessage}
                />
              ) : (
                <WriteupPreviewCard writeup={editingWriteup} />
              )
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center font-mono text-xs text-gray-500">
                Select a writeup to edit or create a new lab writeup.
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="relative z-10 flex h-full w-[85vw] max-w-sm flex-col border-r border-cyan-400/20 bg-[#090d16] shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-cyan-400/10 px-4 py-3">
              <span className="font-mono text-xs text-cyan-400">Writeups Index ({writeups.length})</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close writeups list"
                className="border border-gray-600/45 bg-gray-600/10 p-1.5 text-gray-400 hover:bg-gray-600/18"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <WriteupsList {...listProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
