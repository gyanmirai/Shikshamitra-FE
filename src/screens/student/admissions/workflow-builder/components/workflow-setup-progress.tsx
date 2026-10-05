import { Paper } from '@mui/material';
import CustomStepper from 'src/components/custom-stepper';

type Props = {
  activeStep?: 0 | 1;
};

export function WorkflowSetupProgress({ activeStep = 1 }: Props) {
  return (
    <Paper
      component="section"
      elevation={0}
      aria-label="Workflow setup progress"
      sx={{ px: { xs: 1, sm: 2 }, py: 2, flexShrink: 0 }}
    >
      <CustomStepper
        steps={['Workflow details', 'Build journey']}
        activeStep={activeStep}
        stepStates={activeStep === 1 ? ['completed', 'active'] : ['active', 'pending']}
        ariaLabel="Workflow setup steps"
      />
    </Paper>
  );
}
