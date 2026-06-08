'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, ShieldCheck, Terminal } from 'lucide-react';
import { ADMIN_ACCESS_DENIED_MESSAGE } from '@/lib/auth/constants';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type AdminLoginFormProps = {
  initialError?: string;
};

export function AdminLoginForm({ initialError }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [submitting, setSubmitting] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.session || !data.user) {
      setError(loginError?.message || 'Invalid email or password.');
      setSubmitting(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id,user_id,email,role,created_at')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      await fetch('/admin/session', { method: 'DELETE' });
      setError(ADMIN_ACCESS_DENIED_MESSAGE);
      setSubmitting(false);
      return;
    }

    const response = await fetch('/admin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      }),
    });

    if (!response.ok) {
      await supabase.auth.signOut();
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || 'Unable to open the IanOS Control Center.');
      setSubmitting(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050812] px-4 py-8 text-gray-200 selection:bg-[#00ff88]/20 selection:text-[#eafff5]">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-30 animate-scanline"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] animate-grid-move"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00d9ff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <section className="relative z-10 w-full max-w-md border border-[#00ff88]/30 bg-[#090d16]/90 shadow-[0_0_34px_rgba(0,255,136,0.1)]">
        <div className="flex items-center justify-between border-b border-[#00ff88]/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-2" aria-hidden="true">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.45)]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.45)]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.45)]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none text-[#00ff88]">IanOS Control Center</h1>
              <div className="mt-1 font-mono text-[10px] text-gray-500">secure_admin.login</div>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,217,255,0.45)]" aria-hidden="true" />
        </div>

        <form onSubmit={submitLogin} className="space-y-5 p-5">
          <div className="border border-cyan-400/20 bg-black/20 p-3 font-mono text-xs text-gray-400">
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>auth.sequence</span>
            </div>
            <div>Enter IanOS admin credentials to mount the protected CMS shell.</div>
          </div>

          {error && (
            <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="mb-2 flex items-center gap-2 font-mono text-xs text-gray-500">
              <Mail className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-700 bg-black/30 px-4 py-3 font-mono text-sm text-gray-200 placeholder:text-gray-600 transition-all focus:border-cyan-400/50 focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,255,0.1)]"
              placeholder="admin@ianos.local"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 flex items-center gap-2 font-mono text-xs text-gray-500">
              <LockKeyhole className="h-3.5 w-3.5 text-[#00ff88]" aria-hidden="true" />
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-700 bg-black/30 px-4 py-3 font-mono text-sm text-gray-200 placeholder:text-gray-600 transition-all focus:border-[#00ff88]/50 focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,136,0.1)]"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-3 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-wait disabled:opacity-65"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Verifying admin clearance...' : 'Access Control Center'}
          </button>
        </form>
      </section>
    </main>
  );
}
