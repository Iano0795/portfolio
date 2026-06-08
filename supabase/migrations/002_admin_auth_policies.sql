drop policy if exists "Authenticated users can read own admin row" on public.admins;

create policy "Authenticated users can read own admin row"
on public.admins for select
to authenticated
using (auth.uid() = user_id);
