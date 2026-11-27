import type { LabelColor } from 'src/components/label';
import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionFormChangeHistory,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Box, Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';

import { FormHistoryCard } from './form-history-card';
import { TransitionHistoryCard } from './transition-history-card';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { ApplicationJourneyHistory } from './application-journey-history';
import { applicationHistoryCardProps } from './application-history-card-props';

const journeyStatuses: Record<
  AdmissionApplicationWorkflow['status'],
  { label: string; color: LabelColor }
> = {
  0: { label: 'In progress', color: 'primary' },
  1: { label: 'Completed', color: 'success' },
  2: { label: 'Cancelled', color: 'default' },
  3: { label: 'Failed', color: 'error' },
  4: { label: 'Not started', color: 'default' },
};

export function ApplicationHistoryView({
  application,
  workflow,
  currentStage,
  formHistory,
  formHistoryLoading,
  retryFormHistory,
  onReturnToJourney,
}: {
  application: Pick<
    AdmissionApplication,
    'applicantId' | 'status' | 'decisionReason' | 'decisionAt'
  >;
  workflow?: AdmissionApplicationWorkflow;
  currentStage?: AdmissionApplicationStage;
  formHistory: AdmissionFormChangeHistory[];
  formHistoryLoading: boolean;
  retryFormHistory?: () => void;
  onReturnToJourney: () => void;
}) {
  const currentStep = workflow?.status === 0 ? currentStage : undefined;
  const summaryTitle = currentStep ? 'Current Step' : 'Journey Status';
  const journeyStatus = workflow && journeyStatuses[workflow.status];
  const showClosure = application.status === 2 && Boolean(application.decisionReason?.trim());

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Stack
        direction="row"
        gap={1}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography component="h3" variant="h6">
          Application History
        </Typography>
        <Button
          type="button"
          color="inherit"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.back} />}
          onClick={onReturnToJourney}
          sx={{ ml: 'auto' }}
        >
          {currentStep ? 'Go to current step' : 'Back to journey'}
        </Button>
      </Stack>

      {showClosure && (
        <StudentFeedback notificationKey="STU-0014" presentation="inline" severity="info">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Admission Journey Ended</Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              {application.decisionReason}
            </Typography>
            {application.decisionAt && (
              <Typography variant="caption" color="text.secondary">
                {fDateTime(application.decisionAt, ADMISSION_DATE_TIME_FORMAT)}
              </Typography>
            )}
          </Stack>
        </StudentFeedback>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          alignItems: 'start',
          gap: 2,
          '@container (min-width: 760px)': {
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ApplicationJourneyHistory applicantId={application.applicantId} />
        </Box>
        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <FormSectionCard
            {...applicationHistoryCardProps}
            aria-label={summaryTitle}
            title={summaryTitle}
            titleTypographyProps={{ component: 'h4' }}
            descriptionTooltip="The current stage or saved outcome of this admission journey."
            icon="mdi:source-branch"
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              {currentStep ? (
                <Typography variant="subtitle2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  {currentStep.name}
                </Typography>
              ) : (
                !journeyStatus && <Typography variant="body2">No current step</Typography>
              )}
              {journeyStatus && <Label color={journeyStatus.color}>{journeyStatus.label}</Label>}
            </Stack>
          </FormSectionCard>
          <TransitionHistoryCard workflow={workflow} />
          <FormHistoryCard
            history={formHistory}
            loading={formHistoryLoading}
            onRetry={retryFormHistory}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
