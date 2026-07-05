/**
 * High-level email send functions for writeup access events — server-only.
 *
 * Each function builds the appropriate template, sends via the provider, and
 * returns a structured result. They never throw.
 *
 * SECURITY:
 * - Raw access tokens are accepted only to construct the access link URL.
 *   They are never stored, logged, or included in logged metadata.
 * - Approval links are only constructed when WRITEUP_SEND_APPROVAL_LINKS=true.
 * - When that flag is false, sendApprovalEmail returns `skipped` — the admin
 *   will see a clear warning in the UI.
 */
import "server-only";
import { sendEmail, type SendEmailResult } from "./provider";
import {
  buildRequestApprovedEmail,
  buildRequestRejectedEmail,
  buildGrantRevokedEmail,
} from "./templates/writeup-access";

// ── Config ────────────────────────────────────────────────────────────────────

type EmailConfig = {
  from: string;
  replyTo?: string;
};

function getEmailConfig(): EmailConfig | null {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Email] EMAIL_FROM not configured — email will be skipped");
    } else {
      console.error("[Email] EMAIL_FROM is missing in production");
    }
    return null;
  }
  return {
    from,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  };
}

// ── Approval email ────────────────────────────────────────────────────────────

export type ApprovalEmailOptions = {
  requesterEmail: string;
  requesterName: string;
  writeupTitle: string;
  expiresAt?: string | null;
  maxViews?: number | null;
  /** Raw token — used only to construct the access URL. Never stored or logged. */
  rawToken?: string;
};

/**
 * Send an approval email to the requester.
 *
 * Returns `skipped` (with a human-readable reason) when
 * `WRITEUP_SEND_APPROVAL_LINKS=false` — this is the default until the secure
 * access page (Task 31) is deployed. The admin sees a clear warning in the UI.
 *
 * The raw token is used only within this call to construct the link URL; it is
 * never stored, passed to logs, or included in any persistent record.
 */
export async function sendApprovalEmail(options: ApprovalEmailOptions): Promise<SendEmailResult> {
  const sendLinks = process.env.WRITEUP_SEND_APPROVAL_LINKS?.toLowerCase() === "true";

  if (!sendLinks) {
    return {
      status: "skipped",
      reason:
        "WRITEUP_SEND_APPROVAL_LINKS is disabled. Approval email with access link will not be sent until the access page (Task 31) is deployed.",
    };
  }

  const config = getEmailConfig();
  if (!config) {
    return { status: "skipped", reason: "EMAIL_FROM not configured" };
  }

  const accessBaseUrl = process.env.WRITEUP_ACCESS_BASE_URL;
  const accessLink =
    accessBaseUrl && options.rawToken
      ? `${accessBaseUrl}/writeups/access/${options.rawToken}`
      : null;

  const expiresAtFormatted = options.expiresAt
    ? new Date(options.expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  const template = buildRequestApprovedEmail({
    requesterName: options.requesterName,
    writeupTitle: options.writeupTitle,
    expiresAtFormatted,
    maxViews: options.maxViews,
    accessLink,
  });

  return sendEmail({
    to: options.requesterEmail,
    from: config.from,
    replyTo: config.replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// ── Rejection email ───────────────────────────────────────────────────────────

export async function sendRejectionEmail(params: {
  requesterEmail: string;
  requesterName: string;
  writeupTitle: string;
  reviewerNote?: string | null;
}): Promise<SendEmailResult> {
  const config = getEmailConfig();
  if (!config) {
    return { status: "skipped", reason: "EMAIL_FROM not configured" };
  }

  const template = buildRequestRejectedEmail({
    requesterName: params.requesterName,
    writeupTitle: params.writeupTitle,
    reviewerNote: params.reviewerNote,
  });

  return sendEmail({
    to: params.requesterEmail,
    from: config.from,
    replyTo: config.replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// ── Revocation email ──────────────────────────────────────────────────────────

export async function sendGrantRevokedEmail(params: {
  requesterEmail: string;
  requesterName: string;
  writeupTitle: string;
}): Promise<SendEmailResult> {
  const config = getEmailConfig();
  if (!config) {
    return { status: "skipped", reason: "EMAIL_FROM not configured" };
  }

  const template = buildGrantRevokedEmail({
    requesterName: params.requesterName,
    writeupTitle: params.writeupTitle,
  });

  return sendEmail({
    to: params.requesterEmail,
    from: config.from,
    replyTo: config.replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
