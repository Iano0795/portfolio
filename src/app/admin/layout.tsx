import type { Metadata } from 'next';
import { getAdminSessionExpiresAt } from '@/lib/auth/admin-session';
import { SessionExpiredProvider } from '@/components/admin/session/SessionExpiredProvider';

export const metadata: Metadata = {
  title: 'IanOS Control Center',
  description: 'Protected IanOS CMS control center',
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const expiresAt = await getAdminSessionExpiresAt();

  return <SessionExpiredProvider expiresAt={expiresAt}>{children}</SessionExpiredProvider>;
}
