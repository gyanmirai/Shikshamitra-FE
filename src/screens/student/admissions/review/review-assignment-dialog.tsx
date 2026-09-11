import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { ReviewDialog } from './review-dialog';
import { ReviewRecoveryAlert } from './review-recovery-alert';
import { useReviewAssignment } from './use-review-assignment';
import { ReviewAssigneeSelect } from '../workflow-builder/components/review-assignee-select';

export function ReviewAssignmentDialog({
  summary: initial,
  onClose,
  onReload,
}: {
  summary: ReviewSummary;
  onClose: () => void;
  onReload: () => Promise<ReviewSummary>;
}) {
  const { formik, recovery, busy, reload } = useReviewAssignment(initial, onClose, onReload);
  const { summary } = recovery;
  return (
    <ReviewDialog
      title="Assign reviewer and deadline"
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
            disabled={busy || !summary.canAssign}
          >
            {formik.isSubmitting ? 'Saving…' : 'Save assignment'}
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
            onReload={reload}
          />
          {!summary.canAssign && (
            <Alert severity="info">
              Assignment is not available in the latest review. {summary.blockers.join(' ')}
            </Alert>
          )}
          <Typography variant="body2">
            Choose who will review this application. Assignment changes are recorded and require a
            new recommendation before a decision.
          </Typography>
          <ReviewAssigneeSelect
            value={formik.values.assignedReviewerId}
            role={summary.policy?.reviewerRole ?? null}
            disabled={busy}
            available
            label="Assigned reviewer"
            emptyLabel="Unassigned"
            savedName={summary.assignedReviewerName}
            onChange={(value) => formik.setFieldValue('assignedReviewerId', value)}
          />
          <DateTimePicker
            label="Review deadline (optional)"
            value={formik.values.dueAt ? dayjs(formik.values.dueAt) : null}
            disabled={busy}
            onChange={(value) =>
              formik.setFieldValue(
                'dueAt',
                value ? (value.isValid() ? value.toISOString() : 'invalid') : null
              )
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                onBlur: () => formik.setFieldTouched('dueAt'),
                error: Boolean(formik.touched.dueAt && formik.errors.dueAt),
                helperText:
                  (formik.touched.dueAt && formik.errors.dueAt) ||
                  'Shown in your local time. Clear this field to remove the deadline.',
              },
            }}
          />
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Reason *"
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
