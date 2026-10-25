'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Stack, Button, Typography } from '@mui/material';
import { useRef, useState, useEffect, useContext, createContext } from 'react';

import { hrSetupAction } from './hr-setup';

import type { HrSetup } from './hr-failure';

export const RecoveryContext = createContext({ beginSetup: () => {} });

/** Keep the source form mounted. No draft copies, storage, opener access or automatic resubmission. */
export function HrSetupLink({ setup, disabled = false }: { setup: HrSetup; disabled?: boolean }) {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const { beginSetup } = useContext(RecoveryContext);
  const action = hrSetupAction(setup, permissions, Boolean(!loading && permissionsInitialized));
  return action ? (
    <Button
      size="small"
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      disabled={disabled}
      onClick={beginSetup}
      aria-label={`${action.label} (opens in a new tab)`}
    >
      {action.label} (new tab)
    </Button>
  ) : (
    <Typography variant="body2">
      Ask your HR administrator to review this setup; you do not have access to that page.
    </Typography>
  );
}

/** Explicit option refresh: the owning screen must preserve edits and invalidate stale previews. */
export function HrSetupRefresh({
  refresh,
  disabled = false,
}: {
  refresh: () => Promise<unknown>;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <Stack spacing={1}>
      <Button
        size="small"
        disabled={disabled || busy}
        loading={busy}
        onClick={async () => {
          if (pending.current || disabled) return;
          pending.current = true;
          setBusy(true);
          setMessage('');
          try {
            await refresh();
            if (mounted.current)
              setMessage('Setup refreshed. Review the available choices and submit again.');
          } catch {
            if (mounted.current)
              setMessage(
                'Setup could not be refreshed. Your entries are still here. Check your access or connection and retry.'
              );
          } finally {
            pending.current = false;
            if (mounted.current) setBusy(false);
          }
        }}
      >
        Refresh setup
      </Button>
      {message && (
        <Typography role="status" variant="body2">
          {message}
        </Typography>
      )}
    </Stack>
  );
}
