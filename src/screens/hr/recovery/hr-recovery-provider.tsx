'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import { HrSetupLink, RecoveryContext } from './hr-setup-controls';
import { hrRecoveryScope, HR_RECOVERY_EVENT, setHrRecoveryVisible } from './hr-recovery-events';

import type { HrRecoveryEvent } from './hr-recovery-events';

export function HrRecoveryProvider({ children }: { children: React.ReactNode }) {
  const auth = useSelector((state: RootState) => state.auth);
  const scope = hrRecoveryScope(auth);
  const pathname = usePathname();
  const params = useSearchParams();
  // Match the request's actual location, including encoded searches. Re-serializing
  // searchParams can turn %20 into + and incorrectly hide an error on this page.
  const route =
    typeof window === 'undefined'
      ? pathname + (params.toString() ? `?${params}` : '')
      : window.location.pathname + window.location.search;
  const [last, setLast] = useState<HrRecoveryEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [setupOpened, setSetupOpened] = useState(false);
  const beginSetup = useCallback(() => setSetupOpened(true), []);
  const context = useMemo(() => ({ beginSetup }), [beginSetup]);
  const close = useCallback(() => {
    setOpen(false);
    setLast(null);
    setHrRecoveryVisible(false);
  }, []);
  useEffect(() => {
    setLast(null);
    setOpen(false);
    setSetupOpened(false);
    setHrRecoveryVisible(false);
  }, [scope, route]);
  useEffect(() => {
    const receive = (event: Event) => {
      const recovery = (event as CustomEvent<HrRecoveryEvent>).detail;
      if (
        recovery.scope !== scope ||
        recovery.route !== window.location.pathname + window.location.search
      )
        return;
      if (recovery.failure) {
        setSetupOpened(false);
        setLast(recovery);
        setOpen(true);
        setHrRecoveryVisible(true);
      } else setLast((current) => (current?.endpoint === recovery.endpoint ? null : current));
    };
    window.addEventListener(HR_RECOVERY_EVENT, receive);
    return () => {
      window.removeEventListener(HR_RECOVERY_EVENT, receive);
      setHrRecoveryVisible(false);
    };
  }, [scope]);
  const failure = last?.scope === scope && last.route === route ? last.failure : undefined;
  useEffect(() => setHrRecoveryVisible(Boolean(failure && open)), [failure, open]);
  return (
    <RecoveryContext.Provider value={context}>
      {children}
      {failure && (
        <CustomDialog
          open={open}
          handleClose={close}
          title={failure.title}
          hasForm={false}
          guardUnsavedChanges={false}
          maxWidth="sm"
          aria-describedby="hr-recovery-description"
        >
          <DialogScrollContent>
            <Stack spacing={2} id="hr-recovery-description">
              <Alert severity="error">{failure.message}</Alert>
              {failure.fields.length > 0 && (
                <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                  {failure.fields.map((field, index) => (
                    <li key={`${field.name}-${index}`}>
                      <Typography variant="body2">
                        <strong>{field.name}:</strong> {field.message}
                      </Typography>
                    </li>
                  ))}
                </Box>
              )}
              <Typography variant="body2">{failure.guidance}</Typography>
              {failure.setup && (
                <>
                  <HrSetupLink setup={failure.setup} />
                  <Typography variant="body2" color="text.secondary">
                    Keep this tab open while you review setup in the new tab. Return here, close
                    this message and refresh setup where offered. No change is submitted
                    automatically.
                  </Typography>
                </>
              )}
              {setupOpened && (
                <Typography role="status" variant="body2">
                  If a new tab did not open, allow this setup link in your browser and try again.
                  Your form remains open here.
                </Typography>
              )}
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <Button autoFocus size="small" variant="outlined" onClick={close}>
              Keep editing
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                close();
                setLast(null);
              }}
            >
              Dismiss error
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </RecoveryContext.Provider>
  );
}
