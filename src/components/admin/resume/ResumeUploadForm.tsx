'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

type ResumeUploadFormProps = {
  disabled: boolean;
  onUpload: (formData: FormData) => Promise<void>;
  pending: boolean;
};

export function ResumeUploadForm({ disabled, onUpload, pending }: ResumeUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file && file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      e.target.value = '';
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size must be 10MB or less.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || disabled || pending || uploading) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('versionLabel', versionLabel);

      await onUpload(formData);

      // Reset form on success
      setSelectedFile(null);
      setVersionLabel('');
      const fileInput = document.getElementById('resume-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setVersionLabel('');
    const fileInput = document.getElementById('resume-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const isDisabled = disabled || pending || uploading;

  return (
    <form onSubmit={handleSubmit} className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Upload Resume</div>

      <div className="space-y-6 p-4">
        <fieldset className="space-y-4">
          <legend className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-400">File Details</legend>

          <div>
            <label htmlFor="resume-file" className="mb-1.5 block font-mono text-xs text-gray-300">
              Resume File <span className="text-[#ff5f56]">*</span>
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isDisabled}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white file:mr-3 file:border-0 file:bg-cyan-400/10 file:px-3 file:py-1 file:font-mono file:text-xs file:text-cyan-400 file:transition-all hover:file:bg-cyan-400/20 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              PDF only · Max 10MB · {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
            </p>
          </div>

          <div>
            <label htmlFor="resume-version" className="mb-1.5 block font-mono text-xs text-gray-300">
              Version Label
            </label>
            <input
              id="resume-version"
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g., 2024 - Senior Engineer, Latest, Q1 2025"
              disabled={isDisabled}
              maxLength={120}
              className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 font-mono text-[10px] text-gray-500">{versionLabel.length}/120 characters · Optional</p>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2 border-t border-cyan-400/10 pt-4">
          <button
            type="submit"
            disabled={!selectedFile || isDisabled}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:shadow-none"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>

          {selectedFile && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isDisabled}
              className="inline-flex items-center gap-2 border border-gray-600/45 bg-[#050812]/40 px-4 py-2.5 font-mono text-sm text-gray-400 transition-all hover:border-gray-500/45 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
