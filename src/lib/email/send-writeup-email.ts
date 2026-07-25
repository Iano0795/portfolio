/**
 * High-level email send functions for writeup access events — server-only.
 *
 * Each function builds the appropriate template, sends via the provider, and
 * returns a structured result. They never throw.
 *
 * SECURITY:
 * - Raw access tokens are accepted only to construct the access link/email
 *   content. They are never stored, logged, or included in logged metadata.
 * - The writeup link + token are only included when the portfolio has a
 *   public URL configured (portfolios.public_url); otherwise the requester
 *   is told the owner will follow up manually.
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
  writeupSlug: string;
  /** Public base URL of the portfolio's public site (portfolios.public_url). */
  portfolioPublicUrl?: string | null;
  expiresAt?: string | null;
  maxViews?: number | null;
  /** Raw token — used only to construct the email content. Never stored or logged. */
  rawToken?: string;
};

/**
 * Send an approval email to the requester.
 *
 * The email links to the writeup's page on the portfolio's public site and
 * shows the raw access token as plain text — the requester pastes the token
 * into a form on that page to unlock the writeup (see violets_portfolio's
 * token redemption flow). The link+token block is only included when
 * `portfolioPublicUrl` (portfolios.public_url) is configured for this
 * portfolio; otherwise the requester is told the owner will follow up
 * manually, and the admin UI surfaces a warning.
 *
 * The raw token is used only within this call to build the email content; it
 * is never stored, passed to logs, or included in any persistent record.
 */
export async function sendApprovalEmail(options: ApprovalEmailOptions): Promise<SendEmailResult> {
  const config = getEmailConfig();
  if (!config) {
    return { status: "skipped", reason: "EMAIL_FROM not configured" };
  }

  const accessLink =
    options.portfolioPublicUrl && options.writeupSlug
      ? `${options.portfolioPublicUrl}/writeups/${options.writeupSlug}`
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
    accessToken: accessLink ? options.rawToken ?? null : null,
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
