-- ============================================================================
-- Migration: 013_writeup_email_notifications
-- Description: Email notification log for writeup access request events
-- ============================================================================

create table if not exists public.writeup_email_notifications (
  id uuid primary key default gen_random_uuid(),

  portfolio_id uuid references public.portfolios(id) on delete cascade,
  request_id uuid references public.writeup_access_requests(id) on delete set null,
  grant_id uuid references public.writeup_access_grants(id) on delete set null,
  writeup_id uuid references public.lab_writeups(id) on delete set null,

  template_key text not null,
  recipient_email text not null,
  subject text not null,

  status text not null default 'pending',
  provider text,
  provider_message_id text,

  error_message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  sent_at timestamptz,

  constraint writeup_email_notifications_status_check
    check (status in ('pending', 'sent', 'failed', 'skipped')),

  constraint writeup_email_notifications_template_check
    check (
      template_key in (
        'request_received_owner',
        'request_confirmation_requester',
        'request_approved_requester',
        'request_rejected_requester',
        'grant_revoked_requester'
      )
    )
);

create index if not exists writeup_email_notifications_portfolio_idx
on public.writeup_email_notifications (portfolio_id, created_at desc);

create index if not exists writeup_email_notifications_request_idx
on public.writeup_email_notifications (request_id);

create index if not exists writeup_email_notifications_status_idx
on public.writeup_email_notifications (status, created_at desc);

-- Enable RLS
alter table public.writeup_email_notifications enable row level security;

-- Portfolio members (any role) can read email logs for their portfolio
create policy "Portfolio members can read email logs"
on public.writeup_email_notifications for select to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

-- Portfolio managers (owner/admin/editor) can insert email logs
create policy "Portfolio managers can insert email logs"
on public.writeup_email_notifications for insert to authenticated
with check (public.can_manage_portfolio(portfolio_id));

-- Portfolio managers can update email logs (e.g. retry marking)
create policy "Portfolio managers can update email logs"
on public.writeup_email_notifications for update to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

-- ============================================================================
-- FUNCTION: log_writeup_email_notification_public
-- Purpose:  Log email attempts from public-facing server actions (violets_portfolio).
--           Uses security definer so the anon role can insert logs without
--           weakening the table's own RLS policies.
-- Security: Only permits request_received_owner and request_confirmation_requester.
--           Derives portfolio_id / writeup_id from the request row to prevent
--           arbitrary inserts.
-- ============================================================================
create or replace function public.log_writeup_email_notification_public(
  p_request_id           uuid,
  p_template_key         text,
  p_recipient_email      text,
  p_subject              text,
  p_status               text,
  p_provider             text    default null,
  p_provider_message_id  text    default null,
  p_error_message        text    default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_portfolio_id  uuid;
  v_writeup_id    uuid;
  v_log_id        uuid;
begin
  -- Only public-facing templates are permitted via this function
  if p_template_key not in (
    'request_received_owner',
    'request_confirmation_requester'
  ) then
    raise exception 'Template key not permitted via public logging function.';
  end if;

  -- Validate status value
  if p_status not in ('sent', 'failed', 'skipped') then
    raise exception 'Invalid status value.';
  end if;

  -- Derive portfolio_id and writeup_id from the request so the caller
  -- cannot forge a portfolio association.
  select portfolio_id, writeup_id
  into v_portfolio_id, v_writeup_id
  from public.writeup_access_requests
  where id = p_request_id;

  if v_portfolio_id is null then
    raise exception 'Request not found.';
  end if;

  insert into public.writeup_email_notifications (
    portfolio_id,
    request_id,
    writeup_id,
    template_key,
    recipient_email,
    subject,
    status,
    provider,
    provider_message_id,
    error_message,
    metadata,
    sent_at
  ) values (
    v_portfolio_id,
    p_request_id,
    v_writeup_id,
    p_template_key,
    p_recipient_email,
    p_subject,
    p_status,
    p_provider,
    p_provider_message_id,
    p_error_message,
    jsonb_build_object('logged_via', 'public_rpc'),
    case when p_status = 'sent' then now() else null end
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

grant execute on function public.log_writeup_email_notification_public(
  uuid, text, text, text, text, text, text, text
) to anon, authenticated;

comment on function public.log_writeup_email_notification_public is
'Logs email notification attempts from public-facing server actions. '
'Only permits request_received_owner and request_confirmation_requester templates. '
'Derives portfolio context from the request row to prevent forged inserts. '
'Used by violets_portfolio server actions.';
