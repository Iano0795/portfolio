'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SessionExpiredModal } from './SessionExpiredModal';

type SessionExpiredContextValue = {
  /** Call this when a server action reports an expired session (e.g. its error is "Session expired. Sign in again."). */
  notifySessionExpired: () => void;
};

const SessionExpiredContext = createContext<SessionExpiredContextValue | null>(null);

export function useSessionExpired() {
  const context = useContext(SessionExpiredContext);

  if (!context) {
    throw new Error('useSessionExpired must be used within a SessionExpiredProvider');
  }

  return context;
}

type SessionExpiredProviderProps = {
  children: ReactNode;
  /** Epoch ms when the current admin session's access token expires, or null when not signed in. */
  expiresAt: number | null;
};

export function SessionExpiredProvider({ children, expiresAt }: SessionExpiredProviderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifySessionExpired = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const scheduleCheck = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const msRemaining = expiresAt - Date.now();

      if (msRemaining <= 0) {
        setOpen(true);
        return;
      }

      // Background tabs throttle timers, so this can fire late — the visibilitychange
      // listener below re-checks the real clock as soon as the tab is foregrounded again.
      timeoutRef.current = setTimeout(() => setOpen(true), msRemaining);
    };

    scheduleCheck();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt]);

  const handleRedirect = useCallback(() => {
    setOpen(false);
    router.push('/admin/login?error=session_expired');
  }, [router]);

  return (
    <SessionExpiredContext.Provider value={{ notifySessionExpired }}>
      {children}
      <SessionExpiredModal open={open} onRedirect={handleRedirect} />
    </SessionExpiredContext.Provider>
  );
}
