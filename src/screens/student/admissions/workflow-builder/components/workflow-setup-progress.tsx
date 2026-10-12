import CustomStepper from 'src/components/custom-stepper';
import { Step, Paper, Stepper, StepLabel, StepButton } from '@mui/material';

type Props = {
  activeStep?: 0 | 1;
  onBackToDetails?: () => void;
  disabled?: boolean;
};

export function WorkflowSetupProgress({
  activeStep = 1,
  onBackToDetails,
  disabled = false,
}: Props) {
  return (
    <Paper
      component="section"
      elevation={0}
      aria-label="Workflow setup progress"
      sx={{ px: { xs: 1, sm: 2 }, py: 0, flexShrink: 0 }}
    >
      {onBackToDetails && activeStep === 1 ? (
        <Stepper
          role="list"
          aria-label="Workflow setup steps"
          activeStep={activeStep}
          alternativeLabel
          sx={{ m: 0, p: 0 }}
        >
          <Step role="listitem" completed sx={{ '& svg': { width: 28, height: 28 } }}>
            <StepButton
              onClick={onBackToDetails}
              disabled={disabled}
              aria-label="Back to workflow details"
            >
              <StepLabel sx={{ '& .MuiStepLabel-label': { typography: 'subtitle2' } }}>
                Workflow details
              </StepLabel>
            </StepButton>
          </Step>
          <Step role="listitem" aria-current="step" sx={{ '& svg': { width: 28, height: 28 } }}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { typography: 'subtitle2' } }}>
              Build journey
            </StepLabel>
          </Step>
        </Stepper>
      ) : (
        <CustomStepper
          steps={['Workflow details', 'Build journey']}
          activeStep={activeStep}
          stepStates={activeStep === 1 ? ['completed', 'active'] : ['active', 'pending']}
          ariaLabel="Workflow setup steps"
        />
      )}
    </Paper>
  );
}
