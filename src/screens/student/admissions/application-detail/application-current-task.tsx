import type {
  AdmissionApplicationStage,
  AdmissionApplicationStatus,
} from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { LoadingButton } from 'src/components/loading-button';
import { Alert, Stack, Button, Typography } from '@mui/material';

import { isFormStage, getStageGuidance, getStageActionLabel } from './application-progress-model';

type Props = {
  stage: AdmissionApplicationStage;
  applicationStatus: AdmissionApplicationStatus;
  nextRequiredAction?: string | null;
  active: boolean;
  awaitingDecision: boolean;
  canComplete: boolean;
  canRetryFormHandoff: boolean;
  canSkip: boolean;
  canOverride: boolean;
  hasAlternativeRoutes: boolean;
  advancing: boolean;
  retryingFormHandoff: boolean;
  onAdvance: () => void;
  onRetryFormHandoff: () => void;
  onSkip: () => void;
  onOverride: () => void;
};

export function ApplicationCurrentTask({
  stage,
  applicationStatus,
  nextRequiredAction,
  active,
  awaitingDecision,
  canComplete,
  canRetryFormHandoff,
  canSkip,
  canOverride,
  hasAlternativeRoutes,
  advancing,
  retryingFormHandoff,
  onAdvance,
  onRetryFormHandoff,
  onSkip,
  onOverride,
}: Props) {
  const showActions =
    canComplete || canRetryFormHandoff || canSkip || canOverride || awaitingDecision;

  return (
    <Alert
      severity={awaitingDecision ? 'warning' : 'info'}
      icon={<Iconify icon={awaitingDecision ? 'mdi:gavel' : 'mdi:arrow-right-circle'} />}
      sx={{ mt: 2, alignItems: 'flex-start' }}
    >
      <Typography variant="overline" color="text.secondary">
        Current task
      </Typography>
      <Typography variant="subtitle1" fontWeight={700}>
        {stage.name}
      </Typography>
      <Typography variant="body2">
        {getStageGuidance(stage, applicationStatus, nextRequiredAction)}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Entered {fDateTime(stage.enteredAt) || 'time not recorded'}
      </Typography>
      {active && showActions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
          {canComplete && (
            <LoadingButton
              size="small"
              variant="contained"
              loading={advancing}
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              sx={{ minHeight: 44 }}
              onClick={onAdvance}
            >
              {getStageActionLabel(stage)}
            </LoadingButton>
          )}
          {canRetryFormHandoff && (
            <LoadingButton
              size="small"
              variant="contained"
              loading={retryingFormHandoff}
              startIcon={<Iconify icon="mdi:arrow-right-circle-outline" />}
              sx={{ minHeight: 44 }}
              onClick={onRetryFormHandoff}
            >
              Continue admission
            </LoadingButton>
          )}
          {awaitingDecision && (
            <Button
              size="small"
              variant="contained"
              href="#admission-decision"
              startIcon={<Iconify icon="mdi:clipboard-check-outline" />}
              sx={{ minHeight: 44 }}
            >
              Review admission decision
            </Button>
          )}
          {canSkip && stage.allowManualSkip && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="mdi:skip-next-outline" />}
              sx={{ minHeight: 44 }}
              onClick={onSkip}
            >
              Skip this step
            </Button>
          )}
          {canOverride && hasAlternativeRoutes && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="mdi:shield-alert-outline" />}
              sx={{ minHeight: 44 }}
              onClick={onOverride}
            >
              Override route
            </Button>
          )}
        </Stack>
      )}
      {isFormStage(stage) && !canRetryFormHandoff && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          The form automatically advances this journey after a successful submission.
        </Typography>
      )}
    </Alert>
  );
}
