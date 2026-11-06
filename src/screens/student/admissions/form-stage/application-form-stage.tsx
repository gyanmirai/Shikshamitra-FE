import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { StudentFeedback } from 'src/components/student-feedback';
import { Card, Chip, Stack, Button, Skeleton, Typography } from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';
import { FormStageReasonDialog } from './form-stage-reason-dialog';
import { useApplicationFormStage } from './hooks/use-application-form-stage';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';

import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

export function ApplicationFormStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  compact = false,
  showCompletionAction = true,
  onReadinessChange,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  compact?: boolean;
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
}) {
  const { action, setAction, summary, busy, query, submitReason, canReopen } =
    useApplicationFormStage({ applicationId, stageId: stage.id, advancing });
  const loading = query.isLoading || query.isFetching;
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(summary?.canComplete && !query.isError),
    busy: busy || Boolean(action),
    concurrencyStamp: summary?.concurrencyStamp,
  });

  const correctionAction = summary && canReopen && summary.canRequestCorrection && (
    <Button
      size="small"
      variant="outlined"
      disabled={busy}
      onClick={() => setAction({ type: 'correction' })}
    >
      Request Correction
    </Button>
  );
  const completionAction = showCompletionAction && canAdvance && summary && !query.isError && (
    <Button
      size="small"
      variant="contained"
      disabled={busy || !summary.canComplete}
      loading={advancing}
      loadingPosition="end"
      onClick={onComplete}
    >
      Continue Admission
    </Button>
  );
  const reasonDialog = action && summary && (
    <FormStageReasonDialog
      title="Request Form Correction"
      description="The application returns to draft and the applicant must resubmit the corrected form."
      confirmLabel="Request Correction"
      busy={busy}
      onClose={() => setAction(null)}
      onSubmit={(reason) => submitReason(reason).then(() => undefined)}
    />
  );
  const error = query.isError || (!loading && !summary);

  if (compact) {
    return (
      <>
        {loading ? (
          <Stack role="status" aria-label="Loading Form Stage" direction="row" spacing={1}>
            <Skeleton variant="rounded" width={140} height={30} />
          </Stack>
        ) : error ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            {correctionAction}
            {completionAction}
          </Stack>
        )}
        {reasonDialog}
      </>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <div>
            <Typography variant="h6">{stage.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Managed Application Form
            </Typography>
          </div>
          {!loading && !error && summary && (
            <Label color={summary.canComplete ? 'success' : summary.isOverdue ? 'error' : 'info'}>
              {summary.canComplete ? 'Ready' : summary.isOverdue ? 'Overdue' : 'In Progress'}
            </Label>
          )}
        </Stack>
        {loading ? (
          <Stack spacing={1} role="status" aria-label="Loading Form Stage">
            <Skeleton width="50%" />
            <Skeleton width="75%" />
            <Skeleton variant="rounded" width={140} height={30} />
          </Stack>
        ) : error ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : summary ? (
          <>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip
                size="small"
                label={`Owner: ${summary.policy?.responsibility ?? 'applicant'}`}
              />
              <Chip
                size="small"
                label={`Submissions: ${summary.submissionAttempts}/${summary.policy?.maxSubmissionAttempts ?? 1}`}
              />
              {summary.dueAt && (
                <Chip
                  size="small"
                  color={summary.isOverdue ? 'error' : 'default'}
                  label={`Due ${fDate(summary.dueAt, ADMISSION_DATE_FORMAT)}`}
                />
              )}
            </Stack>
            {summary.blockers.length > 0 && (
              <StudentFeedback
                notificationKey="STU-0384"
                presentation={summary.isOverdue ? 'persistent' : 'inline'}
                severity={summary.isOverdue ? 'error' : 'info'}
              >
                {summary.blockers.join(' ')}
              </StudentFeedback>
            )}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {correctionAction}
              {completionAction}
            </Stack>
          </>
        ) : null}
        {reasonDialog}
      </Stack>
    </Card>
  );
}
