'use client';

import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useResponsive } from 'src/hooks/use-responsive';
import { Step, Chip, Stepper, StepLabel, Typography } from '@mui/material';

import { STAGE_STATUS_LABELS } from './application-progress-model';

type Props = {
  stages: AdmissionApplicationStage[];
  currentStageId?: string | null;
};

const statusColor = (status: number) => {
  if (status === 2) return 'success' as const;
  if (status === 3) return 'warning' as const;
  if (status === 4 || status === 5) return 'error' as const;
  if (status === 1) return 'primary' as const;
  return 'default' as const;
};

export function ApplicationStageJourney({ stages, currentStageId }: Props) {
  const horizontal = useResponsive('up', 'md');
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
  const activeStep = orderedStages.findIndex((stage) => stage.id === currentStageId);

  return (
    <Stepper
      activeStep={activeStep}
      orientation={horizontal ? 'horizontal' : 'vertical'}
      alternativeLabel={horizontal}
      aria-label="Admission journey"
      sx={{ py: 1 }}
    >
      {orderedStages.map((stage) => (
        <Step
          key={stage.id}
          completed={stage.status === 2 || stage.status === 3}
          aria-current={stage.id === currentStageId ? 'step' : undefined}
        >
          <StepLabel
            error={stage.status === 4 || stage.status === 5}
            optional={
              <Chip
                size="small"
                color={statusColor(stage.status)}
                variant={stage.status === 1 ? 'filled' : 'outlined'}
                label={STAGE_STATUS_LABELS[stage.status] ?? 'Unknown'}
                sx={{ mt: 0.5 }}
              />
            }
          >
            <Typography variant="subtitle2" sx={{ whiteSpace: 'normal' }}>
              {stage.name}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
