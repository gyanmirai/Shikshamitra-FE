import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { ChangePasswordForm } from './change-password-form';
import { useChangePasswordForm } from './hooks/use-change-password-form';

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const form = useChangePasswordForm(onClose);
  const { formik, busy } = form;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        content="The passwords you entered have not been saved. Discard them and close this dialog?"
        icon="warning"
        cancelText="Keep editing"
        onClose={keepEditing}
        action={
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={discard}
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  const requestClose = () =>
    requestNavigation(() => {
      formik.resetForm();
      onClose();
    });

  return (
    <>
      <CustomDialog
        open
        title="Change Password"
        titleInfo="Change the password for your signed-in account. Your current password is required."
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        paperProps={{
          sx: {
            '& .MuiOutlinedInput-root:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
              {
                borderColor: 'text.secondary',
              },
            '& button[aria-label$="information"]': {
              color: 'info.dark',
              ...theme.applyStyles('dark', { color: theme.vars.palette.info.light }),
            },
            '& .MuiInputLabel-root.Mui-error, & .MuiFormHelperText-root.Mui-error': {
              color: 'error.dark',
              ...theme.applyStyles('dark', { color: theme.vars.palette.error.light }),
            },
            '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: 'error.dark',
              ...theme.applyStyles('dark', { borderColor: theme.vars.palette.error.light }),
            },
          },
        }}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            if (!busy) formik.submitForm();
          },
        }}
      >
        <ChangePasswordForm {...form} onClose={requestClose} />
      </CustomDialog>
      {confirmation}
    </>
  );
}
