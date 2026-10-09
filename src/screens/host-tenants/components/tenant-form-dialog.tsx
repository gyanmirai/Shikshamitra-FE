import type { HostTenant } from 'src/redux/host-tenants/types';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
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
  const {
    formik,
    error,
    reloadLatest,
    isLoading,
    canSubmit,
    passwordHelp,
    policyFailed,
    retryPolicy,
  } = useTenantForm(tenant, onClose);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (formik.submitCount > 0 && !isLoading)
      content.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [formik.submitCount, isLoading]);
  const close = () => {
    if (isLoading) return;
    if (!formik.dirty || window.confirm('Discard your unsaved tenant changes?')) onClose();
  };
  return (
    <CustomDialog
      open
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {tenant ? 'Edit tenant' : 'Add tenant'}
          <Tooltip
            title={
              tenant
                ? 'Update the school’s contact details and address. The school code cannot be changed.'
                : 'Add the school’s details, address, and initial administrator account.'
            }
          >
            <IconButton
              size="small"
              color="info"
              aria-label="Tenant form information"
              disabled={isLoading}
            >
              <Iconify icon="mdi:information-outline" width={20} />
            </IconButton>
          </Tooltip>
        </Box>
      }
      maxWidth="md"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={isLoading}
      paperProps={{ sx: { maxHeight: '90dvh', ...tenantTouchStyles } }}
    >
      <DialogScrollContent>
        <Box ref={content} sx={{ position: 'relative' }} aria-busy={isLoading}>
          <TenantFields
            formik={formik}
            creating={!tenant}
            disabled={isLoading}
            passwordHelp={passwordHelp}
          />
          <Backdrop open={isLoading} sx={{ position: 'absolute', zIndex: 1 }}>
            <CircularProgress aria-label="Saving tenant" />
          </Backdrop>
        </Box>
        {policyFailed && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={<Button onClick={() => retryPolicy()}>Retry</Button>}
          >
            Unable to load password requirements. Retry before submitting.
          </Alert>
        )}
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
        <Button
          variant="outlined"
          size="small"
          disabled={isLoading}
          onClick={close}
          startIcon={<Iconify icon="mdi:close" width={18} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          loading={isLoading}
          disabled={!canSubmit}
          onClick={() => formik.submitForm()}
          startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
