# Writeup Email Notifications

**Feature:** Email notifications for writeup access request events
**Task:** 30
**Status:** ✅ Complete

## Email Provider

Uses [Resend](https://resend.com). The provider abstraction is in `src/lib/email/provider.ts`.
To swap providers, update that file without changing templates or send functions.

## Required Environment Variables

Add these to `.env.local`:

```env
RESEND_API_KEY=re_xxxx          # Server-only Resend API key
EMAIL_FROM=Violet Portfolio <no-reply@yourdomain.com>
EMAIL_REPLY_TO=violet@yourdomain.com   # Optional -- Violet contact email
WRITEUP_ACCESS_BASE_URL=https://yourapp.com  # Used by Task 31 access page
WRITEUP_SEND_APPROVAL_LINKS=false           # Set true only after Task 31 is deployed
```

**Security:** None of these are `NEXT_PUBLIC_*`. They are server-only.

## Email Templates

| Template Key | File | Recipient | When |
|---|---|---|---|
| `request_received_owner` | `templates/writeup-access.ts` | Violet | Public visitor submits a request |
| `request_confirmation_requester` | `templates/writeup-access.ts` | Requester | After request is submitted |
| `request_approved_requester` | `templates/writeup-access.ts` | Requester | Admin approves request |
| `request_rejected_requester` | `templates/writeup-access.ts` | Requester | Admin rejects request |
| `grant_revoked_requester` | `templates/writeup-access.ts` | Requester | Admin revokes grant |

## When Each Email is Sent

### Owner notification (`request_received_owner`)
Sent from **violets_portfolio** server action immediately after the access request is created in the database. Violet receives a summary of the requester details and reason.

### Requester confirmation (`request_confirmation_requester`)
Sent from **violets_portfolio** server action after the request is created. The requester receives a "we received your request, Violet will review it" message. Does not promise approval.

### Approval (`request_approved_requester`)
Sent from **portfolio** `approveAccessRequest` server action after the grant is created.

**Important:** By default (`WRITEUP_SEND_APPROVAL_LINKS=false`), this email is **skipped**. The admin sees a warning: *"Approval email was not sent because secure access link delivery is disabled until the access page (Task 31) is deployed."* The raw token is still shown in the Control Center for manual delivery.

When `WRITEUP_SEND_APPROVAL_LINKS=true` and `WRITEUP_ACCESS_BASE_URL` is set, the email includes an access link:
```
{WRITEUP_ACCESS_BASE_URL}/writeups/access/{rawToken}
```

### Rejection (`request_rejected_requester`)
Sent from **portfolio** `rejectAccessRequest` server action. The requester is told the request was not approved. An optional reviewer note is included if provided.

### Revocation (`grant_revoked_requester`)
Sent from **portfolio** `revokeAccessGrant` server action. The requester is told their access has been revoked.

## Owner Notification Email Resolution

The owner notification email (where to send request alerts) is resolved in this order:

1. `WRITEUP_OWNER_NOTIFICATION_EMAIL` env var in **violets_portfolio** (fastest, no DB query)
2. Active `contact_links` row with `type = '\''email'\''` for Violet'\''s portfolio (public data)
3. If neither is found, the notification is logged as `skipped` and the request still succeeds

The requester always sees success. The admin can check the `writeup_email_notifications` table to diagnose skipped notifications.

## Raw Token Protection

The raw access token:

- **Generated** in `approveAccessRequest` using `crypto.randomBytes(32)` (256-bit entropy)
- **Hashed** immediately with SHA-256 before any database insert
- **Shown once** in the admin UI after grant creation
- **Used transiently** in `sendApprovalEmail` only to construct the access URL; not passed to any log or persistent store
- **Never stored** in `writeup_email_notifications.metadata` or any other column
- **Never logged** to console, error logs, or email body logs

The `writeup_email_notifications` table stores only: template key, recipient email, subject line, status, provider message ID, and safe metadata (writeup title, environment). No token-containing content is stored.

## Email Logs

Table: `public.writeup_email_notifications`

### Schema (key columns)
| Column | Description |
|---|---|
| `template_key` | Which template was used |
| `recipient_email` | Who the email was sent to |
| `subject` | Email subject line |
| `status` | `sent` \| `failed` \| `skipped` |
| `provider` | `resend` or null (skipped) |
| `provider_message_id` | Resend message ID for tracking |
| `error_message` | Error description if failed |
| `metadata` | Safe context (writeup title, env) -- no tokens |
| `sent_at` | When successfully sent |

### RLS
- Public/anon: no access
- Portfolio members (viewer+): read-only
- Portfolio managers (owner/admin/editor): insert + update (via server actions)

### Public log RPC
`log_writeup_email_notification_public` is a security-definer function callable by `anon`. It is used exclusively by violets_portfolio server actions to log owner notification and confirmation emails. It only accepts `request_received_owner` and `request_confirmation_requester` template keys, and derives `portfolio_id` from the request row to prevent forged inserts.

## Approval Links Disabled Until Task 31

The access page at `{WRITEUP_ACCESS_BASE_URL}/writeups/access/{token}` does not exist yet.

Until Task 31 builds that route, keep `WRITEUP_SEND_APPROVAL_LINKS=false` (the default).

When approval links are disabled:
- `sendApprovalEmail` returns `{ status: "skipped" }`
- The admin sees: *"Approval email was not sent because secure access link delivery is disabled until the access page (Task 31) is deployed. Share the token with the requester manually."*
- The grant is still created; the raw token is still shown once in the UI

After Task 31 is deployed:
1. Set `WRITEUP_SEND_APPROVAL_LINKS=true`
2. Set `WRITEUP_ACCESS_BASE_URL` to the deployed base URL
3. Redeploy

## Development Testing

1. Install dependencies: `npm install`
2. Add `RESEND_API_KEY` to `.env.local` (use a Resend test key)
3. Add `EMAIL_FROM` (must match your verified Resend domain)
4. Add `EMAIL_REPLY_TO` (optional)
5. Set `WRITEUP_OWNER_NOTIFICATION_EMAIL` in violets_portfolio `.env.local`
6. Submit a public request -> check server logs for email result
7. Approve/reject from Control Center -> check email status in the success panel

**Without RESEND_API_KEY:** In development, emails are skipped (not failed) with a console warning. No crashes.

**SQL verification:**
```sql
select
  template_key,
  recipient_email,
  subject,
  status,
  provider,
  provider_message_id,
  error_message,
  metadata,
  created_at,
  sent_at
from public.writeup_email_notifications
order by created_at desc;
```

Confirm: no raw token appears in any column.

## Deferred to Task 31

- The secure access page at `/writeups/access/{token}`
- Signed file download URL generation
- `WRITEUP_SEND_APPROVAL_LINKS=true` as the default
- Token redemption and view counting

## File Map

```
portfolio/src/lib/email/
  provider.ts                   # Resend integration, SendEmailResult type
  send-writeup-email.ts         # sendApprovalEmail, sendRejectionEmail, sendGrantRevokedEmail
  log-email-notification.ts     # logEmailNotification (uses service role)
  templates/
    writeup-access.ts           # buildRequest*Email template functions

portfolio/supabase/migrations/
  013_writeup_email_notifications.sql  # Table + RLS + public log RPC

violets_portfolio/src/lib/email/
  send-request-emails.ts        # sendOwnerNotificationEmail, sendRequestConfirmationEmail
```
