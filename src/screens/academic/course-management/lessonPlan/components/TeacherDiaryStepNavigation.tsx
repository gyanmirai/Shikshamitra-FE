import { Box, Step, Stepper, StepButton } from '@mui/material';

export type TeacherDiaryStep = 'Teaching' | 'Reflection' | 'Evidence';

const STEPS: TeacherDiaryStep[] = ['Teaching', 'Reflection', 'Evidence'];

type Props = {
  activeStep: TeacherDiaryStep;
  completedSteps: Record<TeacherDiaryStep, boolean>;
  onChange: (step: TeacherDiaryStep) => void;
  disabled?: boolean;
};

export function TeacherDiaryStepNavigation({
  activeStep,
  completedSteps,
  onChange,
  disabled = false,
}: Props) {
  return (
    <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stepper
        nonLinear
        activeStep={STEPS.indexOf(activeStep)}
        role="tablist"
        aria-label="Teacher diary steps"
        sx={{
          '& .MuiStep-root': { px: { xs: 0.5, sm: 1 } },
          '& .MuiStepButton-root': { minHeight: 44 },
          '& .MuiStepLabel-iconContainer': { pr: { xs: 0.5, sm: 1 } },
          '& .MuiStepLabel-label': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
          '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
        }}
      >
        {STEPS.map((step) => (
          <Step key={step} completed={completedSteps[step]}>
            <StepButton
              role="tab"
              id={`diary-step-${step}`}
              aria-controls={`diary-panel-${step}`}
              aria-selected={activeStep === step}
              disabled={disabled}
              onClick={() => onChange(step)}
            >
              {step}
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
