import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Card, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';

import { AdmissionQueryError } from '../admission-query-error';
import { AssessmentActionDialog } from './assessment-action-dialog';
import { AssessmentPanelActions } from './assessment-panel-actions';
import { AssessmentAttemptHistory } from './assessment-attempt-history';
import { useAssessmentPermissions } from './use-assessment-permissions';

import type { AssessmentAction } from './assessment-action-model';

type Props = {
  applicationId: string;
  admissionOfferingId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
};

export function ApplicationAssessmentPanel({
  applicationId,
  admissionOfferingId,
  stage,
  canAdvance,
  advancing,
  onComplete,
}: Props) {
  const permissions = useAssessmentPermissions();
  const query = useGetApplicationAssessmentQuery(
    { applicationId, stageInstanceId: stage.id },
    { skip: !permissions.view }
  );
  const [action, setAction] = useState<AssessmentAction | null>(null);
  const assessment = query.currentData;
  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{stage.name}</Typography>
          {permissions.view && (
            <Button size="small" disabled={query.isFetching || advancing} onClick={query.refetch}>
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
        ) : query.isError || !assessment ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : !assessment.assessmentEnabled || !assessment.policy ? (
          <Alert severity="info">
            Assessment management is not enabled for this stage. Refresh the application to load its
            current workflow.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {assessment.policy.schedulingEnabled
                ? 'Staff book a scheduled session.'
                : 'No session booking required.'}
              {assessment.policy.attendanceRequired ? ' Attendance is required.' : ''}
              {assessment.policy.scoringEnabled
                ? ` Pass mark: ${assessment.policy.passingMarks} / ${assessment.policy.totalMarks}.`
                : ' Record a pass or fail result.'}
              {assessment.policy.reviewRequired
                ? ' A different reviewer must approve the result.'
                : ''}
              {` Maximum attempts: ${assessment.policy.maxAttempts}.`}
            </Typography>
            {assessment.blockers.length > 0 && (
              <Alert severity="info">
                <Stack spacing={0.5}>
                  {assessment.blockers.map((blocker) => (
                    <Typography key={blocker} variant="body2">
                      {blocker}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
            {assessment.canComplete && (
              <Alert severity="success">
                Assessment requirements are complete. Continue to apply the configured workflow
                route.
              </Alert>
            )}
            {assessment.attempts.length ? (
              <AssessmentAttemptHistory attempts={assessment.attempts} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No assessment attempt has started.
              </Typography>
            )}
            <AssessmentPanelActions
              assessment={{ ...assessment, policy: assessment.policy }}
              disabled={query.isFetching || advancing}
              canAdvance={canAdvance}
              onAction={setAction}
              onComplete={onComplete}
            />
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
