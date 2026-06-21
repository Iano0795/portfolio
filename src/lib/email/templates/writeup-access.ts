/**
 * Email templates for writeup access request events — server-only.
 *
 * Each function returns { subject, html, text }.
 * Templates use plain HTML; no external CSS framework is required.
 *
 * SECURITY:
 * - Never include raw tokens, storage paths, or private file URLs in templates.
 * - Access links (containing tokens) are only injected by sendApprovalEmail
 *   and only when WRITEUP_SEND_APPROVAL_LINKS=true.
 */
import "server-only";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

// ── HTML wrapper ──────────────────────────────────────────────────────────────

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0f172a;padding:24px 32px;">
      <p style="margin:0;color:#38bdf8;font-size:16px;font-weight:700;letter-spacing:0.03em;">Violet's Portfolio</p>
    </div>
    <div style="padding:32px;">
      ${body}
    </div>
    <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;padding-right:16px;">${label}</td>
    <td style="padding:6px 0;color:#1e293b;font-size:13px;">${value}</td>
  </tr>`;
}

// ── 1. Owner notification: new request received ───────────────────────────────

export function buildRequestReceivedOwnerEmail(params: {
  requesterName: string;
  requesterEmail: string;
  requesterOrganization?: string | null;
  writeupTitle: string;
  requesterReason: string;
  submittedAt: string;
  adminUrl?: string | null;
}): EmailTemplate {
  const subject = `New writeup access request: ${params.writeupTitle}`;

  const orgRow = params.requesterOrganization
    ? detailRow("Organization", params.requesterOrganization)
    : "";

  const adminButton = params.adminUrl
    ? `<p style="margin:24px 0 0;">
        <a href="${params.adminUrl}"
           style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:6px;font-weight:600;font-size:14px;">
          Review in Control Center
        </a>
       </p>`
    : "";

  const html = wrapHtml(
    subject,
    `<h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">New Access Request</h2>
     <p style="margin:0 0 24px;color:#475569;font-size:14px;">
       Someone has requested access to a restricted writeup in your portfolio.
     </p>

     <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin-bottom:24px;">
       <p style="margin:0 0 12px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Request Details</p>
       <table style="border-collapse:collapse;width:100%;">
         <tbody>
           ${detailRow("Writeup", `<strong>${params.writeupTitle}</strong>`)}
           ${detailRow("Name", params.requesterName)}
           ${detailRow("Email", params.requesterEmail)}
           ${orgRow}
           ${detailRow("Submitted", params.submittedAt)}
         </tbody>
       </table>
     </div>

     <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin-bottom:24px;">
       <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Reason for Access</p>
       <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;white-space:pre-wrap;">${params.requesterReason}</p>
     </div>

     ${adminButton}`
  );

  const lines = [
    "New Writeup Access Request",
    "",
    `Writeup:     ${params.writeupTitle}`,
    `Name:        ${params.requesterName}`,
    `Email:       ${params.requesterEmail}`,
    ...(params.requesterOrganization ? [`Organization: ${params.requesterOrganization}`] : []),
    `Submitted:   ${params.submittedAt}`,
    "",
    "Reason for Access:",
    params.requesterReason,
    "",
    ...(params.adminUrl ? [`Review in Control Center: ${params.adminUrl}`] : []),
  ];

  return { subject, html, text: lines.join("\n") };
}

// ── 2. Requester confirmation ─────────────────────────────────────────────────

export function buildRequestConfirmationEmail(params: {
  requesterName: string;
  writeupTitle: string;
}): EmailTemplate {
  const subject = "Your writeup access request was received";

  const html = wrapHtml(
    subject,
    `<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Request Received</h2>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi ${params.requesterName},</p>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">
       Your request to access <strong>"${params.writeupTitle}"</strong> has been received.
     </p>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">
       Violet will review your request. Please allow some time for the review process.
     </p>
     <p style="margin:0;color:#64748b;font-size:13px;">
       You will be notified once a decision has been made.
     </p>`
  );

  const text = [
    "Request Received",
    "",
    `Hi ${params.requesterName},`,
    "",
    `Your request to access "${params.writeupTitle}" has been received.`,
    "",
    "Violet will review your request. Please allow some time for the review process.",
    "",
    "You will be notified once a decision has been made.",
  ].join("\n");

  return { subject, html, text };
}

// ── 3. Requester: request approved ───────────────────────────────────────────

export function buildRequestApprovedEmail(params: {
  requesterName: string;
  writeupTitle: string;
  expiresAtFormatted?: string | null;
  maxViews?: number | null;
  accessLink?: string | null;
}): EmailTemplate {
  const subject = "Your writeup access request was approved";

  const grantRows = [
    params.expiresAtFormatted ? detailRow("Access expires", params.expiresAtFormatted) : "",
    params.maxViews ? detailRow("Max views", String(params.maxViews)) : "",
  ]
    .filter(Boolean)
    .join("");

  const grantSection = grantRows
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin-bottom:24px;">
         <p style="margin:0 0 12px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Grant Details</p>
         <table style="border-collapse:collapse;width:100%;"><tbody>${grantRows}</tbody></table>
       </div>`
    : "";

  const accessSection = params.accessLink
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:20px;margin-bottom:24px;">
         <p style="margin:0 0 12px;color:#15803d;font-size:14px;font-weight:600;">Your Access Link</p>
         <p style="margin:0 0 16px;color:#374151;font-size:13px;">
           Click the button below to access the writeup. This link is personal — please do not share it.
         </p>
         <a href="${params.accessLink}"
            style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:6px;font-weight:600;font-size:14px;">
           Access Writeup
         </a>
       </div>`
    : `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:16px;margin-bottom:24px;">
         <p style="margin:0;color:#92400e;font-size:13px;">
           Your access will be delivered to you shortly. Violet will reach out with further details.
         </p>
       </div>`;

  const html = wrapHtml(
    subject,
    `<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Access Approved ✓</h2>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi ${params.requesterName},</p>
     <p style="margin:0 0 24px;color:#334155;font-size:14px;">
       Your request to access <strong>"${params.writeupTitle}"</strong> has been approved.
     </p>
     ${grantSection}
     ${accessSection}`
  );

  const textLines = [
    "Access Approved",
    "",
    `Hi ${params.requesterName},`,
    "",
    `Your request to access "${params.writeupTitle}" has been approved.`,
    "",
  ];
  if (params.expiresAtFormatted) textLines.push(`Access expires: ${params.expiresAtFormatted}`);
  if (params.maxViews) textLines.push(`Max views: ${params.maxViews}`);
  if (params.expiresAtFormatted || params.maxViews) textLines.push("");
  if (params.accessLink) {
    textLines.push(`Access your writeup: ${params.accessLink}`);
    textLines.push("This link is personal — please do not share it.");
  } else {
    textLines.push(
      "Your access will be delivered to you shortly. Violet will reach out with further details."
    );
  }

  return { subject, html, text: textLines.join("\n") };
}

// ── 4. Requester: request rejected ───────────────────────────────────────────

export function buildRequestRejectedEmail(params: {
  requesterName: string;
  writeupTitle: string;
  reviewerNote?: string | null;
}): EmailTemplate {
  const subject = "Update on your writeup access request";

  const noteSection = params.reviewerNote
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin-bottom:24px;">
         <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">${params.reviewerNote}</p>
       </div>`
    : "";

  const html = wrapHtml(
    subject,
    `<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Request Update</h2>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi ${params.requesterName},</p>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">
       Thank you for your interest in <strong>"${params.writeupTitle}"</strong>.
     </p>
     <p style="margin:0 0 24px;color:#334155;font-size:14px;">
       After review, we are unable to approve your access request at this time.
     </p>
     ${noteSection}
     <p style="margin:0;color:#64748b;font-size:13px;">Thank you for your understanding.</p>`
  );

  const textLines = [
    "Request Update",
    "",
    `Hi ${params.requesterName},`,
    "",
    `Thank you for your interest in "${params.writeupTitle}".`,
    "",
    "After review, we are unable to approve your access request at this time.",
    "",
    ...(params.reviewerNote ? [params.reviewerNote, ""] : []),
    "Thank you for your understanding.",
  ];

  return { subject, html, text: textLines.join("\n") };
}

// ── 5. Requester: grant revoked ───────────────────────────────────────────────

export function buildGrantRevokedEmail(params: {
  requesterName: string;
  writeupTitle: string;
}): EmailTemplate {
  const subject = "Your writeup access has been revoked";

  const html = wrapHtml(
    subject,
    `<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Access Revoked</h2>
     <p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi ${params.requesterName},</p>
     <p style="margin:0 0 24px;color:#334155;font-size:14px;">
       Your access to <strong>"${params.writeupTitle}"</strong> has been revoked.
     </p>
     <p style="margin:0;color:#64748b;font-size:13px;">
       If you have questions, please contact Violet directly.
     </p>`
  );

  const text = [
    "Access Revoked",
    "",
    `Hi ${params.requesterName},`,
    "",
    `Your access to "${params.writeupTitle}" has been revoked.`,
    "",
    "If you have questions, please contact Violet directly.",
  ].join("\n");

  return { subject, html, text };
}
