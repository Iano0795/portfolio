import { NextResponse } from 'next/server';
import { ADMIN_ACCESS_DENIED_MESSAGE, getAdminFromAccessToken } from '@/lib/auth/admin';
import { clearAdminSessionCookies, setAdminSessionCookies } from '@/lib/auth/session';

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

  const currentAdmin = await getAdminFromAccessToken(body.accessToken);

  if (!currentAdmin) {
    await clearAdminSessionCookies();

    return NextResponse.json({ error: ADMIN_ACCESS_DENIED_MESSAGE }, { status: 403 });
  }

  await setAdminSessionCookies({
    access_token: body.accessToken,
    refresh_token: body.refreshToken,
    expires_in: body.expiresIn,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSessionCookies();

  return NextResponse.json({ ok: true });
}
