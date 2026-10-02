'use client';

import type { AlertProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Alert, Stack, IconButton } from '@mui/material';
import { useLocalStorage } from 'src/hooks/use-local-storage';

type Props = Omit<AlertProps, 'severity' | 'onClose'> & {
  severity: 'info' | 'warning';
  closeDisabled?: boolean;
  dismissalKey?: string;
};

export function AdmissionIntakeNotice({ dismissalKey, ...props }: Props) {
  return dismissalKey ? (
    <PersistentAdmissionIntakeNotice key={dismissalKey} dismissalKey={dismissalKey} {...props} />
  ) : (
    <DismissibleAdmissionIntakeNotice {...props} />
  );
}

function PersistentAdmissionIntakeNotice({
  dismissalKey,
  ...props
}: Props & { dismissalKey: string }) {
  const { state: dismissed, setState } = useLocalStorage(dismissalKey, false);

  return (
    <DismissibleAdmissionIntakeNotice
      {...props}
      dismissed={dismissed}
      onDismiss={() => setState(true)}
    />
  );
}

function DismissibleAdmissionIntakeNotice({
  severity,
  action,
  closeDisabled = false,
  dismissed = false,
  onDismiss,
  ...props
}: Omit<Props, 'dismissalKey'> & { dismissed?: boolean; onDismiss?: () => void }) {
  const visible = useBoolean(true);

  // Dismissing a message must not remove its required recovery action.
  if (dismissed || !visible.value) {
    return action ? (
      <Stack direction="row" justifyContent="flex-end" sx={props.sx}>
        {action}
      </Stack>
    ) : null;
  }

  return (
    <Alert
      {...props}
      severity={severity}
      action={
        <Stack direction="row" spacing={0.5} alignItems="center">
          {action}
          <IconButton
            size="small"
            color="inherit"
            aria-label={`Dismiss ${severity === 'info' ? 'information' : 'warning'} message`}
            disabled={closeDisabled}
            onClick={() => {
              visible.onFalse();
              onDismiss?.();
            }}
          >
            <Iconify icon="mdi:close" width={18} />
          </IconButton>
        </Stack>
      }
    />
  );
}
