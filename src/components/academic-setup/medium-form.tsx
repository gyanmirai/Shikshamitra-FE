import { Button, TextField, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import { useMediumForm } from './use-medium-form';
import ShakingTextField from '../shaking-text-field';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormSection } from './academic-form-section';
import { useAcademicNamePreview } from './use-academic-name-preview';
import { useAcademicFormClose } from './academic-form-close-context';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { MediumFormProps } from './use-medium-form';

export function MediumForm(props: MediumFormProps) {
  const { editData, handleClose } = props;
  const { formik, confirm, saveMedium, isSaving } = useMediumForm(props);
  const namePreview = useAcademicNamePreview('medium', formik.values.medium, Boolean(editData));
  const requestClose = useAcademicFormClose(formik.dirty, isSaving, handleClose);
  const showError = Boolean(formik.touched.medium && formik.errors.medium);
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={editData ? 'Update Medium' : 'Create Medium'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} medium ${formik.values.medium}?`}
        action={
          <Button
            variant="contained"
            loading={isSaving}
            onClick={saveMedium}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </Button>
        }
      />
      <DialogScrollContent>
        <AcademicFormSection kind="medium">
          <ShakingTextField error={showError}>
            <TextField
              fullWidth
              required
              id="medium"
              name="medium"
              label="Medium name"
              autoFocus
              disabled={isSaving}
              value={formik.values.medium}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={showError}
              helperText={showError ? formik.errors.medium : namePreview}
              size="small"
            />
          </ShakingTextField>
        </AcademicFormSection>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          disabled={isSaving}
          onClick={requestClose}
          startIcon={<AcademicFormActionIcon action="cancel" />}
        >
          Cancel
        </Button>
        <Button
          loading={isSaving}
          variant="contained"
          size="small"
          type="submit"
          startIcon={<AcademicFormActionIcon action="submit" />}
          onClick={() => formik.submitForm()}
        >
          Submit
        </Button>
      </DialogActions>
    </>
  );
}
