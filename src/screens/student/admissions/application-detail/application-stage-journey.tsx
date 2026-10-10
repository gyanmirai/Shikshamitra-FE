'use client';

import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Typography } from '@mui/material';
import CustomStepper from 'src/components/custom-stepper';

type Props = {
  stages: AdmissionApplicationStage[];
  currentStageId?: string | null;
  selectedStageId?: string;
  busy?: boolean;
  onChange?: (stageId: string) => void;
};

export function ApplicationStageJourney({
  stages,
  currentStageId,
  selectedStageId,
  busy,
  onChange,
}: Props) {
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
      activeStep={orderedStages.findIndex((stage) =>
        selectedStageId
          ? stage.id === selectedStageId
          : stage.id === currentStageId || stage.status === 1
      )}
      stepStates={orderedStages.map((stage) => {
        if (stage.status === 2) return 'completed';
        if (stage.status === 3) return 'skipped';
        if (stage.status === 4 || stage.status === 5) return 'error';
        if (stage.id === currentStageId || stage.status === 1) return 'active';
        return 'pending';
      })}
      disabled={busy}
      onStepClick={onChange ? (index) => onChange(orderedStages[index].id) : undefined}
    />
  );
}
