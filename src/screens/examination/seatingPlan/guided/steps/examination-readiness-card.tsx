import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import type { GuidedStepProps } from '../types';

export function ExaminationReadinessCard({
  workflow,
  onReset,
}: {
  workflow: GuidedStepProps['workflow'];
  onReset: () => void;
}) {
  const { readiness } = workflow;
  const coverage = readiness.totalSubjectCount
    ? Math.round((readiness.plannedSubjectCount / readiness.totalSubjectCount) * 100)
    : 0;
  const severity = readiness.isPublished
    ? 'success'
    : readiness.isReadyToPublish
      ? 'success'
      : 'info';

  return (
    <Alert
      severity={severity}
      variant="outlined"
    >
      <Stack spacing={1}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1">
            {readiness.isPublished
              ? 'Examination seating is published'
              : readiness.isReadyToPublish
                ? 'All subjects and plans are ready'
                : 'Complete every subject before publishing'}
          </Typography>
          <Typography variant="body2">
            {readiness.plannedSubjectCount} of {readiness.totalSubjectCount} subjects planned ·{' '}
            {readiness.readyPlanCount} of {readiness.totalPlanCount} plans ready ·{' '}
            {readiness.allocatedStudentSeats} of {readiness.totalStudentSeats} seats assigned
          </Typography>
        </Stack>
        {!readiness.isPublished && (
          <LinearProgress
            variant="determinate"
            value={coverage}
            aria-label={`${coverage}% of examination subjects assigned to seating plans`}
          />
        )}
        {readiness.blockers.slice(0, 3).map((issue) => (
          <Typography key={`${issue.code}-${issue.seatingPlanId ?? ''}`} variant="caption">
            {issue.message}
          </Typography>
        ))}
        {readiness.blockers.length > 3 && (
          <Typography variant="caption">
            {readiness.blockers.length - 3} more issue
            {readiness.blockers.length - 3 === 1 ? '' : 's'} will appear in the final review.
          </Typography>
        )}
        {readiness.canResetDraft && (
          <Button
            color="error"
            size="small"
            variant="text"
            disabled={!workflow.permissions.canDelete || workflow.isBusy}
            onClick={onReset}
            sx={{ minHeight: 36, alignSelf: 'flex-start' }}
          >
            Reset all draft seating
          </Button>
        )}
      </Stack>
    </Alert>
  );
}
