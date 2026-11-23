import { Paper } from '@mui/material';
import CustomStepper from 'src/components/custom-stepper';

const steps = ['Workflow details', 'Build journey'];

type Props = {
  activeStep?: 0 | 1;
  onBackToDetails?: () => void;
  onContinueToJourney?: () => void;
  disabled?: boolean;
};

export function WorkflowSetupProgress({
  activeStep = 1,
  onBackToDetails,
  onContinueToJourney,
  disabled = false,
}: Props) {
  const onStepClick = (index: number) => {
    if (activeStep === 1 && index === 0) onBackToDetails?.();
    if (activeStep === 0 && index === 1) onContinueToJourney?.();
  };

  return (
    <Paper
      component="section"
      elevation={0}
      aria-label="Workflow Setup Progress"
      sx={{
        px: { xs: 1, sm: 2 },
        py: 0,
        flexShrink: 0,
        '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
      }}
    >
      <CustomStepper
        steps={steps}
        activeStep={activeStep}
        stepStates={activeStep === 1 ? ['completed', 'active'] : ['active', 'pending']}
        ariaLabel="Workflow setup steps"
        onStepClick={activeStep === 0 || onBackToDetails ? onStepClick : undefined}
        isStepClickable={(index) =>
          activeStep === 0 ? index === 0 || Boolean(onContinueToJourney) : index === 0
        }
        getStepAriaLabel={(label, index) => `Step ${index + 1}: ${label}`}
        disabled={disabled}
      />
    </Paper>
  );
}
