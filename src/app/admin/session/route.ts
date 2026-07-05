import { NextResponse } from 'next/server';
import { ADMIN_ACCESS_DENIED_MESSAGE } from '@/lib/auth/constants';
import { getUserPortfoliosForAccessToken } from '@/lib/auth/portfolio-access';
import {
  clearAdminSessionCookies,
  createAdminSupabaseClient,
  setAdminSessionCookies,
} from '@/lib/auth/admin-session';

export const dynamic = 'force-dynamic';

type AdminSessionRequestBody = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AdminSessionRequestBody;

  if (!body.accessToken || !body.refreshToken) {
    await clearAdminSessionCookies();

    return NextResponse.json({ error: 'Missing Supabase session tokens.' }, { status: 400 });
  }

  const supabase = await createAdminSupabaseClient(body.accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser(body.accessToken);

  if (authError || !authData.user) {
    await clearAdminSessionCookies();
    console.warn('[admin/session] rejected invalid Supabase session', {
      error: authError?.message ?? 'missing user',
    });

    return NextResponse.json({ error: 'Invalid or expired Supabase session.' }, { status: 401 });
  }

  const portfolios = await getUserPortfoliosForAccessToken(body.accessToken).catch((error) => {
    console.warn('[admin/session] portfolio access lookup failed', {
      userId: authData.user.id,
      email: authData.user.email,
      error: error instanceof Error ? error.message : String(error),
    });

    return [];
  });

  if (portfolios.length === 0) {
    await clearAdminSessionCookies();
    console.warn('[admin/session] access denied: no active portfolio membership', {
      userId: authData.user.id,
      email: authData.user.email,
    });

    return NextResponse.json({ error: ADMIN_ACCESS_DENIED_MESSAGE }, { status: 403 });
  }

  await setAdminSessionCookies({
    access_token: body.accessToken,
    refresh_token: body.refreshToken,
    expires_in: body.expiresIn,
  });

  const redirectTo =
    portfolios.length === 1
      ? `/admin/portfolio/${portfolios[0].portfolio.slug}`
      : '/admin/select-portfolio';

  return NextResponse.json({ ok: true, redirectTo });
}

export async function DELETE() {
  await clearAdminSessionCookies();

  return NextResponse.json({ ok: true });
}
