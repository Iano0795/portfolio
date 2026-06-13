create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,

  title text not null,
  issuer text,
  credential_type text,
  category text,
  description text,

  issued_at date,
  expires_at date,
  credential_id text,
  credential_url text,
  image_url text,

  skills jsonb not null default '[]'::jsonb,

  order_index integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credentials_portfolio_id_idx
on public.credentials (portfolio_id);

create index if not exists credentials_portfolio_active_order_idx
on public.credentials (portfolio_id, is_active, order_index);

create index if not exists credentials_portfolio_category_idx
on public.credentials (portfolio_id, category);

drop trigger if exists set_credentials_updated_at on public.credentials;
create trigger set_credentials_updated_at
before update on public.credentials
for each row execute function public.set_updated_at();

alter table public.credentials enable row level security;

drop policy if exists "Public can read active credentials for active portfolios" on public.credentials;
drop policy if exists "Portfolio members can read credentials" on public.credentials;
drop policy if exists "Portfolio managers can insert credentials" on public.credentials;
drop policy if exists "Portfolio managers can update credentials" on public.credentials;
drop policy if exists "Portfolio managers can delete credentials" on public.credentials;

create policy "Public can read active credentials for active portfolios"
on public.credentials for select
to anon, authenticated
using (is_active = true and exists (select 1 from public.portfolios where id = portfolio_id and is_active = true));

create policy "Portfolio members can read credentials"
on public.credentials for select
to authenticated
using (public.can_view_portfolio_admin(portfolio_id));

create policy "Portfolio managers can insert credentials"
on public.credentials for insert
to authenticated
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can update credentials"
on public.credentials for update
to authenticated
using (public.can_manage_portfolio(portfolio_id))
with check (public.can_manage_portfolio(portfolio_id));

create policy "Portfolio managers can delete credentials"
on public.credentials for delete
to authenticated
using (public.can_manage_portfolio(portfolio_id));
