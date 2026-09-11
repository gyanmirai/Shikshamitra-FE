import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import { ReviewDialog } from './review-dialog';
import { ReviewEvidence } from './review-evidence';
import { useReviewEditor } from './use-review-editor';
import { ReviewRecoveryAlert } from './review-recovery-alert';
import { useReviewPermissions } from './use-review-permissions';
import { ReviewChecklistFields } from './review-checklist-fields';
import { ReviewRecommendationFields } from './review-recommendation-fields';

export function ReviewEditorDialog({
  summary,
  onClose,
  onReload,
}: {
  summary: ReviewSummary;
  onClose: () => void;
  onReload: () => Promise<ReviewSummary>;
}) {
  const editor = useReviewEditor(summary, onClose, onReload);
  const permissions = useReviewPermissions();
  const { formik } = editor;
  const busy = formik.isSubmitting || editor.reloading;
  return (
    <ReviewDialog
      title="Review and recommendation"
      maxWidth="md"
      onClose={onClose}
      dirty={formik.dirty}
      busy={busy}
      actions={(cancel) => (
        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap', boxShadow: 'var(--shadows-10)' }}>
          <Button variant="outlined" disabled={busy} onClick={cancel}>
            Close
          </Button>
          {permissions.edit && (
            <Button
              variant="outlined"
              disabled={busy || !editor.summary.canSaveDraft}
              onClick={() => editor.save('draft')}
            >
              Save draft
            </Button>
          )}
          {permissions.submit && (
            <Button
              variant="contained"
              disabled={busy || !editor.summary.canSubmit}
              onClick={() => editor.save('submit')}
            >
              {formik.isSubmitting ? 'Saving…' : 'Submit recommendation'}
            </Button>
          )}
        </DialogActions>
      )}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Check the evidence, confirm the checklist and explain your recommendation. Submitting
            sends it for an explicit admission decision.
          </Typography>
          <ReviewRecoveryAlert
            error={editor.error}
            dirty={formik.dirty}
            busy={busy}
            onReload={editor.reload}
          />
          {editor.summary.isStale && (
            <Alert severity="warning">
              Evidence has changed. Check the current information before submitting a new
              recommendation.
            </Alert>
          )}
          {editor.summary.blockers.map((blocker) => (
            <Alert severity="info" key={blocker}>
              {blocker}
            </Alert>
          ))}
          <ReviewEvidence items={editor.summary.prerequisites} />
          <ReviewChecklistFields summary={editor.summary} formik={formik} />
          <ReviewRecommendationFields formik={formik} />
        </Stack>
      </DialogScrollContent>
    </ReviewDialog>
  );
}
