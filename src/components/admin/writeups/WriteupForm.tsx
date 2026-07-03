import { AlertTriangle, Save, X } from 'lucide-react';
import type { WriteupEditorValue, ProjectOption } from './types';
import { WriteupArrayFields } from './WriteupArrayFields';

type WriteupFormProps = {
  disabled: boolean;
  writeup: WriteupEditorValue;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onChange: (writeup: WriteupEditorValue) => void;
  onSave: () => void;
  pending: boolean;
  projects: ProjectOption[];
};

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 180);
}

export function WriteupForm({ disabled, writeup, mode, onCancel, onChange, onSave, pending, projects }: WriteupFormProps) {
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

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">
        {mode === 'create' ? 'Create New Writeup' : 'Edit Writeup'}
      </div>

      <div className="space-y-6 p-4">
        {/* Basic Info Section */}
        <section className="space-y-4">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Basic Info</h3>

          <div>
            <label htmlFor="writeup-title" className="mb-2 block font-mono text-xs text-cyan-400">
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
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="writeup-slug" className="mb-2 block font-mono text-xs text-cyan-400">
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
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-600">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div>
            <label htmlFor="writeup-project" className="mb-2 block font-mono text-xs text-cyan-400">
              Linked Project (Optional)
            </label>
            <select
              id="writeup-project"
              disabled={disabled}
              value={writeup.projectId || ''}
              onChange={(e) => onChange({ ...writeup, projectId: e.target.value || null })}
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- None --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <p className="mt-1 font-mono text-[10px] text-gray-600">Connect this writeup to a portfolio project card</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="writeup-platform" className="mb-2 block font-mono text-xs text-cyan-400">
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
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="writeup-difficulty" className="mb-2 block font-mono text-xs text-cyan-400">
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
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="writeup-category" className="mb-2 block font-mono text-xs text-cyan-400">
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
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="writeup-lab-type" className="mb-2 block font-mono text-xs text-cyan-400">
              Lab Type
            </label>
            <select
              id="writeup-lab-type"
              disabled={disabled}
              value={writeup.labType}
              onChange={(e) => onChange({ ...writeup, labType: e.target.value as 'offensive' | 'defensive' | '' })}
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Select classification --</option>
              <option value="offensive">Offensive</option>
              <option value="defensive">Defensive</option>
            </select>
            <p className="mt-1 font-mono text-[10px] text-gray-600">
              Required for publicly listed Violet labs. Use the dominant purpose of the lab, not every tool mentioned.
            </p>
          </div>
        </section>

        {/* Safety & Visibility Section */}
        <section className="space-y-4 border-t border-cyan-400/10 pt-6">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Safety & Visibility</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="writeup-machine-status" className="mb-2 block font-mono text-xs text-cyan-400">
                Machine Status <span className="text-[#ff5f56]">*</span>
              </label>
              <select
                id="writeup-machine-status"
                disabled={disabled}
                value={writeup.machineStatus}
                onChange={(e) => onChange({ ...writeup, machineStatus: e.target.value as 'active' | 'retired' | 'other' })}
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="retired">Retired</option>
                <option value="active">Active</option>
                <option value="other">Other</option>
              </select>
              <p className="mt-1 font-mono text-[10px] text-gray-600">
                {writeup.machineStatus === 'active' && '⚠️ Active machines should not be public'}
                {writeup.machineStatus === 'retired' && 'Safe for public or restricted access'}
                {writeup.machineStatus === 'other' && 'Custom or non-platform labs'}
              </p>
            </div>

            <div>
              <label htmlFor="writeup-visibility" className="mb-2 block font-mono text-xs text-cyan-400">
                Visibility <span className="text-[#ff5f56]">*</span>
              </label>
              <select
              id="writeup-visibility"
              disabled={disabled}
              value={writeup.visibility}
              onChange={(e) => handleVisibilityChange(e.target.value as 'public' | 'restricted' | 'private')}
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </select>
              <p className="mt-1 font-mono text-[10px] text-gray-600">
                {writeup.visibility === 'public' && 'Visible to all visitors'}
                {writeup.visibility === 'restricted' && 'Requires request/approval'}
                {writeup.visibility === 'private' && 'Portfolio members only'}
              </p>
            </div>
          </div>

          {writeup.machineStatus === 'active' && writeup.visibility === 'public' && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ff5f56]">
              ⚠️ Security Warning: Active machines cannot have public visibility. Change status to "retired" or visibility to "restricted" or "private".
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
                  Only approve active-lab access where the platform or lab rules permit solution sharing.
                  Active labs default to not requestable until this is explicitly enabled.
                </p>
              </div>
            </div>
          )}

          <div className="border border-cyan-400/20 bg-cyan-400/5 p-3 font-mono text-[10px] leading-relaxed text-gray-400">
            <strong className="text-cyan-300">Visibility Guide:</strong>
            <ul className="mt-2 space-y-1 pl-4">
              <li><strong className="text-white">Public:</strong> Safe content for everyone (retired machines only)</li>
              <li><strong className="text-white">Restricted:</strong> Requires access request & approval (default for most writeups)</li>
              <li><strong className="text-white">Private:</strong> Never shown publicly, members only</li>
            </ul>
          </div>
        </section>

        {/* Public Content Section */}
        <section className="space-y-4 border-t border-cyan-400/10 pt-6">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Public Content</h3>
          
          <div className="border border-[#ffbd2e]/20 bg-[#ffbd2e]/5 p-3 font-mono text-[10px] leading-relaxed text-gray-400">
            <strong className="text-[#ffbd2e]">⚠️ Security Notice:</strong> Only include safe public summary content here.
            Do not include full exploitation steps, active-machine details, credentials, flags, or restricted walkthrough content.
          </div>

          <div>
            <label htmlFor="writeup-teaser" className="mb-2 block font-mono text-xs text-cyan-400">
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
              className="w-full resize-none border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-600">{writeup.publicTeaser.length} / 600 characters</p>
          </div>

          <div>
            <label htmlFor="writeup-summary" className="mb-2 block font-mono text-xs text-cyan-400">
              Public Summary (Safe Overview)
            </label>
            <textarea
              id="writeup-summary"
              disabled={disabled}
              value={writeup.publicSummary}
              onChange={(e) => onChange({ ...writeup, publicSummary: e.target.value })}
              placeholder="A safe public summary of the challenge, approach, and lessons learned..."
              maxLength={1200}
              rows={6}
              className="w-full resize-none border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-600">{writeup.publicSummary.length} / 1200 characters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="writeup-reading-time" className="mb-2 block font-mono text-xs text-cyan-400">
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
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="writeup-published-at" className="mb-2 block font-mono text-xs text-cyan-400">
                Published Date
              </label>
              <input
                id="writeup-published-at"
                type="date"
                disabled={disabled}
                value={writeup.publishedAt}
                onChange={(e) => onChange({ ...writeup, publishedAt: e.target.value })}
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="writeup-cover-image" className="mb-2 block font-mono text-xs text-cyan-400">
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
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="writeup-markdown" className="mb-2 block font-mono text-xs text-cyan-400">
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
              className="w-full resize-y border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs leading-6 text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-600">
              {writeup.contentMarkdown.length} / 100000 characters. This is returned publicly only for public, non-active writeups.
            </p>
          </div>

          {writeup.visibility === 'public' && writeup.machineStatus === 'active' && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]">
              Public full content is blocked while this lab is active.
            </div>
          )}
        </section>

        {/* Tools, Skills, Tags Section */}
        <section className="space-y-4 border-t border-cyan-400/10 pt-6">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Tools, Skills & Tags</h3>

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
        </section>

        {/* File Metadata Section */}
        <section className="space-y-4 border-t border-cyan-400/10 pt-6">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Restricted File (Metadata Only)</h3>
          
          <div className="border border-cyan-400/20 bg-cyan-400/5 p-3 font-mono text-[10px] leading-relaxed text-gray-400">
            <strong className="text-cyan-300">Note:</strong> File upload UI will be added in a future update. For now, you can manually enter file metadata
            if you've uploaded a file directly to the Supabase storage bucket.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="writeup-storage-bucket" className="mb-2 block font-mono text-xs text-cyan-400">
                Storage Bucket
              </label>
              <input
                id="writeup-storage-bucket"
                type="text"
                disabled={disabled}
                value={writeup.storageBucket}
                onChange={(e) => onChange({ ...writeup, storageBucket: e.target.value })}
                placeholder="writeups"
                maxLength={120}
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="writeup-file-name" className="mb-2 block font-mono text-xs text-cyan-400">
                File Name
              </label>
              <input
                id="writeup-file-name"
                type="text"
                disabled={disabled}
                value={writeup.fileName}
                onChange={(e) => onChange({ ...writeup, fileName: e.target.value })}
                placeholder="obscurity-writeup.pdf"
                maxLength={240}
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="writeup-storage-path" className="mb-2 block font-mono text-xs text-cyan-400">
              Storage Path
            </label>
            <input
              id="writeup-storage-path"
              type="text"
              disabled={disabled}
              value={writeup.storagePath}
              onChange={(e) => onChange({ ...writeup, storagePath: e.target.value })}
              placeholder="writeups/ian/htb-obscurity/2024-01-15-obscurity-writeup.pdf"
              maxLength={500}
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="writeup-file-type" className="mb-2 block font-mono text-xs text-cyan-400">
              File Type (MIME)
            </label>
            <input
              id="writeup-file-type"
              type="text"
              disabled={disabled}
              value={writeup.fileType}
              onChange={(e) => onChange({ ...writeup, fileType: e.target.value })}
              placeholder="application/pdf"
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </section>

        {/* Display Section */}
        <section className="space-y-4 border-t border-cyan-400/10 pt-6">
          <h3 className="border-b border-cyan-400/10 pb-2 font-mono text-xs font-semibold text-white">Display Settings</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="writeup-order" className="mb-2 block font-mono text-xs text-cyan-400">
                Order Index
              </label>
              <input
                id="writeup-order"
                type="number"
                disabled={disabled}
                value={writeup.orderIndex}
                onChange={(e) => onChange({ ...writeup, orderIndex: parseInt(e.target.value, 10) || 0 })}
                min={0}
                className="w-full border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-end">
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
            </div>

            <div className="flex items-end">
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
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-cyan-400/10 pt-6">
          <button
            type="button"
            disabled={disabled || pending}
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
