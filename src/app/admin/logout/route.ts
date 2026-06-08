import { redirect } from 'next/navigation';
import { clearAdminSessionCookies, createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tokens = await getAdminSessionTokens();

  if (tokens?.accessToken) {
    const supabase = createAdminSupabaseClient(tokens.accessToken);
    await supabase.auth.signOut();
  }

  await clearAdminSessionCookies();
  redirect('/admin/login');
}
