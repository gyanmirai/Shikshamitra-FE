import * as Yup from 'yup';
import { useFormik } from 'formik';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

export function FormStageReasonDialog({
  title,
  description,
  confirmLabel,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required('Enter a clear reason.').max(512),
    }),
    onSubmit: async ({ reason }) => onSubmit(reason.trim()),
  });
  return (
    <CustomDialog
      open
      title={title}
      handleClose={onClose}
      disableClose={busy}
      guardUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <StudentFeedback notificationKey="STU-0385" presentation="persistent" severity="warning">
            {description}
          </StudentFeedback>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Reason *"
            {...formik.getFieldProps('reason')}
            disabled={busy}
            error={Boolean(formik.touched.reason && formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={busy}
          onClick={() => formik.handleSubmit()}
        >
          {busy ? 'Saving…' : confirmLabel}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
