import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { Button, TextField, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Props = {
  open: boolean;
  applicantName: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<boolean>;
};

const schema = Yup.object({
  reason: Yup.string()
    .trim()
    .required('A reason is required')
    .max(512, 'Use 512 characters or fewer'),
});

export function ApplicationEndJourneyDialog({
  open,
  applicantName,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const ended = await onSubmit(values.reason.trim());
      if (ended) onClose();
      else helpers.setStatus('The journey could not be ended. Review the error and try again.');
    },
  });
  const busy = loading || formik.isSubmitting;
  return (
    <CustomDialog
      open={open}
      title="End Admission Journey"
      titleInfo="Record why the applicant is leaving the admission process. Saved information and history remain available."
      handleClose={onClose}
      disableClose={busy}
      guardUnsavedChanges={false}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          End the admission journey for {applicantName}? The application will be marked Withdrawn
          and its history will be kept.
        </Typography>
        <TextField
          name="reason"
          label="Reason"
          required
          fullWidth
          size="small"
          multiline
          minRows={3}
          disabled={busy}
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.reason && formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
        />
        {formik.status && (
          <StudentFeedback
            notificationKey="STU-0193"
            presentation="persistent"
            severity="error"
            sx={{ mt: 2 }}
          >
            {formik.status}
          </StudentFeedback>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={busy}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          color="error"
          startIcon={<Iconify icon="mdi:stop-circle-outline" />}
          loading={busy}
          onClick={() => formik.submitForm()}
        >
          End Journey
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
