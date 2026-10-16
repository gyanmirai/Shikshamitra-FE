import dynamic from 'next/dynamic';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { FormSectionCard } from 'src/components/form-section-card';

import { RoomsStep } from './rooms-step';
import { AllocationStep } from './allocation-step';
import { AllocationModeStep } from './allocation-mode-step';
import { AutomaticSeatingPreview } from './automatic-seating-preview';

import type { GuidedStepProps } from '../types';

const GuidedManualEditor = dynamic(
  () => import('../manual/guided-manual-editor').then((module) => module.GuidedManualEditor),
  {
    loading: () => (
      <Skeleton variant="rounded" height={460} aria-label="Loading classroom editor" />
    ),
  }
);

export function ConfigureStep(props: GuidedStepProps) {
  const { workflow } = props;
  return (
    <Stack spacing={1.5} sx={{ p: 2, width: '100%' }}>
      <RoomsStep {...props} />
      <AllocationModeStep {...props} />
      <AllocationStep {...props} />
      {workflow.formik.values.allocationMode === 'automatic' && (
        <AutomaticSeatingPreview {...props} />
      )}
      {workflow.formik.values.allocationMode === 'manual' && (
        <FormSectionCard
          icon="mdi:seat"
          title="Classroom seating"
          descriptionTooltip="Arrange students on the classroom layout by dragging, selecting, moving or swapping them. Review the proposal before applying it to save the assignments."
        >
          <GuidedManualEditor {...props} />
        </FormSectionCard>
      )}
    </Stack>
  );
}
