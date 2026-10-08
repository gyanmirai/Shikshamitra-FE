import type {
  AdmissionApplicationStage,
  AdmissionApplicationStatus,
} from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Stack, Button, Divider, Typography } from '@mui/material';

import {
  isFormStage,
  getStageGuidance,
  getStageStatusColor,
  getStageStatusLabel,
  getStageActionLabel,
} from './application-progress-model';

type Props = {
  stage: AdmissionApplicationStage;
  applicationStatus: AdmissionApplicationStatus;
  nextRequiredAction?: string | null;
  active: boolean;
  awaitingDecision: boolean;
  canComplete: boolean;
  canRetryFormHandoff: boolean;
  canSkip: boolean;
  advancing: boolean;
  retryingFormHandoff: boolean;
  onAdvance: () => void;
  onRetryFormHandoff: () => void;
  onSkip: () => void;
  onReviewForm: () => void;
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
  advancing,
  retryingFormHandoff,
  onAdvance,
  onRetryFormHandoff,
  onSkip,
  onReviewForm,
}: Props) {
  const showActions = canComplete || canRetryFormHandoff || canSkip || awaitingDecision;

  return (
    <Box component="section" aria-labelledby="current-application-step-heading">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-start' }}
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography
              id="current-application-step-heading"
              variant="h4"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {stage.name}
            </Typography>
            <Label color={getStageStatusColor(stage.status)}>
              {getStageStatusLabel(stage.status)}
            </Label>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            {getStageGuidance(stage, applicationStatus, nextRequiredAction)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Entered {fDateTime(stage.enteredAt) || 'time not recorded'}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          onClick={onReviewForm}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            flexShrink: 0,
          }}
        >
          Review application form
        </Button>
      </Stack>

      {active && showActions && (
        <>
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            {canComplete && (
              <LoadingButton
                size="small"
                variant="outlined"
                color="inherit"
                loading={advancing}
                startIcon={<Iconify icon="mdi:check-circle-outline" />}
                onClick={onAdvance}
              >
                {getStageActionLabel(stage)}
              </LoadingButton>
            )}
            {canRetryFormHandoff && (
              <LoadingButton
                size="small"
                variant="outlined"
                color="inherit"
                loading={retryingFormHandoff}
                startIcon={<Iconify icon="mdi:arrow-right-circle-outline" />}
                onClick={onRetryFormHandoff}
              >
                Continue admission
              </LoadingButton>
            )}
            {awaitingDecision && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                href="#admission-decision"
                startIcon={<Iconify icon="mdi:clipboard-check-outline" />}
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
                onClick={onSkip}
              >
                Skip this step
              </Button>
            )}
          </Stack>
        </>
      )}

      {isFormStage(stage) && !canRetryFormHandoff && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          The form automatically advances this journey after a successful submission.
        </Typography>
      )}
    </Box>
  );
}
