'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ShieldAlert, X } from 'lucide-react';
import { DialogPortal } from '@/components/ui/dialog';

type SessionExpiredModalProps = {
  open: boolean;
  onRedirect: () => void;
};

export function SessionExpiredModal({ open, onRedirect }: SessionExpiredModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border border-[#ff5f56]/40 bg-[#090d16] p-6 font-mono shadow-[0_0_40px_rgba(255,95,86,0.15)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <button
            type="button"
            onClick={onRedirect}
            aria-label="Close and log in again"
            className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-gray-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 flex-shrink-0 text-[#ff5f56]" aria-hidden="true" />
            <DialogPrimitive.Title className="text-sm font-semibold text-white">Session Expired</DialogPrimitive.Title>
          </div>

          <DialogPrimitive.Description className="mb-6 text-xs leading-relaxed text-gray-400">
            Your admin session has timed out for security. Any unsaved changes on this page were not saved. Log in again to
            continue.
          </DialogPrimitive.Description>

          <button
            type="button"
            onClick={onRedirect}
            className="inline-flex w-full items-center justify-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18"
          >
            Log In Again
          </button>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
