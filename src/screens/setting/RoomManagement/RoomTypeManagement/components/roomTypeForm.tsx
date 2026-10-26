'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { FormikProvider } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Box, Alert, Button, DialogActions } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { RoomTypeFields } from './room-type-fields';
import { useRoomTypeForm, type RoomTypeFormProps } from './use-room-type-form';

type Props = RoomTypeFormProps & { open: UseBooleanReturn };

export default function RoomTypeForm({ open, onClose, editData }: Props) {
  const { formik, busy } = useRoomTypeForm({ editData, onClose });
  const router = useRouter();
  const { requestNavigation, confirmation } = useUnsavedNavigation(open.value && formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        icon="warning"
        content="Your changes to this form will be lost if you discard them."
        cancelText="Keep editing"
        disableBackdropClick
        disableCancel={busy}
        onClose={keepEditing}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) {
            event.stopPropagation();
            keepEditing();
          }
        }}
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={discard}
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
      onClose(null, false);
    });
  return (
    <>
      <CustomDialog
        open={open.value}
        handleClose={requestClose}
        title={editData ? 'Edit Room Type' : 'Add Room Type'}
        titleInfo="Add or update the room type name and its short name."
        disableClose={busy}
        guardUnsavedChanges={false}
        hasForm={false}
      >
        <FormikProvider value={formik}>
          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
          >
            <DialogScrollContent>
              <FormBusyRegion busy={busy} label="Saving room type...">
                <RoomTypeFields isEditing={Boolean(editData)} />
                {formik.status && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {formik.status}
                  </Alert>
                )}
              </FormBusyRegion>
            </DialogScrollContent>
            <DialogActions>
              <Button
                type="button"
                size="small"
                variant="outlined"
                color="inherit"
                disabled={busy}
                startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
                onClick={requestClose}
              >
                Cancel
              </Button>
              <SubmitButton
                loading={busy}
                disabled={busy}
                startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
              />
            </DialogActions>
          </Box>
        </FormikProvider>
      </CustomDialog>
      {confirmation}
    </>
  );
}
