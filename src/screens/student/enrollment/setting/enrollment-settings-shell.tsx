'use client';

import type { ReactNode } from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

export function EnrollmentSettingsShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    const handleDirtyState = (event: Event) => {
      setIsDirty(Boolean((event as CustomEvent<{ dirty?: boolean }>).detail?.dirty));
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('admissions-settings-dirty', handleDirtyState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('admissions-settings-dirty', handleDirtyState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      if (
        !isDirty ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const { target } = event;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const href = `${destination.pathname}${destination.search}${destination.hash}`;
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (href === currentHref) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };

    document.addEventListener('click', handleNavigation, true);
    return () => document.removeEventListener('click', handleNavigation, true);
  }, [isDirty]);

  const discardAndContinue = () => {
    if (!pendingHref) return;
    setIsDirty(false);
    window.dispatchEvent(new CustomEvent('admissions-settings-discard'));
    router.push(pendingHref);
    setPendingHref(null);
  };

  return (
    <>
      {children}
      <Dialog
        open={Boolean(pendingHref)}
        onClose={() => setPendingHref(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Discard Unsaved Changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Changes in this settings category have not been saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingHref(null)}>Stay Here</Button>
          <Button color="error" variant="contained" onClick={discardAndContinue}>
            Discard & Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
