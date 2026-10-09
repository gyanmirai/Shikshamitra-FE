import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Alert, Button, MenuItem, TextField, DialogActions } from '@mui/material';

import { useSetupUserForm } from '../hooks/use-setup-user-form';

export default function SetupUserDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: Record<string, unknown>) => Promise<void>;
}) {
  const { form, error, policy, passwordHelp } = useSetupUserForm(onCreate, onClose);
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
      content.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
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
              {(['userName', 'email', 'password'] as const).map((name) => (
                <Grid key={name} size={12}>
                  <TextField
                    name={name}
                    label={
                      name === 'userName'
                        ? 'User name'
                        : name === 'email'
                          ? 'Email'
                          : 'Initial password'
                    }
                    fullWidth
                    size="small"
                    required
                    type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
                    autoComplete={name === 'password' ? 'new-password' : 'off'}
                    value={form.values[name]}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    disabled={form.isSubmitting}
                    error={Boolean(form.touched[name] && form.errors[name])}
                    helperText={
                      (form.touched[name] && form.errors[name]) ||
                      (name === 'password' ? passwordHelp : undefined)
                    }
                  />
                </Grid>
              ))}
              {canReadRoles && (
                <Grid size={12}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Roles"
                    value={form.values.roleNames}
                    disabled={form.isSubmitting || roles.isLoading || roles.isError}
                    slotProps={{ select: { multiple: true } }}
                    onChange={(event) =>
                      form.setFieldValue(
                        'roleNames',
                        typeof event.target.value === 'string'
                          ? event.target.value.split(',')
                          : event.target.value
                      )
                    }
                    helperText={
                      roles.isError
                        ? 'Unable to load roles. Retry to assign access.'
                        : 'Optional. Choose the roles this staff member needs.'
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
          disabled={!policy.data || policy.isFetching}
          onClick={() => form.submitForm()}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
