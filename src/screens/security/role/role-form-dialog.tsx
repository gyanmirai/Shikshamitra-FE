import { useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Alert, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useRoleForm } from './use-role-form';
import RoleFormFields from './role-form-fields';

import type { RoleRecord } from './role-form-values';

export default function RoleFormDialog({
  role,
  onClose,
}: {
  role: RoleRecord | null;
  onClose: () => void;
}) {
  const { formik, error, busy } = useRoleForm(role, onClose);
  const router = useRouter();
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title={<span id={`${id}-discard-title`}>Discard Unsaved Changes?</span>}
        aria-labelledby={`${id}-discard-title`}
        aria-describedby={`${id}-discard-description`}
        icon="warning"
        content={
          <span id={`${id}-discard-description`}>Your role changes have not been saved.</span>
        }
        cancelText="Keep Editing"
        onClose={keepEditing}
        disableBackdropClick
        action={
          <Button
            type="button"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={discard}
          >
            Discard Changes
          </Button>
        }
      />
    ),
  });
  const requestClose = () => requestNavigation(onClose);

  return (
    <>
      <CustomDialog
        open
        title={role ? 'Edit Role' : 'Add Role'}
        titleInfo="Define a role and its availability for employee assignment."
        handleClose={requestClose}
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
      >
        <Box
          component="form"
          ref={formRef}
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            await formik.submitForm();
            requestAnimationFrame(() => {
              formRef.current
                ?.querySelector<HTMLElement>(
                  '[aria-invalid="true"], [data-color-invalid="true"] button'
                )
                ?.focus();
            });
          }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} label="Saving role…">
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <RoleFormFields formik={formik} busy={busy} />
              </Stack>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions>
            <Button
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={requestClose}
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
      {confirmation}
    </>
  );
}
