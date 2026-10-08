import type { HostTenant } from 'src/redux/host-tenants/types';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  useLazyGetHostTenantQuery,
  useChangeHostTenantStatusMutation,
} from 'src/redux/host-tenants/host-tenant-api';

import { tenantError } from '../services/tenant-form';
import { tenantTouchStyles } from '../services/tenant-accessibility';

export default function TenantStatusDialog({
  tenant,
  onClose,
}: {
  tenant: HostTenant;
  onClose: () => void;
}) {
  const [latest, setLatest] = useState(tenant);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [change, { isLoading }] = useChangeHostTenantStatusMutation();
  const [reload, reloadState] = useLazyGetHostTenantQuery();
  const busy = isLoading || reloadState.isFetching;
  const action = latest.isActive ? 'Deactivate' : 'Activate';
  const submit = async () => {
    if (latest.isActive && !reason.trim()) {
      setError('Enter a reason for deactivation.');
      return;
    }
    try {
      await change({
        id: latest.id,
        isActive: !latest.isActive,
        reason: reason.trim(),
        concurrencyStamp: latest.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Tenant ${latest.isActive ? 'deactivated' : 'activated'}`,
      });
      onClose();
    } catch (failure) {
      setError(tenantError(failure));
    }
  };
  const reloadLatest = async () => {
    try {
      setLatest(await reload(latest.id).unwrap());
      setError('');
    } catch (failure) {
      setError(tenantError(failure));
    }
  };
  return (
    <ConfirmDialog
      open
      sx={tenantTouchStyles}
      title={`${action} ${latest.instituteName || latest.name}?`}
      icon={latest.isActive ? 'warning' : 'info'}
      onClose={() => {
        if (!busy) onClose();
      }}
      disableCancel={busy}
      disableBackdropClick
      disableEscapeKeyDown={busy}
      content={
        <Stack gap={2} aria-busy={busy}>
          <Typography variant="body2">
            {latest.isActive
              ? 'School users will lose access on their next request. School records will be preserved.'
              : 'School users will be able to log in and use the app again.'}
          </Typography>
          {latest.isActive && (
            <TextField
              autoFocus
              required
              multiline
              minRows={2}
              fullWidth
              size="small"
              label="Reason"
              value={reason}
              disabled={busy}
              onChange={(event) => setReason(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1024 } }}
            />
          )}
          {error && (
            <Alert severity="error" role="alert">
              {error}
              <Button disabled={busy} onClick={reloadLatest}>
                Reload latest status
              </Button>
            </Alert>
          )}
        </Stack>
      }
      action={
        <LoadingButton
          loading={busy}
          variant="contained"
          color={latest.isActive ? 'warning' : 'inherit'}
          onClick={submit}
        >
          {action}
        </LoadingButton>
      }
    />
  );
}
