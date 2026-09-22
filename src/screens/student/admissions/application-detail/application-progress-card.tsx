import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Divider,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { ApplicationCurrentTask } from './application-current-task';
import { ApplicationStageJourney } from './application-stage-journey';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';
import {
  isApprovalStage,
  getWorkflowProgress,
  canRetrySubmittedFormHandoff,
  canStageTypeCompleteForStatus,
  canCompleteStageFromProgress,
} from './application-progress-model';

type Props = {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  currentStage?: AdmissionApplicationStage;
  canAdvance: boolean;
  canSkip: boolean;
  canOverride: boolean;
  advancing: boolean;
  retryingFormHandoff: boolean;
  onAdvance: () => void;
  onRetryFormHandoff: () => void;
  onSkip: () => void;
  onOverride: () => void;
};

export function ApplicationProgressCard({
  application,
  workflow,
  currentStage,
  canAdvance,
  canSkip,
  canOverride,
  advancing,
  retryingFormHandoff,
  onAdvance,
  onRetryFormHandoff,
  onSkip,
  onOverride,
}: Props) {
  const stages = workflow?.stages ?? [];
  const progress = getWorkflowProgress(stages);
  const active = workflow?.status === 0 && Boolean(workflow.currentStageInstanceId);
  const canComplete = canCompleteStageFromProgress(currentStage, application.status, canAdvance);
  const canRetryFormHandoff = canRetrySubmittedFormHandoff(currentStage, application.status);
  const awaitingDecision =
    isApprovalStage(currentStage) &&
    !canStageTypeCompleteForStatus(currentStage, application.status);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Admission journey</Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.completed} of {progress.total} steps completed
            </Typography>
          </Box>
          <Chip
            size="small"
            label={getAdmissionApplicationStatusLabel(application.status)}
            color={getAdmissionApplicationStatusColor(application.status)}
          />
          <Typography variant="subtitle2">{progress.percentage}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          aria-label={`${progress.percentage}% of the admission journey completed`}
          sx={{ height: 8, mt: 1.5, borderRadius: 1 }}
        />
        {currentStage && workflow?.status === 0 && (
          <ApplicationCurrentTask
            stage={currentStage}
            applicationStatus={application.status}
            nextRequiredAction={workflow.nextRequiredAction}
            active={active}
            awaitingDecision={awaitingDecision}
            canComplete={canComplete}
            canRetryFormHandoff={canRetryFormHandoff}
            canSkip={canSkip}
            canOverride={canOverride}
            hasAlternativeRoutes={Boolean(workflow.availableTransitions.length)}
            advancing={advancing}
            retryingFormHandoff={retryingFormHandoff}
            onAdvance={onAdvance}
            onRetryFormHandoff={onRetryFormHandoff}
            onSkip={onSkip}
            onOverride={onOverride}
          />
        )}
        {stages.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <ApplicationStageJourney
              stages={stages}
              currentStageId={workflow?.currentStageInstanceId}
            />
          </>
        )}
        {workflow?.status === 1 && (
          <Alert severity="success" icon={<Iconify icon="mdi:check-decagram" />} sx={{ mt: 2 }}>
            Admission workflow completed. The decision and full audit history remain available
            below.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
