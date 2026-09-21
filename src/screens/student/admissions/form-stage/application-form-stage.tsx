import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import {
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { FormStageSectionList } from './form-stage-section-list';
import { FormStageReasonDialog } from './form-stage-reason-dialog';
import { useApplicationFormStage } from './hooks/use-application-form-stage';

export function ApplicationFormStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
}: {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
}) {
  const {
    action,
    setAction,
    summary,
    busy,
    query,
    verifySection,
    submitReason,
    canEdit,
    canReopen,
  } = useApplicationFormStage({ applicationId, stageId: stage.id, advancing });
  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <div>
            <Typography variant="h6">{stage.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Managed application form
            </Typography>
          </div>
          {summary && (
            <Chip
              size="small"
              color={summary.canComplete ? 'success' : summary.isOverdue ? 'error' : 'info'}
              label={summary.canComplete ? 'Ready' : summary.isOverdue ? 'Overdue' : 'In progress'}
            />
          )}
        </Stack>
        {query.isFetching && <LinearProgress aria-label="Refreshing Form stage" />}
        {query.isLoading ? (
          <Skeleton variant="rounded" height={160} />
        ) : query.isError || !summary ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : (
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
                  label={`Due ${new Date(summary.dueAt).toLocaleDateString()}`}
                />
              )}
            </Stack>
            {summary.blockers.length > 0 && (
              <Alert severity={summary.isOverdue ? 'error' : 'info'}>
                {summary.blockers.join(' ')}
              </Alert>
            )}
            <FormStageSectionList
              sections={summary.sections}
              disabled={busy || !summary.canVerify || !canEdit}
              onVerify={verifySection}
              onRevoke={(section) => setAction({ type: 'revoke', section })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {canReopen && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={busy || !summary.canRequestCorrection}
                  onClick={() => setAction({ type: 'correction' })}
                >
                  Request correction
                </Button>
              )}
              {canAdvance && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={busy || !summary.canComplete}
                  onClick={() => onComplete()}
                >
                  Continue admission
                </Button>
              )}
            </Stack>
          </>
        )}
        {action && summary && (
          <FormStageReasonDialog
            title={
              action.type === 'correction'
                ? 'Request form correction'
                : `Reopen ${action.section.sectionName}`
            }
            description={
              action.type === 'correction'
                ? 'The application returns to draft. Previous section verification becomes stale and the applicant must resubmit.'
                : 'The section must be checked again before this Form stage can be completed.'
            }
            confirmLabel={action.type === 'correction' ? 'Request correction' : 'Reopen section'}
            busy={busy}
            onClose={() => setAction(null)}
            onSubmit={(reason) => submitReason(reason).then(() => undefined)}
          />
        )}
      </Stack>
    </Card>
  );
}
