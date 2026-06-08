import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { ADMIN_ACCESS_DENIED_MESSAGE, getCurrentAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const currentAdmin = await getCurrentAdmin();

  if (currentAdmin) {
    redirect('/admin');
  }

  const params = await searchParams;
  const initialError = params.error === 'access_denied' ? ADMIN_ACCESS_DENIED_MESSAGE : undefined;

  return <AdminLoginForm initialError={initialError} />;
}
