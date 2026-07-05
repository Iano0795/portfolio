"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminSupabaseClient,
  getAdminSessionTokens,
} from "@/lib/auth/admin-session";
import { requirePortfolioAccess } from "@/lib/auth/portfolio-access";
import {
  generateAccessToken,
  hashAccessToken,
  generateTokenLabel,
} from "@/lib/writeups/tokens";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendGrantRevokedEmail,
} from "@/lib/email/send-writeup-email";
import { logEmailNotification } from "@/lib/email/log-email-notification";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type EmailStatus = "sent" | "failed" | "skipped";

export type ApproveEmailResult = {
  approvalEmail: EmailStatus;
  approvalEmailWarning?: string;
};

export type RejectEmailResult = {
  rejectionEmail: EmailStatus;
  rejectionEmailWarning?: string;
};

export type RevokeEmailResult = {
  revocationEmail: EmailStatus;
  revocationEmailWarning?: string;
};

// ── Approve ───────────────────────────────────────────────────────────────────

/**
 * Approve a pending access request and create a grant.
 *
 * EMAIL BEHAVIOUR:
 * - Sends approval email to requester only if WRITEUP_SEND_APPROVAL_LINKS=true.
 * - If disabled (default until Task 31), returns status=skipped with a warning.
 * - Email failure never blocks the approval — the grant is always created first.
 * - Raw token is used only to construct the access link; it is never stored or logged.
 */
export async function approveAccessRequest(
  portfolioSlug: string,
  requestId: string,
  payload: {
    reviewerNote?: string;
    expiresInDays?: number;
    expiresAt?: string;
    maxViews?: number;
    tokenLabel?: string;
  },
): Promise<
  ActionResult<{
    rawToken: string;
    grantId: string;
    emailStatus: ApproveEmailResult;
  }>
> {
  try {
    const access = await requirePortfolioAccess(portfolioSlug);

    if (access.member.role === "viewer") {
      return { success: false, error: "Viewers cannot approve requests" };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: "Invalid request ID" };
    }

    if (payload.reviewerNote && payload.reviewerNote.length > 1000) {
      return {
        success: false,
        error: "Reviewer note must be 1000 characters or less",
      };
    }
    if (
      payload.expiresInDays &&
      (payload.expiresInDays < 1 || payload.expiresInDays > 365)
    ) {
      return { success: false, error: "Expiry days must be between 1 and 365" };
    }
    if (payload.maxViews && (payload.maxViews < 1 || payload.maxViews > 100)) {
      return { success: false, error: "Max views must be between 1 and 100" };
    }
    if (payload.tokenLabel && payload.tokenLabel.length > 120) {
      return {
        success: false,
        error: "Token label must be 120 characters or less",
      };
    }

    // Load request with writeup details
    const { data: request, error: requestError } = await supabase
      .from("writeup_access_requests")
      .select(
        `
        *,
        lab_writeups!inner(
          id,
          title,
          visibility,
          machine_status,
          is_requestable,
          is_active
        )
      `,
      )
      .eq("id", requestId)
      .eq("portfolio_id", access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, error: `Request is already ${request.status}` };
    }

    const writeup = Array.isArray(request.lab_writeups)
      ? request.lab_writeups[0]
      : request.lab_writeups;

    if (!writeup) {
      return { success: false, error: "Associated writeup not found" };
    }
    if (!writeup.is_active) {
      return { success: false, error: "Writeup is not active" };
    }
    if (writeup.visibility !== "restricted") {
      return {
        success: false,
        error: "Only restricted writeups can have access grants",
      };
    }
    if (!writeup.is_requestable) {
      return {
        success: false,
        error: "This writeup is not marked requestable",
      };
    }

    const { data: existingGrant } = await supabase
      .from("writeup_access_grants")
      .select("id")
      .eq("request_id", requestId)
      .maybeSingle();

    if (existingGrant) {
      return { success: false, error: "Grant already exists for this request" };
    }

    // Calculate expiry
    let expiresAt: string | null = null;
    if (payload.expiresAt) {
      expiresAt = payload.expiresAt;
    } else if (payload.expiresInDays) {
      const d = new Date();
      d.setDate(d.getDate() + payload.expiresInDays);
      expiresAt = d.toISOString();
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      expiresAt = d.toISOString();
    }

    const maxViews = payload.maxViews ?? 5;

    // Generate token — raw token stays in memory only
    const rawToken = generateAccessToken();
    const tokenHash = hashAccessToken(rawToken);
    const tokenLabel = payload.tokenLabel || generateTokenLabel(rawToken);

    // Create grant
    const { data: grant, error: grantError } = await supabase
      .from("writeup_access_grants")
      .insert({
        portfolio_id: access.portfolio.id,
        writeup_id: writeup.id,
        request_id: requestId,
        requester_email: request.requester_email,
        token_hash: tokenHash,
        token_label: tokenLabel,
        expires_at: expiresAt,
        max_views: maxViews,
        views_used: 0,
        created_by: access.user.id,
      })
      .select("id")
      .single();

    if (grantError || !grant) {
      console.error("Failed to create grant:", grantError);
      return { success: false, error: "Failed to create grant" };
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("writeup_access_requests")
      .update({
        status: "approved",
        reviewer_user_id: access.user.id,
        reviewer_note: payload.reviewerNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Failed to update request:", updateError);
      return { success: false, error: "Failed to update request status" };
    }

    // Audit logs
    await supabase.from("writeup_access_logs").insert({
      portfolio_id: access.portfolio.id,
      writeup_id: writeup.id,
      request_id: requestId,
      event_type: "request_approved",
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        reviewer_note: payload.reviewerNote || null,
        approved_by_role: access.member.role,
      },
    });

    await supabase.from("writeup_access_logs").insert({
      portfolio_id: access.portfolio.id,
      writeup_id: writeup.id,
      grant_id: grant.id,
      request_id: requestId,
      event_type: "grant_created",
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        expires_at: expiresAt,
        max_views: maxViews,
        token_label: tokenLabel,
      },
    });

    // ── Send approval email ──────────────────────────────────────────────────
    // rawToken is passed here and used ONLY to construct the access link URL.
    // It is not stored in the email log or any database record.
    const emailResult = await sendApprovalEmail({
      requesterEmail: request.requester_email,
      requesterName: request.requester_name,
      writeupTitle: writeup.title,
      expiresAt,
      maxViews,
      rawToken, // consumed here, not forwarded to logs
    });

    // Log email attempt — no raw token in metadata
    const approvalSubject = "Your writeup access request was approved";
    await logEmailNotification({
      portfolioId: access.portfolio.id,
      requestId,
      grantId: grant.id,
      writeupId: writeup.id,
      templateKey: "request_approved_requester",
      recipientEmail: request.requester_email,
      subject: approvalSubject,
      status: emailResult.status,
      provider:
        emailResult.status !== "skipped"
          ? ((emailResult as { provider?: string }).provider ?? null)
          : null,
      providerMessageId:
        emailResult.status === "sent"
          ? ((emailResult as { messageId?: string }).messageId ?? null)
          : null,
      errorMessage:
        emailResult.status === "failed"
          ? ((emailResult as { error?: string }).error ?? null)
          : null,
      metadata: {
        writeup_title: writeup.title,
        template_key: "request_approved_requester",
        skip_reason:
          emailResult.status === "skipped"
            ? (emailResult as { reason?: string }).reason
            : undefined,
        environment: process.env.NODE_ENV,
      },
    });

    // Derive human-readable warning for admin UI
    let approvalEmailWarning: string | undefined;
    if (emailResult.status === "skipped") {
      const reason = (emailResult as { reason?: string }).reason ?? "";
      if (reason.includes("WRITEUP_SEND_APPROVAL_LINKS")) {
        approvalEmailWarning =
          "Approval email was not sent because secure access link delivery is disabled until the access page (Task 31) is deployed. Share the token with the requester manually.";
      } else {
        approvalEmailWarning = `Approval email skipped: ${reason}`;
      }
    } else if (emailResult.status === "failed") {
      approvalEmailWarning = `Approval email failed to send: ${(emailResult as { error?: string }).error ?? "unknown error"}`;
    }

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return {
      success: true,
      data: {
        rawToken,
        grantId: grant.id,
        emailStatus: {
          approvalEmail: emailResult.status,
          ...(approvalEmailWarning ? { approvalEmailWarning } : {}),
        },
      },
    };
  } catch (error) {
    console.error("Failed to approve request:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ── Reject ────────────────────────────────────────────────────────────────────

export async function rejectAccessRequest(
  portfolioSlug: string,
  requestId: string,
  payload: {
    reviewerNote?: string;
  },
): Promise<ActionResult<{ emailStatus: RejectEmailResult }>> {
  try {
    const access = await requirePortfolioAccess(portfolioSlug);

    if (access.member.role === "viewer") {
      return { success: false, error: "Viewers cannot reject requests" };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: "Invalid request ID" };
    }

    if (payload.reviewerNote && payload.reviewerNote.length > 1000) {
      return {
        success: false,
        error: "Reviewer note must be 1000 characters or less",
      };
    }

    // Load request with writeup title for the rejection email
    const { data: request, error: requestError } = await supabase
      .from("writeup_access_requests")
      .select(
        `
        id, status, writeup_id, requester_email, requester_name,
        lab_writeups!inner(title)
      `,
      )
      .eq("id", requestId)
      .eq("portfolio_id", access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, error: `Request is already ${request.status}` };
    }

    const writeup = Array.isArray(request.lab_writeups)
      ? request.lab_writeups[0]
      : request.lab_writeups;

    const writeupTitle = writeup?.title ?? "the writeup";

    // Update request
    const { error: updateError } = await supabase
      .from("writeup_access_requests")
      .update({
        status: "rejected",
        reviewer_user_id: access.user.id,
        reviewer_note: payload.reviewerNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Failed to update request:", updateError);
      return { success: false, error: "Failed to update request status" };
    }

    await supabase.from("writeup_access_logs").insert({
      portfolio_id: access.portfolio.id,
      writeup_id: request.writeup_id,
      request_id: requestId,
      event_type: "request_rejected",
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        reviewer_note: payload.reviewerNote || null,
        rejected_by_role: access.member.role,
      },
    });

    // ── Send rejection email ─────────────────────────────────────────────────
    const emailResult = await sendRejectionEmail({
      requesterEmail: request.requester_email,
      requesterName: request.requester_name,
      writeupTitle,
      reviewerNote: payload.reviewerNote || null,
    });

    const rejectionSubject = "Update on your writeup access request";
    await logEmailNotification({
      portfolioId: access.portfolio.id,
      requestId,
      writeupId: request.writeup_id,
      templateKey: "request_rejected_requester",
      recipientEmail: request.requester_email,
      subject: rejectionSubject,
      status: emailResult.status,
      provider:
        emailResult.status !== "skipped"
          ? ((emailResult as { provider?: string }).provider ?? null)
          : null,
      providerMessageId:
        emailResult.status === "sent"
          ? ((emailResult as { messageId?: string }).messageId ?? null)
          : null,
      errorMessage:
        emailResult.status === "failed"
          ? ((emailResult as { error?: string }).error ?? null)
          : null,
      metadata: {
        writeup_title: writeupTitle,
        template_key: "request_rejected_requester",
        skip_reason:
          emailResult.status === "skipped"
            ? (emailResult as { reason?: string }).reason
            : undefined,
        environment: process.env.NODE_ENV,
      },
    });

    let rejectionEmailWarning: string | undefined;
    if (emailResult.status === "failed") {
      rejectionEmailWarning = `Rejection email failed: ${(emailResult as { error?: string }).error ?? "unknown error"}`;
    } else if (emailResult.status === "skipped") {
      rejectionEmailWarning = `Rejection email skipped: ${(emailResult as { reason?: string }).reason ?? ""}`;
    }

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return {
      success: true,
      data: {
        emailStatus: {
          rejectionEmail: emailResult.status,
          ...(rejectionEmailWarning ? { rejectionEmailWarning } : {}),
        },
      },
    };
  } catch (error) {
    console.error("Failed to reject request:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ── Revoke ────────────────────────────────────────────────────────────────────

export async function revokeAccessGrant(
  portfolioSlug: string,
  grantId: string,
  payload: {
    revokeReason?: string;
  },
): Promise<ActionResult<{ emailStatus: RevokeEmailResult }>> {
  try {
    const access = await requirePortfolioAccess(portfolioSlug);

    if (access.member.role === "viewer") {
      return { success: false, error: "Viewers cannot revoke grants" };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(grantId)) {
      return { success: false, error: "Invalid grant ID" };
    }

    if (payload.revokeReason && payload.revokeReason.length > 1000) {
      return {
        success: false,
        error: "Revoke reason must be 1000 characters or less",
      };
    }

    // Load grant with related writeup info
    const { data: grant, error: grantError } = await supabase
      .from("writeup_access_grants")
      .select(
        `
        id, writeup_id, request_id, revoked_at, requester_email,
        lab_writeups!inner(title)
      `,
      )
      .eq("id", grantId)
      .eq("portfolio_id", access.portfolio.id)
      .maybeSingle();

    if (grantError || !grant) {
      return { success: false, error: "Grant not found" };
    }

    if (grant.revoked_at) {
      return { success: false, error: "Grant is already revoked" };
    }

    const writeup = Array.isArray(grant.lab_writeups)
      ? grant.lab_writeups[0]
      : grant.lab_writeups;

    const writeupTitle = writeup?.title ?? "the writeup";

    // Look up requester name from the linked request
    let requesterName = "Requester";
    if (grant.request_id) {
      const { data: req } = await supabase
        .from("writeup_access_requests")
        .select("requester_name")
        .eq("id", grant.request_id)
        .maybeSingle();
      if (req?.requester_name) requesterName = req.requester_name;
    }

    // Revoke the grant
    const { error: updateError } = await supabase
      .from("writeup_access_grants")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: access.user.id,
        revoke_reason: payload.revokeReason || null,
      })
      .eq("id", grantId);

    if (updateError) {
      console.error("Failed to revoke grant:", updateError);
      return { success: false, error: "Failed to revoke grant" };
    }

    await supabase.from("writeup_access_logs").insert({
      portfolio_id: access.portfolio.id,
      writeup_id: grant.writeup_id,
      grant_id: grantId,
      request_id: grant.request_id,
      event_type: "grant_revoked",
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        revoke_reason: payload.revokeReason || null,
        revoked_by_role: access.member.role,
      },
    });

    // ── Send revocation email ────────────────────────────────────────────────
    const emailResult = await sendGrantRevokedEmail({
      requesterEmail: grant.requester_email,
      requesterName,
      writeupTitle,
    });

    const revocationSubject = "Your writeup access has been revoked";
    await logEmailNotification({
      portfolioId: access.portfolio.id,
      grantId,
      writeupId: grant.writeup_id,
      requestId: grant.request_id,
      templateKey: "grant_revoked_requester",
      recipientEmail: grant.requester_email,
      subject: revocationSubject,
      status: emailResult.status,
      provider:
        emailResult.status !== "skipped"
          ? ((emailResult as { provider?: string }).provider ?? null)
          : null,
      providerMessageId:
        emailResult.status === "sent"
          ? ((emailResult as { messageId?: string }).messageId ?? null)
          : null,
      errorMessage:
        emailResult.status === "failed"
          ? ((emailResult as { error?: string }).error ?? null)
          : null,
      metadata: {
        writeup_title: writeupTitle,
        template_key: "grant_revoked_requester",
        environment: process.env.NODE_ENV,
      },
    });

    let revocationEmailWarning: string | undefined;
    if (emailResult.status === "failed") {
      revocationEmailWarning = `Revocation email failed: ${(emailResult as { error?: string }).error ?? "unknown error"}`;
    }

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return {
      success: true,
      data: {
        emailStatus: {
          revocationEmail: emailResult.status,
          ...(revocationEmailWarning ? { revocationEmailWarning } : {}),
        },
      },
    };
  } catch (error) {
    console.error("Failed to revoke grant:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ── Cancel ────────────────────────────────────────────────────────────────────

export async function cancelAccessRequest(
  portfolioSlug: string,
  requestId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePortfolioAccess(portfolioSlug);

    if (access.member.role === "viewer") {
      return { success: false, error: "Viewers cannot cancel requests" };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: "Invalid request ID" };
    }

    const { data: request, error: requestError } = await supabase
      .from("writeup_access_requests")
      .select("id, status, writeup_id")
      .eq("id", requestId)
      .eq("portfolio_id", access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return {
        success: false,
        error: `Cannot cancel ${request.status} request`,
      };
    }

    const { error: updateError } = await supabase
      .from("writeup_access_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId);

    if (updateError) {
      console.error("Failed to cancel request:", updateError);
      return { success: false, error: "Failed to cancel request" };
    }

    await supabase.from("writeup_access_logs").insert({
      portfolio_id: access.portfolio.id,
      writeup_id: request.writeup_id,
      request_id: requestId,
      event_type: "access_denied",
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        action: "cancelled",
        cancelled_by_role: access.member.role,
      },
    });

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to cancel request:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
