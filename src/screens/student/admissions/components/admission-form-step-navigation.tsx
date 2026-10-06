import type { ReactNode } from 'react';

import { Box, Step, Stack, Stepper, StepLabel, StepButton } from '@mui/material';

type Props = {
  steps: { id: string; name: string; caption?: ReactNode }[];
  activeStep: number;
  onStepChange?: (index: number) => void;
  completedSteps?: readonly number[];
  stepErrors?: readonly boolean[];
  disabled?: boolean;
  children?: ReactNode;
};

export function AdmissionFormStepNavigation({
  steps,
  activeStep,
  onStepChange,
  completedSteps = [],
  stepErrors = [],
  disabled = false,
  children,
}: Props) {
  const renderSteps = () =>
    steps.map((step, index) => (
      <Step
        key={step.id}
        completed={completedSteps.includes(index)}
        aria-current={index === activeStep ? 'step' : undefined}
      >
        {onStepChange ? (
          <StepButton
            type="button"
            disabled={disabled}
            onClick={() => onStepChange(index)}
            sx={{ textAlign: 'left', minHeight: 44, py: 1 }}
          >
            <StepLabel error={stepErrors[index]} optional={step.caption}>
              {step.name}
            </StepLabel>
          </StepButton>
        ) : (
          <StepLabel error={stepErrors[index]} optional={step.caption}>
            {step.name}
          </StepLabel>
        )}
      </Step>
    ));

  return (
    <Stack component="nav" aria-label="Form steps" spacing={1.5} sx={{ minWidth: 0 }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          nonLinear
          sx={{
            '& .MuiStepConnector-line': { minHeight: 24 },
            '& .MuiStepLabel-label': { typography: 'subtitle2', overflowWrap: 'anywhere' },
          }}
        >
          {renderSteps()}
        </Stepper>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' }, overflowX: 'auto', pb: 1 }}>
        <Stepper activeStep={activeStep} nonLinear sx={{ width: 'max-content', minWidth: 1 }}>
          {renderSteps()}
        </Stepper>
      </Box>
      {children}
    </Stack>
  );
}
