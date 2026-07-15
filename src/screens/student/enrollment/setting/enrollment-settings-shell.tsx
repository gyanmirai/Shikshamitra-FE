'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { isPlainPrimaryNavigationClick } from 'src/components/nav-section/path-utils';
import {
  Box,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  enrollmentSettingsDirtyEvent,
  enrollmentSettingsDiscardEvent,
  updateEnrollmentSettingsDirtySources,
} from './enrollment-settings-dirty-state';

import type { EnrollmentSettingsDirtyEventDetail } from './enrollment-settings-dirty-state';

export function EnrollmentSettingsShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirtySources = useRef(new Set<string>());

  useEffect(() => {
    const handleDirtyState = (event: Event) => {
      const { detail } = event as CustomEvent<EnrollmentSettingsDirtyEventDetail>;
      if (!detail?.source) return;
      setIsDirty(updateEnrollmentSettingsDirtySources(dirtySources.current, detail));
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener(enrollmentSettingsDirtyEvent, handleDirtyState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener(enrollmentSettingsDirtyEvent, handleDirtyState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      if (!isDirty || event.defaultPrevented || !isPlainPrimaryNavigationClick(event)) {
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
    dirtySources.current.clear();
    setIsDirty(false);
    window.dispatchEvent(new CustomEvent(enrollmentSettingsDiscardEvent));
    router.push(pendingHref);
    setPendingHref(null);
  };

  return (
    <>
      <Box
        sx={{
          '& .MuiChip-colorPrimary': {
            bgcolor: 'transparent',
            color: 'text.primary',
            border: 1,
            borderColor: 'primary.main',
          },
          '& .MuiChip-colorSuccess': {
            bgcolor: 'transparent',
            color: 'text.primary',
            border: 1,
            borderColor: 'success.main',
          },
          '& .MuiChip-colorWarning': {
            bgcolor: 'transparent',
            color: 'text.primary',
            border: 1,
            borderColor: 'warning.main',
          },
          '& .MuiChip-colorError': {
            bgcolor: 'transparent',
            color: 'text.primary',
            border: 1,
            borderColor: 'error.main',
          },
          '& .MuiChip-colorInfo': {
            bgcolor: 'transparent',
            color: 'text.primary',
            border: 1,
            borderColor: 'info.main',
          },
        }}
      >
        {children}
      </Box>
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
