import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Button, TextField, DialogActions, FormHelperText } from '@mui/material';

export function ApplicationFormCorrectionReasonDialog({
  open,
  busy,
  retryOnly,
  saveDisabled,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  busy: boolean;
  retryOnly: boolean;
  saveDisabled: boolean;
  error: string;
  onClose: () => void;
  onSave: (reason: string) => Promise<void>;
}) {
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Enter a reason for this correction')
        .max(512, 'Use 512 characters or fewer'),
    }),
    onSubmit: ({ reason }) => onSave(reason),
  });
  return (
    <CustomDialog
      open={open}
      title="Save Form Corrections"
      titleInfo="Approval Is Retained. The Reason and Changed Fields Are Recorded in Admission History; Finalization Checks Run Again."
      handleClose={onClose}
      disableClose={busy}
      guardUnsavedChanges={false}
      maxWidth="sm"
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
        noValidate: true,
      }}
    >
      <DialogScrollContent>
        <FormBusyRegion busy={busy} showOverlay={false}>
          <FormSectionCard
            title="Correction Reason"
            icon={GlobalIcons.edit}
            descriptionTooltip="Explain Why These Application Details Need Correction."
          >
            <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                name="reason"
                label="Reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={busy || retryOnly}
                error={Boolean(formik.touched.reason && formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
                slotProps={{ htmlInput: { maxLength: 512 } }}
              />
            </ShakingTextField>
            {error && (
              <FormHelperText error role="alert">
                {error}
              </FormHelperText>
            )}
          </FormSectionCard>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Back to Form
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          color="inherit"
          loading={busy}
          disabled={saveDisabled}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {retryOnly ? 'Retry Save' : 'Save Corrections'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
