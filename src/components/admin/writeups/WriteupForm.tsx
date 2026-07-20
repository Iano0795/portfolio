import { useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, FileText, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type { WriteupEditorValue, WriteupMutationResult, ProjectOption } from './types';
import { WriteupArrayFields } from './WriteupArrayFields';

export type ExtractedDraft = {
  markdown: string;
  warning: string | null;
  applied?: boolean;
};

type WriteupFormProps = {
  disabled: boolean;
  writeup: WriteupEditorValue;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (writeup: WriteupEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  projects: ProjectOption[];
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  extractedDraft: ExtractedDraft | null;
  uploadMessage: {
    error?: string;
    success?: string;
  };
  onApplyExtracted: () => void;
  onDismissExtracted: () => void;
  message: WriteupMutationResult;
};

const inputClasses =
  'w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50';

const labelClasses = 'mb-2 block font-mono text-xs text-cyan-400';
const hintClasses = 'mt-1 font-mono text-[10px] text-gray-600';

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 180);
}

function Section({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-cyan-400/10 pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 border-b border-cyan-400/10 pb-2 text-left font-mono text-xs font-semibold text-white"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
        )}
        {title}
        {badge ? (
          <span className="ml-auto border border-cyan-400/25 px-2 py-0.5 font-normal text-[10px] text-cyan-300">{badge}</span>
        ) : null}
      </button>
      {open ? <div className="space-y-4 pt-4">{children}</div> : null}
    </section>
  );
}

export function WriteupForm({
  disabled,
  writeup,
  mode,
  onCancel,
  onChange,
  onSave,
  pending,
  projects,
  onUploadFile,
  onRemoveFile,
  extractedDraft,
  uploadMessage,
  onApplyExtracted,
  onDismissExtracted,
  message,
}: WriteupFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTitleChange = (title: string) => {
    onChange({
      ...writeup,
      title,
      // Auto-generate slug from title if in create mode and slug is empty
      slug: mode === 'create' && !writeup.slug ? generateSlugFromTitle(title) : writeup.slug,
    });
  };

  const handleVisibilityChange = (visibility: 'public' | 'restricted' | 'private') => {
    onChange({
      ...writeup,
      visibility,
      isRequestable: visibility === 'restricted' ? writeup.isRequestable : false,
    });
  };

  const handleFileSelected = (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (file) {
      onUploadFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addGithubExploit = () => {
    onChange({
      ...writeup,
      githubExploits: [
        ...writeup.githubExploits,
        {
          id: crypto.randomUUID(),
          label: '',
          url: '',
          description: '',
        },
      ],
    });
  };

  const updateGithubExploit = (
    exploitId: string,
    field: 'label' | 'url' | 'description',
    value: string,
  ) => {
    onChange({
      ...writeup,
      githubExploits: writeup.githubExploits.map((item) =>
        item.id === exploitId ? { ...item, [field]: value } : item,
      ),
    });
  };

  const removeGithubExploit = (exploitId: string) => {
    onChange({
      ...writeup,
      githubExploits: writeup.githubExploits.filter((item) => item.id !== exploitId),
    });
  };

  const hasFile = Boolean(writeup.storagePath);
  const isUnsafePublicActive = writeup.machineStatus === 'active' && writeup.visibility === 'public';
  const canSubmit = Boolean(writeup.title.trim()) && Boolean(writeup.slug.trim()) && !isUnsafePublicActive;

  return (
    <div className="space-y-4 p-4">
      <Section title="Basic Info" defaultOpen>
          <div>
            <label htmlFor="writeup-title" className={labelClasses}>
              Title <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="writeup-title"
              type="text"
              disabled={disabled}
              value={writeup.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="HackTheBox: Obscurity Machine Writeup"
              maxLength={180}
              className={inputClasses}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="writeup-slug" className={labelClasses}>
                Slug <span className="text-[#ff5f56]">*</span>
              </label>
              <input
                id="writeup-slug"
                type="text"
                disabled={disabled}
                value={writeup.slug}
                onChange={(e) => onChange({ ...writeup, slug: e.target.value.toLowerCase() })}
                placeholder="htb-obscurity"
                maxLength={180}
                className={inputClasses}
              />
              <p className={hintClasses}>Lowercase letters, numbers, and hyphens only</p>
            </div>

            <div>
              <label htmlFor="writeup-project" className={labelClasses}>
                Linked Project (Optional)
              </label>
              <select
                id="writeup-project"
                disabled={disabled}
                value={writeup.projectId || ''}
                onChange={(e) => onChange({ ...writeup, projectId: e.target.value || null })}
                className={inputClasses}
              >
                <option value="">-- None --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="writeup-platform" className={labelClasses}>
                Platform
              </label>
              <input
                id="writeup-platform"
                type="text"
                disabled={disabled}
                value={writeup.platform}
                onChange={(e) => onChange({ ...writeup, platform: e.target.value })}
                placeholder="HackTheBox"
                maxLength={120}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="writeup-difficulty" className={labelClasses}>
                Difficulty
              </label>
              <input
                id="writeup-difficulty"
                type="text"
                disabled={disabled}
                value={writeup.difficulty}
                onChange={(e) => onChange({ ...writeup, difficulty: e.target.value })}
                placeholder="Medium"
                maxLength={80}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="writeup-category" className={labelClasses}>
                Category
              </label>
              <input
                id="writeup-category"
                type="text"
                disabled={disabled}
                value={writeup.category}
                onChange={(e) => onChange({ ...writeup, category: e.target.value })}
                placeholder="Web / Linux"
                maxLength={120}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="writeup-lab-type" className={labelClasses}>
                Lab Type
              </label>
              <select
                id="writeup-lab-type"
                disabled={disabled}
                value={writeup.labType}
                onChange={(e) => onChange({ ...writeup, labType: e.target.value as 'offensive' | 'defensive' | '' })}
                className={inputClasses}
              >
                <option value="">-- Select --</option>
                <option value="offensive">Offensive</option>
                <option value="defensive">Defensive</option>
              </select>
              <p className={hintClasses}>Required for publicly listed labs</p>
            </div>
          </div>
        </Section>

        <Section title="Safety & Visibility" defaultOpen>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="writeup-machine-status" className={labelClasses}>
                Machine Status <span className="text-[#ff5f56]">*</span>
              </label>
              <select
                id="writeup-machine-status"
                disabled={disabled}
                value={writeup.machineStatus}
                onChange={(e) => onChange({ ...writeup, machineStatus: e.target.value as 'active' | 'retired' | 'other' })}
                className={inputClasses}
              >
                <option value="retired">Retired</option>
                <option value="active">Active</option>
                <option value="other">Other</option>
              </select>
              <p className={hintClasses}>
                {writeup.machineStatus === 'active' && '⚠️ Active machines should not be public'}
                {writeup.machineStatus === 'retired' && 'Safe for public or restricted access'}
                {writeup.machineStatus === 'other' && 'Custom or non-platform labs'}
              </p>
            </div>

            <div>
              <label htmlFor="writeup-visibility" className={labelClasses}>
                Visibility <span className="text-[#ff5f56]">*</span>
              </label>
              <select
                id="writeup-visibility"
                disabled={disabled}
                value={writeup.visibility}
                onChange={(e) => handleVisibilityChange(e.target.value as 'public' | 'restricted' | 'private')}
                className={inputClasses}
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </select>
              <p className={hintClasses}>
                {writeup.visibility === 'public' && 'Visible to all visitors (retired machines only)'}
                {writeup.visibility === 'restricted' && 'Requires access request & approval'}
                {writeup.visibility === 'private' && 'Never shown publicly, members only'}
              </p>
            </div>
          </div>

          {writeup.machineStatus === 'active' && writeup.visibility === 'public' && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ff5f56]">
              ⚠️ Security Warning: Active machines cannot have public visibility. Change status to &quot;retired&quot; or visibility to
              &quot;restricted&quot; or &quot;private&quot;.
            </div>
          )}

          {writeup.visibility === 'restricted' && (
            <div className="space-y-3 border border-[#ffbd2e]/25 bg-[#ffbd2e]/5 p-3">
              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-[#ffbd2e]">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={writeup.isRequestable}
                  onChange={(e) => onChange({ ...writeup, isRequestable: e.target.checked })}
                  className="h-4 w-4 accent-[#ffbd2e]"
                />
                Is requestable from the public portfolio
              </label>
              <div className="flex items-start gap-2 font-mono text-[10px] leading-relaxed text-[#ffdc8a]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <p>
                  Only approve active-lab access where the platform or lab rules permit solution sharing. Active labs default to
                  not requestable until this is explicitly enabled.
                </p>
              </div>
            </div>
          )}
        </Section>

        <Section title="Writeup Document" badge={hasFile ? writeup.fileName || 'File attached' : null}>
          {mode === 'create' ? (
            <p className="font-mono text-[10px] leading-relaxed text-gray-500">
              Save the writeup first, then re-open it to attach a PDF, Word, or Markdown document.
            </p>
          ) : (
            <>
              <p className="font-mono text-[10px] leading-relaxed text-gray-500">
                Upload a PDF, Word (.docx), or Markdown file (max 20MB). It is stored in the private writeups bucket, and its
                text is extracted so you can use it as the public Markdown content. Images embedded in Word files are uploaded
                to public writeup assets and inserted into the extracted Markdown.
              </p>

              {hasFile ? (
                <div className="flex flex-wrap items-center gap-3 border border-cyan-400/20 bg-[#050812]/60 p-3">
                  <FileText className="h-4 w-4 flex-shrink-0 text-cyan-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-gray-200">{writeup.fileName || writeup.storagePath}</p>
                    <p className="truncate font-mono text-[10px] text-gray-600">
                      {writeup.storageBucket}/{writeup.storagePath}
                      {writeup.fileType ? ` · ${writeup.fileType}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled || pending}
                    onClick={onRemoveFile}
                    className="inline-flex items-center gap-2 border border-[#ff5f56]/40 bg-[#ff5f56]/10 px-3 py-1.5 font-mono text-[10px] text-[#ffb4ad] transition-all hover:bg-[#ff5f56]/18 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              ) : null}

              <div>
                <input
                  ref={fileInputRef}
                  id="writeup-file-upload"
                  type="file"
                  accept=".pdf,.docx,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown"
                  disabled={disabled || pending}
                  onChange={(e) => handleFileSelected(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={disabled || pending}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 border border-cyan-400/45 bg-cyan-400/10 px-4 py-2 font-mono text-xs text-cyan-300 transition-all hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {pending ? 'Working...' : hasFile ? 'Replace File' : 'Upload File'}
                </button>
                {uploadMessage.error ? (
                  <p className="mt-2 border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#ffb4ad]" role="alert">
                    {uploadMessage.error}
                  </p>
                ) : null}
                {uploadMessage.success ? (
                  <p className="mt-2 border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#00ff88]" role="status">
                    {uploadMessage.success}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </Section>

        <Section title="Public Content" badge={writeup.contentMarkdown.trim() ? 'Has content' : null}>
          <p className="font-mono text-[10px] leading-relaxed text-[#ffdc8a]">
            ⚠️ Only safe public content here — no exploitation steps for active machines, credentials, or flags.
          </p>

          {extractedDraft ? (
            <div className="space-y-2 border border-[#00ff88]/30 bg-[#00ff88]/5 p-3">
              <p className="font-mono text-[10px] leading-relaxed text-[#00ff88]">
                Content extracted from the uploaded document ({extractedDraft.markdown.length.toLocaleString()} characters) is
                {extractedDraft.applied ? ' applied to the editor.' : ' ready to use.'}
              </p>
              {extractedDraft.warning ? (
                <p className="font-mono text-[10px] leading-relaxed text-[#ffdc8a]">{extractedDraft.warning}</p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onApplyExtracted}
                  className="border border-[#00ff88]/45 bg-[#00ff88]/10 px-3 py-1.5 font-mono text-[10px] text-[#00ff88] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {extractedDraft.applied ? 'Reapply Markdown content' : 'Replace Markdown content'}
                </button>
                <button
                  type="button"
                  onClick={onDismissExtracted}
                  className="border border-gray-600/45 bg-gray-600/10 px-3 py-1.5 font-mono text-[10px] text-gray-400 transition-all hover:bg-gray-600/18"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="writeup-teaser" className={labelClasses}>
              Public Teaser (Brief Description)
            </label>
            <textarea
              id="writeup-teaser"
              disabled={disabled}
              value={writeup.publicTeaser}
              onChange={(e) => onChange({ ...writeup, publicTeaser: e.target.value })}
              placeholder="A brief description of the challenge for public display..."
              maxLength={600}
              rows={3}
              className={`${inputClasses} resize-none`}
            />
            <p className={hintClasses}>{writeup.publicTeaser.length} / 600 characters</p>
          </div>

          <div>
            <label htmlFor="writeup-summary" className={labelClasses}>
              Public Summary (Safe Overview)
            </label>
            <textarea
              id="writeup-summary"
              disabled={disabled}
              value={writeup.publicSummary}
              onChange={(e) => onChange({ ...writeup, publicSummary: e.target.value })}
              placeholder="A safe public summary of the challenge, approach, and lessons learned..."
              maxLength={1200}
              rows={4}
              className={`${inputClasses} resize-none`}
            />
            <p className={hintClasses}>{writeup.publicSummary.length} / 1200 characters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="writeup-reading-time" className={labelClasses}>
                Reading Time
              </label>
              <input
                id="writeup-reading-time"
                type="number"
                disabled={disabled}
                value={writeup.readingTimeMinutes ?? ''}
                onChange={(e) => onChange({ ...writeup, readingTimeMinutes: e.target.value ? parseInt(e.target.value, 10) : null })}
                min={1}
                max={300}
                placeholder="auto"
                className={inputClasses}
              />
              <p className={hintClasses}>Leave empty to auto-calculate</p>
            </div>

            <div>
              <label htmlFor="writeup-published-at" className={labelClasses}>
                Published Date
              </label>
              <input
                id="writeup-published-at"
                type="date"
                disabled={disabled}
                value={writeup.publishedAt}
                onChange={(e) => onChange({ ...writeup, publishedAt: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="writeup-cover-image" className={labelClasses}>
                Cover Image URL
              </label>
              <input
                id="writeup-cover-image"
                type="url"
                disabled={disabled}
                value={writeup.coverImageUrl}
                onChange={(e) => onChange({ ...writeup, coverImageUrl: e.target.value })}
                placeholder="https://..."
                maxLength={500}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="writeup-markdown" className={labelClasses}>
              Full Markdown Content
            </label>
            <textarea
              id="writeup-markdown"
              disabled={disabled}
              value={writeup.contentMarkdown}
              onChange={(e) => onChange({ ...writeup, contentMarkdown: e.target.value })}
              placeholder="Add full Markdown only for retired public labs where publication is safe."
              maxLength={100000}
              rows={12}
              className={`${inputClasses} resize-y leading-6`}
            />
            <p className={hintClasses}>
              {writeup.contentMarkdown.length} / 100000 characters. Returned publicly only for public, non-active writeups.
            </p>
          </div>

          {writeup.visibility === 'public' && writeup.machineStatus === 'active' && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]">
              Public full content is blocked while this lab is active.
            </div>
          )}
        </Section>

        <Section
          title="GitHub Exploits"
          badge={writeup.githubExploits.length > 0 ? `${writeup.githubExploits.length} linked` : null}
        >
          <p className="font-mono text-[10px] leading-relaxed text-gray-500">
            Add exploit scripts, PoCs, or Gists you want highlighted in the public writeup sidebar. GitHub and Gist links found
            in the Markdown will still be shown automatically.
          </p>

          <div className="space-y-4">
            {writeup.githubExploits.map((exploit, index) => (
              <div className="border border-cyan-400/20 bg-[#050812]/60 p-3" key={exploit.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-400">Exploit {index + 1}</p>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeGithubExploit(exploit.id)}
                    className="inline-flex items-center gap-1.5 border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-2 py-1 font-mono text-[10px] text-[#ffb4ad] transition-all hover:bg-[#ff5f56]/18 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label htmlFor={`writeup-exploit-label-${exploit.id}`} className={labelClasses}>
                      Title
                    </label>
                    <input
                      id={`writeup-exploit-label-${exploit.id}`}
                      type="text"
                      disabled={disabled}
                      value={exploit.label}
                      onChange={(e) => updateGithubExploit(exploit.id, 'label', e.target.value)}
                      placeholder="Foothold exploit script"
                      maxLength={120}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor={`writeup-exploit-url-${exploit.id}`} className={labelClasses}>
                      GitHub or Gist URL
                    </label>
                    <input
                      id={`writeup-exploit-url-${exploit.id}`}
                      type="url"
                      disabled={disabled}
                      value={exploit.url}
                      onChange={(e) => updateGithubExploit(exploit.id, 'url', e.target.value)}
                      placeholder="https://github.com/user/repo/blob/main/exploit.py"
                      maxLength={500}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label htmlFor={`writeup-exploit-description-${exploit.id}`} className={labelClasses}>
                    Note
                  </label>
                  <textarea
                    id={`writeup-exploit-description-${exploit.id}`}
                    disabled={disabled}
                    value={exploit.description}
                    onChange={(e) => updateGithubExploit(exploit.id, 'description', e.target.value)}
                    placeholder="Short context for what this exploit demonstrates."
                    maxLength={300}
                    rows={2}
                    className={`${inputClasses} resize-none`}
                  />
                  <p className={hintClasses}>{exploit.description.length} / 300 characters</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={addGithubExploit}
            className="inline-flex items-center gap-2 border border-cyan-400/45 bg-cyan-400/10 px-3 py-2 font-mono text-xs text-cyan-300 transition-all hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Exploit Link
          </button>
        </Section>

        <Section
          title="Tools, Skills & Tags"
          badge={
            writeup.tools.length + writeup.skills.length + writeup.tags.length > 0
              ? `${writeup.tools.length + writeup.skills.length + writeup.tags.length} items`
              : null
          }
        >
          <WriteupArrayFields
            disabled={disabled}
            items={writeup.tools}
            label="Tools Used"
            placeholder="e.g., Nmap, Burp Suite, Metasploit"
            onChange={(tools) => onChange({ ...writeup, tools })}
          />

          <WriteupArrayFields
            disabled={disabled}
            items={writeup.skills}
            label="Skills Demonstrated"
            placeholder="e.g., Web Exploitation, Privilege Escalation"
            onChange={(skills) => onChange({ ...writeup, skills })}
          />

          <WriteupArrayFields
            disabled={disabled}
            items={writeup.tags}
            label="Tags"
            placeholder="e.g., Linux, SQLi, Buffer Overflow"
            onChange={(tags) => onChange({ ...writeup, tags })}
          />
        </Section>

        <Section title="Display Settings">
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 border border-cyan-400/20 bg-[#050812]/50 px-3 py-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={writeup.isFeatured}
                onChange={(e) => onChange({ ...writeup, isFeatured: e.target.checked })}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className="font-mono text-xs text-cyan-400">Featured</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 border border-cyan-400/20 bg-[#050812]/50 px-3 py-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={writeup.isActive}
                onChange={(e) => onChange({ ...writeup, isActive: e.target.checked })}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className="font-mono text-xs text-cyan-400">Active / Published</span>
            </label>
          </div>
          <p className={hintClasses}>Ordering is managed with the up/down arrows in the writeups index.</p>
        </Section>

        <div className="space-y-3 border-t border-cyan-400/10 pt-6">
          {!canSubmit && (
            <p className="font-mono text-[10px] leading-relaxed text-[#ffbd2e]">
              {isUnsafePublicActive
                ? 'Resolve the active/public conflict above before saving.'
                : 'Title and slug are required before saving.'}
            </p>
          )}

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

          <div className="flex gap-3">
            <button
              type="button"
              disabled={disabled || pending || !canSubmit}
              onClick={onSave}
              className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {pending ? 'Saving...' : 'Save Writeup'}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onCancel}
              className="inline-flex items-center gap-2 border border-gray-600/45 bg-gray-600/10 px-4 py-2.5 font-mono text-sm text-gray-400 transition-all hover:bg-gray-600/18 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
    </div>
  );
}
