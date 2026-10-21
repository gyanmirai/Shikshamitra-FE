import { capitalizeFirstLetter } from 'src/utils/input-format';
import { Stack, Button, TextField, DialogActions } from '@mui/material';

import { useStageForm } from './use-stage-form';
import { ConfirmDialog } from '../confirm-dialog';
import ShakingTextField from '../shaking-text-field';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormSection } from './academic-form-section';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { StageFormProps } from './use-stage-form';

export function OrganizationForm(props: StageFormProps) {
  const { editData, handleClose } = props;
  const { formik, confirm, saveStage, isSaving } = useStageForm(props);
  const showError = Boolean(formik.touched.organization && formik.errors.organization);
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={editData ? 'Update Stage' : 'Create Stage'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} stage ${formik.values.organization}?`}
        action={
          <Button
            variant="contained"
            loading={isSaving}
            onClick={saveStage}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </Button>
        }
      />
      <DialogScrollContent>
        <AcademicFormSection kind="stage">
          <Stack spacing={2}>
            <ShakingTextField error={showError}>
              <TextField
                fullWidth
                required
                id="organization"
                name="organization"
                label="Stage name"
                autoFocus
                disabled={isSaving}
                value={formik.values.organization}
                onChange={(event) =>
                  formik.setFieldValue('organization', capitalizeFirstLetter(event.target.value))
                }
                onBlur={formik.handleBlur}
                error={showError}
                helperText={showError ? formik.errors.organization : undefined}
                size="small"
              />
            </ShakingTextField>
          </Stack>
        </AcademicFormSection>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          disabled={isSaving}
          onClick={handleClose}
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
