"use client";

import { useState } from 'react';
import { CheckCircle2, Loader2, Copy, Check } from 'lucide-react';

type ApprovalFormProps = {
  requestId: string;
  writeupTitle: string;
  requesterEmail: string;
  onApprove: (data: {
    reviewerNote?: string;
    expiresInDays?: number;
    maxViews?: number;
    tokenLabel?: string;
  }) => Promise<{ success: boolean; error?: string; rawToken?: string }>;
  onCancel: () => void;
};

export function ApprovalForm({
  requestId,
  writeupTitle,
  requesterEmail,
  onApprove,
  onCancel,
}: ApprovalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [formData, setFormData] = useState({
    reviewerNote: '',
    expiresInDays: 14,
    maxViews: 5,
    tokenLabel: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expiresInDays' || name === 'maxViews' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await onApprove({
      reviewerNote: formData.reviewerNote.trim() || undefined,
      expiresInDays: formData.expiresInDays || undefined,
      maxViews: formData.maxViews || undefined,
      tokenLabel: formData.tokenLabel.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success && result.rawToken) {
      setRawToken(result.rawToken);
      setShowSuccess(true);
    } else if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleCopyToken = async () => {
    if (rawToken) {
      await navigator.clipboard.writeText(rawToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  if (showSuccess && rawToken) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-md border border-green-500/35 bg-green-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-400" strokeWidth={1.8} />
          <div className="flex-1">
            <h3 className="font-mono text-sm font-semibold text-green-400">
              Access Request Approved
            </h3>
            <p className="mt-1 text-xs text-green-300">
              Grant created successfully. The access token is displayed below.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-yellow-500/35 bg-yellow-500/10 p-4">
          <p className="font-mono text-xs font-semibold text-yellow-400">
            ⚠️ Security Notice
          </p>
          <p className="mt-2 text-xs leading-relaxed text-yellow-300">
            This token will only be shown once. Copy it now and send it to the requester
            via email. After closing this panel, the token cannot be retrieved.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-yellow-300">
            <strong>Note:</strong> Email delivery and secure access page features are
            planned for upcoming tasks.
          </p>
        </div>

        <div>
          <label className="block font-mono text-xs font-medium text-cyan-400">
            Raw Access Token
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              readOnly
              value={rawToken}
              className="flex-1 rounded border border-cyan-400/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-cyan-300"
            />
            <button
              type="button"
              onClick={handleCopyToken}
              className="flex items-center gap-2 rounded border border-cyan-400/45 bg-cyan-400/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-400/20"
            >
              {tokenCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-400/35 bg-gray-400/10 px-4 py-2 font-mono text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-400/20"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 p-4">
        <h3 className="font-mono text-sm font-semibold text-cyan-400">Approve Access Request</h3>
        <p className="mt-2 text-xs text-gray-400">
          Writeup: <span className="text-cyan-300">{writeupTitle}</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Requester: <span className="text-cyan-300">{requesterEmail}</span>
        </p>
      </div>

      <div>
        <label htmlFor="reviewerNote" className="block font-mono text-xs font-medium text-cyan-400">
          Reviewer Note <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="reviewerNote"
          name="reviewerNote"
          value={formData.reviewerNote}
          onChange={handleChange}
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
          className="mt-2 w-full resize-none rounded border border-gray-600/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Internal note about this approval (not sent to requester)"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.reviewerNote.length} / 1000 characters
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiresInDays" className="block font-mono text-xs font-medium text-cyan-400">
            Expires In (Days)
          </label>
          <input
            id="expiresInDays"
            name="expiresInDays"
            type="number"
            min="1"
            max="365"
            value={formData.expiresInDays}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-2 w-full rounded border border-gray-600/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">Default: 14 days</p>
        </div>

        <div>
          <label htmlFor="maxViews" className="block font-mono text-xs font-medium text-cyan-400">
            Max Views
          </label>
          <input
            id="maxViews"
            name="maxViews"
            type="number"
            min="1"
            max="100"
            value={formData.maxViews}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-2 w-full rounded border border-gray-600/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">Default: 5 views</p>
        </div>
      </div>

      <div>
        <label htmlFor="tokenLabel" className="block font-mono text-xs font-medium text-cyan-400">
          Token Label <span className="text-gray-500">(Optional)</span>
        </label>
        <input
          id="tokenLabel"
          name="tokenLabel"
          type="text"
          value={formData.tokenLabel}
          onChange={handleChange}
          maxLength={120}
          disabled={isSubmitting}
          className="mt-2 w-full rounded border border-gray-600/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Auto-generated if empty"
        />
        <p className="mt-1 text-xs text-gray-500">
          Custom label for identifying this token
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded border border-green-500/45 bg-green-500/10 px-4 py-2 font-mono text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Approve & Create Grant
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded border border-gray-400/35 bg-gray-400/10 px-4 py-2 font-mono text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
