import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { RoomsStep } from './rooms-step';
import { AllocationStep } from './allocation-step';
import { AllocationModeStep } from './allocation-mode-step';
import { GuidedManualEditor } from '../manual/guided-manual-editor';

import type { GuidedStepProps } from '../types';

export function ConfigureStep(props: GuidedStepProps) {
  const { workflow } = props;
  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Configure capacity and seating rules</Typography>
        <Typography color="text.secondary">
          Confirm enough usable seats, then choose how students should be arranged. The next step
          generates a preview without changing the approved plan.
        </Typography>
      </Stack>
      <RoomsStep {...props} />
      <Divider />
      <AllocationModeStep {...props} />
      <Divider />
      <AllocationStep {...props} />
      {workflow.formik.values.allocationMode === 'manual' && <GuidedManualEditor {...props} />}
    </Stack>
  );
}
