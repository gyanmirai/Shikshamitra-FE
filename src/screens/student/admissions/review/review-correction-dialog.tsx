import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useRequestAdmissionReviewCorrectionMutation } from 'src/redux/student/admissions/admission-review-api';

import { ReviewDialog } from './review-dialog';
import { useReviewRecovery } from './use-review-recovery';
import { ReviewRecoveryAlert } from './review-recovery-alert';

export function ReviewCorrectionDialog({
  summary: initial,
  onClose,
  onReload,
}: {
  summary: ReviewSummary;
  onClose: () => void;
  onReload: () => Promise<ReviewSummary>;
}) {
  const recovery = useReviewRecovery(initial, onReload);
  const { summary } = recovery;
  const [request] = useRequestAdmissionReviewCorrectionMutation();
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Explain what needs correcting.')
        .max(1024, 'Use 1,024 characters or fewer.'),
    }),
    onSubmit: async ({ reason }) => {
      recovery.setError('');
      try {
        await request({
          applicationId: summary.applicationId,
          stageId: summary.stageId,
          concurrencyStamp: summary.concurrencyStamp,
          reason: reason.trim(),
        }).unwrap();
        shikshaMitraToast.success({ message: 'Application reopened for corrections' });
        onClose();
      } catch (failure) {
        recovery.fail(failure);
      }
    },
  });
  const busy = formik.isSubmitting || recovery.reloading;
  return (
    <ReviewDialog
      title="Request application corrections"
      dirty={formik.dirty}
      busy={busy}
      onClose={onClose}
      actions={(cancel) => (
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button variant="outlined" onClick={cancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            disabled={busy || !summary.canRequestCorrection}
          >
            {formik.isSubmitting ? 'Saving…' : 'Request corrections'}
          </Button>
        </DialogActions>
      )}
    >
      <DialogScrollContent onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <ReviewRecoveryAlert
            error={recovery.error}
            dirty={formik.dirty}
            busy={busy}
            onReload={() => recovery.reload(() => formik.resetForm())}
          />
          {!summary.canRequestCorrection && (
            <StudentFeedback notificationKey="STU-0459" presentation="persistent" severity="info">
              Corrections cannot be requested in the latest review. {summary.blockers.join(' ')}
            </StudentFeedback>
          )}
          <StudentFeedback notificationKey="STU-0460" presentation="inline" severity="warning">
            This decision reopens the application form. Correct and resubmit it, then submit a new
            review recommendation.
          </StudentFeedback>
          <Typography variant="body2">
            Describe the exact application details that need to change. Previously completed
            assessment and document stages stay in their recorded state.
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Correction instructions *"
            {...formik.getFieldProps('reason')}
            disabled={busy}
            error={Boolean(formik.touched.reason && formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
        </Stack>
      </DialogScrollContent>
    </ReviewDialog>
  );
}
