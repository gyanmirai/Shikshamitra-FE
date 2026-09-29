'use client';

import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';
import CustomStepper from 'src/components/custom-stepper';

import { getStageStatusColor, getStageStatusLabel } from './application-progress-model';

type Props = {
  stages: AdmissionApplicationStage[];
  currentStageId?: string | null;
};

export function ApplicationStageJourney({ stages, currentStageId }: Props) {
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);

  if (!orderedStages.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No admission stages are available for this application.
      </Typography>
    );
  }

  return (
    <CustomStepper
      ariaLabel="Admission journey"
      orientation="vertical"
      steps={orderedStages.map((stage) => stage.name)}
      activeStep={orderedStages.findIndex(
        (stage) => stage.id === currentStageId || stage.status === 1
      )}
      stepStates={orderedStages.map((stage) => {
        if (stage.status === 2) return 'completed';
        if (stage.status === 3) return 'skipped';
        if (stage.status === 4 || stage.status === 5) return 'error';
        if (stage.id === currentStageId || stage.status === 1) return 'active';
        return 'pending';
      })}
      stepCaptions={orderedStages.map((stage) => (
        <Label key={stage.id} color={getStageStatusColor(stage.status)} sx={{ mt: 0.5 }}>
          {getStageStatusLabel(stage.status)}
        </Label>
      ))}
    />
  );
}
