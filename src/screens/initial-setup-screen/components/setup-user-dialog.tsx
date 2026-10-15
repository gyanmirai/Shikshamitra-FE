import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Alert, Button, MenuItem, TextField, AlertTitle, DialogActions } from '@mui/material';

import { useSetupUserForm } from '../hooks/use-setup-user-form';
import SetupUserFields, { setupUserErrorTextSx } from './setup-user-fields';

export default function SetupUserDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: Record<string, unknown>) => Promise<void>;
}) {
  const { form, error, policy, passwordHelp, serverErrors, clearServerError, submit } =
    useSetupUserForm(onCreate, onClose);
  const canReadRoles = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'AbpIdentity.Roles' && permission.isGranted
    )
  );
  const roles = useGetRolesQuery(undefined, { skip: !canReadRoles });
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (form.submitCount && !form.isSubmitting)
      (
        content.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ||
        content.current?.querySelector<HTMLElement>('[role="alert"]')
      )?.focus();
  }, [form.submitCount, form.isSubmitting]);
  const close = () => {
    if (!form.isSubmitting && (!form.dirty || window.confirm('Discard the unsaved user form?')))
      onClose();
  };
  return (
    <CustomDialog
      open
      title="Add user"
      handleClose={close}
      maxWidth="sm"
      fullWidth
      disableClose={form.isSubmitting}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <div ref={content}>
          {error && (
            <Alert severity="error" tabIndex={-1} sx={{ mb: 2 }}>
              <AlertTitle>{error.title}</AlertTitle>
              {error.message}
            </Alert>
          )}
          {policy.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => policy.refetch()}>Retry</Button>}
              sx={{ mb: 2 }}
            >
              Unable to load password requirements.
            </Alert>
          )}
          <FormSectionCard
            title="User details and access"
            icon="mdi:account-outline"
            descriptionTooltip="Credentials stay only in this form until submission. Share the initial password securely."
          >
            <Grid container spacing={2}>
              <SetupUserFields
                form={form}
                serverErrors={serverErrors}
                clearServerError={clearServerError}
                passwordHelp={passwordHelp}
              />
              {canReadRoles && (
                <Grid size={12}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Roles"
                    value={form.values.roleNames}
                    error={Boolean(serverErrors.roleNames)}
                    disabled={form.isSubmitting || roles.isLoading || roles.isError}
                    slotProps={{
                      select: { multiple: true },
                      inputLabel: { sx: setupUserErrorTextSx },
                      formHelperText: { sx: setupUserErrorTextSx },
                    }}
                    onChange={(event) => {
                      clearServerError('roleNames');
                      form.setFieldValue(
                        'roleNames',
                        typeof event.target.value === 'string'
                          ? event.target.value.split(',')
                          : event.target.value
                      );
                    }}
                    helperText={
                      serverErrors.roleNames ||
                      (roles.isError
                        ? 'Unable to load roles. Retry to assign access.'
                        : 'Optional. Choose the roles this staff member needs.')
                    }
                  >
                    {(roles.data?.items ?? []).map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {roles.isError && <Button onClick={() => roles.refetch()}>Retry roles</Button>}
                </Grid>
              )}
            </Grid>
          </FormSectionCard>
        </div>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button onClick={close} disabled={form.isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="inherit"
          loading={form.isSubmitting}
          disabled={form.isSubmitting || !policy.data || policy.isFetching || policy.isError}
          onClick={submit}
        >
          {form.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
