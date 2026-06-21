/**
 * Email provider abstraction — server-only.
 *
 * Currently backed by Resend. Swap the implementation here to change providers
 * without touching the rest of the codebase.
 *
 * SECURITY:
 * - Never import this file in Client Components.
 * - The RESEND_API_KEY must never be exposed to the browser.
 */
import "server-only";
import { Resend } from "resend";

export type SendEmailOptions = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { status: "sent"; provider: string; messageId: string }
  | { status: "failed"; provider: string; error: string }
  | { status: "skipped"; reason: string };

/**
 * Send a transactional email via the configured provider.
 * Always returns a structured result — never throws.
 *
 * - If RESEND_API_KEY is missing in non-production, returns `skipped` with a
 *   console warning so local development keeps working without credentials.
 * - In production, missing credentials returns `failed`.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Email] RESEND_API_KEY not configured — skipping: "${options.subject}" → ${options.to}`
      );
      return { status: "skipped", reason: "RESEND_API_KEY not configured" };
    }
    console.error("[Email] RESEND_API_KEY is missing in production");
    return {
      status: "failed",
      provider: "resend",
      error: "Email provider not configured",
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: options.from,
      to: [options.to],
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return {
        status: "failed",
        provider: "resend",
        error: (error as { message?: string }).message ?? "Send failed",
      };
    }

    return {
      status: "sent",
      provider: "resend",
      messageId: data?.id ?? "unknown",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Unexpected error:", message);
    return { status: "failed", provider: "resend", error: message };
  }
}
