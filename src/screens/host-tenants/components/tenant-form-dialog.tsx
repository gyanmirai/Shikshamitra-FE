import type { HostTenant } from 'src/redux/host-tenants/types';

import { useRef } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import TenantFields from './tenant-fields';
import { useTenantForm } from '../hooks/use-tenant-form';
import { tenantTouchStyles } from '../services/tenant-accessibility';

export default function TenantFormDialog({
  tenant,
  onClose,
}: {
  tenant?: HostTenant;
  onClose: () => void;
}) {
  const { formik, error, reloadLatest, isLoading } = useTenantForm(tenant, onClose);
  const content = useRef<HTMLDivElement>(null);
  const close = () => {
    if (isLoading) return;
    if (!formik.dirty || window.confirm('Discard your unsaved tenant changes?')) onClose();
  };
  const submit = async () => {
    await formik.submitForm();
    content.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  };
  return (
    <CustomDialog
      open
      title={tenant ? 'Edit tenant' : 'Add tenant'}
      maxWidth="md"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={isLoading}
      paperProps={{ sx: { maxHeight: '90dvh', ...tenantTouchStyles } }}
    >
      <DialogScrollContent>
        <Box ref={content} sx={{ position: 'relative' }} aria-busy={isLoading}>
          <TenantFields formik={formik} creating={!tenant} disabled={isLoading} />
          <Backdrop open={isLoading} sx={{ position: 'absolute', zIndex: 1 }}>
            <CircularProgress aria-label="Saving tenant" />
          </Backdrop>
        </Box>
        {error && (
          <Alert severity="error" role="alert" sx={{ mt: 2 }}>
            {error}
            {tenant && (
              <Button disabled={isLoading} onClick={reloadLatest}>
                Reload latest details
              </Button>
            )}
          </Alert>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" size="small" disabled={isLoading} onClick={close}>
          Cancel
        </Button>
        <LoadingButton variant="contained" size="small" loading={isLoading} onClick={submit}>
          Submit
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
