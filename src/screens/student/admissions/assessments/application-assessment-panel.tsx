import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Alert, Stack, Button, Skeleton, IconButton, Typography } from '@mui/material';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';

import { AdmissionQueryError } from '../admission-query-error';
import { AssessmentActionDialog } from './assessment-action-dialog';
import { AssessmentPanelActions } from './assessment-panel-actions';
import { AssessmentAttemptHistory } from './assessment-attempt-history';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { AssessmentAttemptWorkspace } from './assessment-attempt-workspace';
import { AssessmentSchedulingGuidance } from './assessment-scheduling-guidance';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';

import type { AssessmentAction } from './assessment-action-model';
import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

type Props = {
  applicationId: string;
  admissionOfferingId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  compact?: boolean;
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
  onOpenAssessments?: (url: string) => void;
};

export function ApplicationAssessmentPanel({
  applicationId,
  admissionOfferingId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  compact = false,
  showCompletionAction = true,
  onReadinessChange,
  onOpenAssessments,
}: Props) {
  const permissions = useAssessmentPermissions();
  const query = useGetApplicationAssessmentQuery(
    { applicationId, stageInstanceId: stage.id },
    { skip: !permissions.view }
  );
  const [action, setAction] = useState<AssessmentAction | null>(null);
  const [quickState, setQuickState] = useState({ dirty: false, busy: false });
  const onQuickStateChange = useCallback((next: typeof quickState) => {
    setQuickState((previous) =>
      previous.dirty === next.dirty && previous.busy === next.busy ? previous : next
    );
  }, []);
  const assessment = query.currentData;
  // The empty state and actions already explain how to begin an attempt.
  const blockers =
    assessment?.blockers.filter(
      (blocker) => blocker !== 'Create an assessment attempt or record an authorized waiver.'
    ) ?? [];
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(
      permissions.view && assessment?.canComplete && !query.isError && !quickState.dirty
    ),
    busy: query.isFetching || advancing || Boolean(action) || quickState.busy,
    dirty: quickState.dirty,
    concurrencyStamp: assessment?.concurrencyStamp,
  });
  return (
    <Card sx={compact ? { p: 0, boxShadow: 'none', borderRadius: 0 } : { p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant={compact ? 'subtitle1' : 'h6'}>{stage.name}</Typography>
            <CustomTooltip title="Record the entrance assessment or an authorized waiver. The configured assessment rules decide when this stage is ready to continue.">
              <IconButton size="small" color="info" aria-label="Assessment information">
                <Iconify icon="mdi:information-outline" width={16} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          {permissions.view && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" width={16} />}
              disabled={query.isFetching || advancing || Boolean(action) || quickState.busy}
              onClick={query.refetch}
            >
              Refresh
            </Button>
          )}
        </Stack>
        {!permissions.view ? (
          <Alert severity="info">
            Assessment access is required to view bookings and results. Contact an admissions
            administrator.
          </Alert>
        ) : query.isLoading ? (
          <Skeleton variant="rounded" height={140} />
        ) : !assessment ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !assessment.assessmentEnabled || !assessment.policy ? (
          <Alert severity="info">
            Assessment management is not enabled for this stage. Refresh the application to load its
            current workflow.
          </Alert>
        ) : (
          <>
            {query.isError && <AdmissionQueryError onRetry={query.refetch} />}
            {stage.status < 2 &&
              assessment.canBook &&
              !assessment.canComplete &&
              assessment.policy.schedulingEnabled &&
              !assessment.attempts.some(
                (attempt) => attempt.status !== 'cancelled' && Boolean(attempt.sessionId)
              ) && (
                <AssessmentSchedulingGuidance
                  admissionOfferingId={admissionOfferingId}
                  workflowStageDefinitionId={stage.definitionStageId}
                  canView={permissions.view}
                  canManageSessions={permissions.manageSessions}
                  disabled={query.isFetching || advancing}
                  onOpenAssessments={onOpenAssessments}
                />
              )}
            <Box
              component="dl"
              sx={{
                m: 0,
                p: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {[
                [
                  'Session booking',
                  assessment.policy.schedulingEnabled ? 'Required' : 'Not required',
                ],
                ['Attendance', assessment.policy.attendanceRequired ? 'Required' : 'Not required'],
                [
                  assessment.policy.scoringEnabled ? 'Pass mark' : 'Result',
                  assessment.policy.scoringEnabled
                    ? `${assessment.policy.passingMarks} / ${assessment.policy.totalMarks}`
                    : 'Pass or fail',
                ],
                ['Attempts', `${assessment.attempts.length} of ${assessment.policy.maxAttempts}`],
              ].map(([label, value]) => (
                <Box key={label} sx={{ minWidth: 0 }}>
                  <Typography component="dt" variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {blockers.length > 0 && (
              <Stack spacing={0.5} role="status">
                {blockers.map((blocker) => (
                  <Typography key={blocker} variant="body2">
                    {blocker}
                  </Typography>
                ))}
              </Stack>
            )}
            {!compact && assessment.canComplete && (
              <Alert severity="success">
                Assessment requirements are complete. Continue to apply the configured workflow
                route.
              </Alert>
            )}
            <Box
              component="section"
              aria-label="Assessment attempts"
              sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
            >
              {compact ? (
                <>
                  <AssessmentAttemptWorkspace
                    assessment={{ ...assessment, policy: assessment.policy }}
                    disabled={query.isError || query.isFetching || advancing || Boolean(action)}
                    readOnly={stage.status !== 1}
                    onAction={setAction}
                    onStateChange={onQuickStateChange}
                  />
                  {canAdvance && showCompletionAction && (
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ mt: 1.5 }}
                      disabled={
                        query.isFetching ||
                        advancing ||
                        Boolean(action) ||
                        quickState.busy ||
                        quickState.dirty ||
                        query.isError ||
                        !assessment.canComplete
                      }
                      onClick={() => onComplete()}
                    >
                      Complete assessment step
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ pb: 1, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
                  >
                    Assessment attempts
                  </Typography>
                  {assessment.attempts.length ? (
                    <AssessmentAttemptHistory attempts={assessment.attempts} />
                  ) : (
                    <EmptyContent
                      title="No assessment attempt yet"
                      description="Assessment attempts and results will appear here."
                      sx={{ py: 3, height: 'auto' }}
                      slotProps={{ img: { maxWidth: 80 } }}
                    />
                  )}
                  <AssessmentPanelActions
                    assessment={{ ...assessment, policy: assessment.policy }}
                    disabled={query.isError || query.isFetching || advancing}
                    canAdvance={canAdvance && showCompletionAction}
                    onAction={setAction}
                    onComplete={onComplete}
                    compact={compact}
                  />
                  {assessment.canWaive && permissions.waive && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Waiving requires permission and a reason.
                    </Typography>
                  )}
                </>
              )}
            </Box>
            {action && (
              <AssessmentActionDialog
                action={action}
                assessment={{ ...assessment, policy: assessment.policy }}
                admissionOfferingId={admissionOfferingId}
                workflowStageDefinitionId={stage.definitionStageId}
                onClose={() => setAction(null)}
              />
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
