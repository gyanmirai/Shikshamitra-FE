import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import SubmitButton from 'src/components/submit-button';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

import { useShiftForm } from './use-shift-form';
import { ShiftFormFields } from './ShiftFormFields';

import type { ShiftRecord } from './use-shift-form';

export function ShiftFormDialog({
  onClose,
  editData,
}: {
  onClose: () => void;
  editData: ShiftRecord | null;
}) {
  const { formik, busy } = useShiftForm(onClose, editData);
  const discardTitle = 'Discard Unsaved Changes?';
  const navigation = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    title: discardTitle,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { title: discardTitle, busy }),
  });
  const requestClose = () => {
    if (busy) return;
    navigation.requestNavigation(() => {
      formik.resetForm();
      onClose();
    });
  };
  return (
    <>
      <CustomDialog
        open
        title={editData ? 'Edit Shift' : 'Add Shift'}
        titleInfo="Set the shift name and its start and end times for the school's daily schedule."
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={{
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            formik.submitForm();
          },
          noValidate: true,
        }}
        maxWidth="sm"
        paperProps={{ sx: { maxWidth: 540 } }}
      >
        <DialogScrollContent>
          <FormSectionCard
            title="Shift Details"
            icon={GlobalIcons.clock}
            descriptionTooltip="Enter a name and the start and end times for this shift."
          >
            <ShiftFormFields formik={formik} busy={busy} isEditing={Boolean(editData)} />
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            disabled={busy}
            onClick={requestClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <SubmitButton loading={busy} disabled={busy} />
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
    </>
  );
}
