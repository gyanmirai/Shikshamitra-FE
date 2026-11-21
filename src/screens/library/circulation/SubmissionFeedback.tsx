import { Alert, Button } from '@mui/material';

export function SubmissionFeedback({
  uncertain,
  needsReview,
  busy,
  onReview,
}: {
  uncertain: boolean;
  needsReview: boolean;
  busy: boolean;
  onReview: () => void;
}) {
  if (uncertain)
    return (
      <Alert severity="warning">
        The previous submission could not be confirmed. Retry the same submission to recover its
        result before changing this draft.
      </Alert>
    );
  if (!needsReview) return null;
  return (
    <Alert
      severity="warning"
      action={
        <Button type="button" size="small" disabled={busy} onClick={onReview}>
          Reload for review
        </Button>
      }
    >
      The saved record changed. Your draft is retained. Reload and review the current record before
      submitting again.
    </Alert>
  );
}
