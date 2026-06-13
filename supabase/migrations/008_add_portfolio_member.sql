-- Add portfolio member for Ian's account
-- This grants the authenticated user access to the 'ian' portfolio

-- Insert portfolio member record
-- Replace the user_id with your actual Supabase Auth user ID
-- You can find your user ID in Supabase Dashboard > Authentication > Users

insert into public.portfolio_members (portfolio_id, user_id, email, role, is_active)
select 
  p.id as portfolio_id,
  u.id as user_id,
  u.email,
  'owner' as role,
  true as is_active
from public.portfolios p
cross join auth.users u
where p.slug = 'ian'
  and u.email = 'iankipkorir668@gmail.com'
on conflict (portfolio_id, user_id) do update
set 
  role = excluded.role,
  is_active = excluded.is_active,
  email = excluded.email;

-- Optional: Add comments for documentation
comment on table public.portfolio_members is 
'Links users to portfolios with role-based access control. Required for RLS policies to authorize user actions.';

