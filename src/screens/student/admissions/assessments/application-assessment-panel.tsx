import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { useRef, useState, useEffect, useCallback } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Box, Card, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';

import { AdmissionQueryError } from '../admission-query-error';
import { canWaiveAssessment } from './assessment-action-model';
import { AssessmentActionDialog } from './assessment-action-dialog';
import { AssessmentPanelActions } from './assessment-panel-actions';
import { AssessmentAttemptHistory } from './assessment-attempt-history';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { assessmentPassRuleLabels } from './assessment-subject-results';
import { AssessmentAttemptWorkspace } from './assessment-attempt-workspace';
import { AssessmentPipelineBookingDrawer } from './assessment-pipeline-booking-drawer';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';
import { ApplicationAssessmentSkeleton } from '../application-detail/application-workspace-skeleton';

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
  openAssessmentBooking?: boolean;
  onAssessmentBookingOpened?: () => void;
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
  openAssessmentBooking,
  onAssessmentBookingOpened,
}: Props) {
  const permissions = useAssessmentPermissions();
  const query = useGetApplicationAssessmentQuery(
    { applicationId, stageInstanceId: stage.id },
    { skip: !permissions.view }
  );
  const [action, setAction] = useState<AssessmentAction | null>(null);
  const bookingOpened = useRef(false);
  const refreshPending = useRef(false);
  const [quickState, setQuickState] = useState({ dirty: false, busy: false });
  const onQuickStateChange = useCallback((next: typeof quickState) => {
    setQuickState((previous) =>
      previous.dirty === next.dirty && previous.busy === next.busy ? previous : next
    );
  }, []);
  const assessment = query.currentData;
  const initialLoading = !assessment && (query.isLoading || query.isFetching);
  const controlsBusy = query.isFetching || advancing || Boolean(action) || quickState.busy;
  const assessmentActionsDisabled = controlsBusy || query.isError || quickState.dirty;
  const canWaive = Boolean(assessment && permissions.waive && canWaiveAssessment(assessment));
  const showCompactActions =
    compact && assessment?.assessmentEnabled && assessment.policy && stage.status === 1;
  const canOpenBooking = Boolean(
    permissions.view &&
    permissions.book &&
    stage.status === 1 &&
    assessment?.assessmentEnabled &&
    assessment.policy?.schedulingEnabled &&
    assessment.canBook &&
    !assessmentActionsDisabled
  );
  useEffect(() => {
    if (!openAssessmentBooking) {
      bookingOpened.current = false;
      return;
    }
    if (!canOpenBooking || bookingOpened.current) return;
    bookingOpened.current = true;
    setAction('book');
    onAssessmentBookingOpened?.();
  }, [canOpenBooking, openAssessmentBooking, onAssessmentBookingOpened]);
  const refresh = async () => {
    if (controlsBusy || refreshPending.current) return;
    refreshPending.current = true;
    try {
      await query.refetch();
    } finally {
      refreshPending.current = false;
    }
  };
  // The summary and controls provide routine guidance; retain actionable blockers.
  const blockers =
    assessment?.blockers.filter(
      (blocker) =>
        ![
          'Create an assessment attempt or record an authorized waiver.',
          'Record the required assessment attendance and result.',
          'Attendance and results become available when the session starts.',
        ].includes(blocker)
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
    <Card
      aria-busy={query.isFetching}
      sx={{
        ...(compact ? { p: 0, boxShadow: 'none', borderRadius: 0 } : { p: 2 }),
        ...skeletonReducedMotionSx,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ overflowWrap: 'anywhere' }}>
              {stage.name}
            </Typography>
            <InfoTooltipIcon
              label="Assessment Information"
              title="Record the assessment or an authorized waiver. The assessment rules determine when this stage can continue."
            />
          </Stack>
          {permissions.view && (
            <Stack
              role="group"
              aria-label="Assessment Actions"
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ ml: 'auto', minWidth: 0 }}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" width={16} />}
                loading={Boolean(assessment) && query.isFetching}
                loadingPosition="start"
                loadingIndicator={
                  <CircularProgress size={14} color="inherit" aria-label="Refreshing Assessment" />
                }
                disabled={controlsBusy}
                onClick={refresh}
              >
                Refresh
              </Button>
              {showCompactActions && !assessment.attempts.length && canWaive && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={assessmentActionsDisabled}
                    onClick={() => setAction('waive')}
                  >
                    Waive Assessment
                  </Button>
                )}
              {showCompactActions && assessment.canBook && permissions.book && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={assessmentActionsDisabled}
                  onClick={() => setAction('book')}
                >
                  {assessment.policy?.schedulingEnabled ? 'Book Assessment Slot' : 'Start Assessment'}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
        {!permissions.view ? (
          <StudentFeedback notificationKey="STU-0231" presentation="inline" severity="info">
            Assessment access is required to view bookings and results. Contact an admissions
            administrator.
          </StudentFeedback>
        ) : initialLoading ? (
          <ApplicationAssessmentSkeleton showHeading={false} />
        ) : !assessment ? (
          <AdmissionQueryError onRetry={refresh} />
        ) : !assessment.assessmentEnabled || !assessment.policy ? (
          <StudentFeedback notificationKey="STU-0232" presentation="inline" severity="info">
            Assessment management is not enabled for this stage. Refresh the application to load its
            current workflow.
          </StudentFeedback>
        ) : (
          <>
            {query.isError && <AdmissionQueryError onRetry={refresh} />}
            <Box
              component="dl"
              sx={
                compact
                  ? { m: 0, display: 'flex', flexWrap: 'wrap', gap: 2 }
                  : {
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
                    }
              }
            >
              {(compact
                ? [
                    [
                      assessment.policy.scoringEnabled ? 'Pass mark' : 'Result',
                      assessment.effectiveProfile
                        ? assessmentPassRuleLabels[assessment.effectiveProfile.passRule]
                        : assessment.policy.scoringEnabled
                          ? `${assessment.policy.passingMarks} / ${assessment.policy.totalMarks}`
                          : 'Pass or fail',
                    ],
                    [
                      'Attempts',
                      `${assessment.attempts.length} of ${assessment.policy.maxAttempts}`,
                    ],
                  ]
                : [
                    [
                      'Session booking',
                      assessment.policy.schedulingEnabled ? 'Required' : 'Not required',
                    ],
                    [
                      'Attendance',
                      assessment.policy.attendanceRequired ? 'Required' : 'Not required',
                    ],
                    [
                      assessment.policy.scoringEnabled ? 'Pass mark' : 'Result',
                      assessment.effectiveProfile
                        ? assessmentPassRuleLabels[assessment.effectiveProfile.passRule]
                        : assessment.policy.scoringEnabled
                          ? `${assessment.policy.passingMarks} / ${assessment.policy.totalMarks}`
                          : 'Pass or fail',
                    ],
                    [
                      'Attempts',
                      `${assessment.attempts.length} of ${assessment.policy.maxAttempts}`,
                    ],
                  ]
              ).map(([label, value]) => (
                <Box
                  key={label}
                  sx={
                    compact
                      ? { minWidth: 0, display: 'flex', gap: 0.5, alignItems: 'baseline' }
                      : { minWidth: 0 }
                  }
                >
                  <Typography
                    component="dt"
                    variant={compact ? 'body2' : 'caption'}
                    color="text.secondary"
                  >
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
              <StudentFeedback notificationKey="STU-0234" presentation="inline" severity="success">
                Assessment requirements are complete. Continue to apply the configured workflow
                route.
              </StudentFeedback>
            )}
            <Box
              component="section"
              aria-label="Assessment Attempts"
              sx={
                compact
                  ? { minWidth: 0 }
                  : { p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 1.5 }
              }
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
                      Complete Assessment Step
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ pb: 1, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
                  >
                    Assessment Attempts
                  </Typography>
                  {assessment.attempts.length ? (
                    <AssessmentAttemptHistory attempts={assessment.attempts} />
                  ) : (
                    <EmptyContent
                      title="No Assessment Attempt Yet"
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
                  {canWaive && (
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
            {action === 'book' && assessment.policy.schedulingEnabled ? (
              <AssessmentPipelineBookingDrawer
                assessment={{ ...assessment, policy: assessment.policy }}
                admissionOfferingId={admissionOfferingId}
                stage={stage}
                disabled={query.isError || query.isFetching || advancing || stage.status !== 1}
                onClose={() => setAction(null)}
              />
            ) : (
              action && (
                <AssessmentActionDialog
                  action={action}
                  assessment={{ ...assessment, policy: assessment.policy }}
                  admissionOfferingId={admissionOfferingId}
                  workflowStageDefinitionId={stage.definitionStageId}
                  onClose={() => setAction(null)}
                />
              )
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
