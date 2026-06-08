import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    redirect('/admin/login');
  }

  return (
    <AdminShell admin={currentAdmin.admin}>
      <AdminDashboard />
    </AdminShell>
  );
}
