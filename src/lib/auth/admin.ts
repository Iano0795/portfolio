import type { User } from '@supabase/supabase-js';
import { ADMIN_ACCESS_DENIED_MESSAGE } from '@/lib/auth/constants';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/session';

export { ADMIN_ACCESS_DENIED_MESSAGE };

export type AdminRecord = {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  created_at: string | null;
};

export type CurrentAdmin = {
  user: User;
  admin: AdminRecord;
};

async function getAdminForUser(accessToken: string, user: User): Promise<AdminRecord | null> {
  const supabase = createAdminSupabaseClient(accessToken);

  const { data: portfolioMember, error: portfolioMemberError } = await supabase
    .from('portfolio_members')
    .select('id,user_id,email,role,created_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle<AdminRecord>();

  if (!portfolioMemberError && portfolioMember) {
    return portfolioMember;
  }

  if (!portfolioMemberError) {
    return null;
  }

  const { data, error } = await supabase
    .from('admins')
    .select('id,user_id,email,role,created_at')
    .eq('user_id', user.id)
    .maybeSingle<AdminRecord>();

  if (error) {
    return null;
  }

  return data;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return null;
  }

  return getAdminFromAccessToken(tokens.accessToken);
}

export async function getAdminFromAccessToken(accessToken: string): Promise<CurrentAdmin | null> {
  const supabase = createAdminSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  const admin = await getAdminForUser(accessToken, data.user);

  if (!admin) {
    return null;
  }

  return {
    user: data.user,
    admin,
  };
}
