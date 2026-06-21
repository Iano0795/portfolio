"use client";

import { useState } from "react";
import { XCircle, Loader2, Mail, AlertTriangle } from "lucide-react";
import type { FlatRejectResult } from "./AccessRequestsManager";

type RejectionFormProps = {
  requestId: string;
  writeupTitle: string;
  requesterEmail: string;
  onReject: (data: { reviewerNote?: string }) => Promise<FlatRejectResult>;
  onCancel: () => void;
};

export function RejectionForm({
  requestId,
  writeupTitle,
  requesterEmail,
  onReject,
  onCancel,
}: RejectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");
  const [rejectResult, setRejectResult] = useState<FlatRejectResult | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await onReject({
      reviewerNote: reviewerNote.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setRejectResult(result);
    } else if (result.error) {
      alert(result.error);
    }
  };

  // Show post-rejection summary (email status) before the panel closes
  if (rejectResult?.success) {
    const emailStatus = rejectResult.emailStatus;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-red-500/35 bg-red-500/10 p-4">
          <XCircle className="mt-0.5 h-5 w-5 text-red-400" strokeWidth={1.8} />
          <div className="flex-1">
            <h3 className="font-mono text-sm font-semibold text-red-400">
              Request Rejected
            </h3>
            <p className="mt-1 text-xs text-red-300">
              The request has been marked as rejected.
            </p>
          </div>
        </div>

        {emailStatus && (
          <div>
            <p className="mb-2 font-mono text-xs font-medium text-cyan-400">
              Rejection Email
            </p>
            {emailStatus.rejectionEmail === "sent" && (
              <div className="flex items-start gap-2 rounded border border-green-500/35 bg-green-500/10 p-3">
                <Mail
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400"
                  strokeWidth={1.8}
                />
                <p className="text-xs text-green-300">
                  Rejection email sent to requester.
                </p>
              </div>
            )}
            {emailStatus.rejectionEmail === "failed" && (
              <div className="flex items-start gap-2 rounded border border-red-500/35 bg-red-500/10 p-3">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400"
                  strokeWidth={1.8}
                />
                <p className="text-xs text-red-300">
                  {emailStatus.rejectionEmailWarning ??
                    "Rejection email failed. Notify the requester manually."}
                </p>
              </div>
            )}
            {emailStatus.rejectionEmail === "skipped" && (
              <div className="flex items-start gap-2 rounded border border-yellow-500/35 bg-yellow-500/10 p-3">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-400"
                  strokeWidth={1.8}
                />
                <p className="text-xs text-yellow-300">
                  {emailStatus.rejectionEmailWarning ??
                    "Rejection email skipped (email not configured)."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
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
      <div className="rounded-md border border-red-500/35 bg-red-500/10 p-4">
        <h3 className="font-mono text-sm font-semibold text-red-400">
          Reject Access Request
        </h3>
        <p className="mt-2 text-xs text-gray-400">
          Writeup: <span className="text-red-300">{writeupTitle}</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Requester: <span className="text-red-300">{requesterEmail}</span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-red-300">
          This action will mark the request as rejected and notify the requester
          by email if email delivery is configured.
        </p>
      </div>

      <div>
        <label
          htmlFor="reviewerNote"
          className="block font-mono text-xs font-medium text-cyan-400"
        >
          Rejection Reason <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="reviewerNote"
          name="reviewerNote"
          value={reviewerNote}
          onChange={(e) => setReviewerNote(e.target.value)}
          rows={4}
          maxLength={1000}
          disabled={isSubmitting}
          className="mt-2 w-full resize-none rounded border border-gray-600/35 bg-[#050812]/55 px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Optional note sent to the requester in the rejection email"
        />
        <p className="mt-1 text-xs text-gray-500">
          {reviewerNote.length} / 1000 characters
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded border border-red-500/45 bg-red-500/10 px-4 py-2 font-mono text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
              Reject Request
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
