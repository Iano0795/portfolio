/**
 * Email notification logging helper — server-only.
 *
 * Inserts a row into public.writeup_email_notifications using the service role
 * client (bypasses RLS). Logging failures are caught and never crash the
 * main request flow.
 *
 * SECURITY:
 * - Never pass raw tokens to this function.
 * - Never pass full email body content that contains tokens or storage paths.
 * - Metadata should contain only non-sensitive context (template key, title, env).
 */
import "server-only";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type EmailLogStatus = "sent" | "failed" | "skipped";

export type LogEmailNotificationParams = {
  portfolioId: string;
  requestId?: string | null;
  grantId?: string | null;
  writeupId?: string | null;
  templateKey: string;
  recipientEmail: string;
  subject: string;
  status: EmailLogStatus;
  provider?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  /** Safe metadata only — no raw tokens, no storage paths, no email body. */
  metadata?: Record<string, unknown>;
};

/**
 * Log an email notification attempt.
 * Always resolves — never rejects.
 */
export async function logEmailNotification(
  params: LogEmailNotificationParams
): Promise<void> {
  try {
    const supabase = createServiceRoleSupabaseClient();

    const { error } = await supabase.from("writeup_email_notifications").insert({
      portfolio_id: params.portfolioId,
      request_id: params.requestId ?? null,
      grant_id: params.grantId ?? null,
      writeup_id: params.writeupId ?? null,
      template_key: params.templateKey,
      recipient_email: params.recipientEmail,
      subject: params.subject,
      status: params.status,
      provider: params.provider ?? null,
      provider_message_id: params.providerMessageId ?? null,
      error_message: params.errorMessage ?? null,
      metadata: params.metadata ?? {},
      sent_at: params.status === "sent" ? new Date().toISOString() : null,
    });

    if (error) {
      console.error("[Email Log] Insert failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[Email Log] Unexpected error:",
      err instanceof Error ? err.message : err
    );
  }
}
