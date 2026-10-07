import type { ReactNode } from 'react';

import { useRef, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import { Step, Stack, Stepper, StepLabel, StepButton } from '@mui/material';

type Props = {
  steps: { id: string; name: string; caption?: ReactNode }[];
  activeStep: number;
  onStepChange?: (index: number) => void;
  completedSteps?: readonly number[];
  stepErrors?: readonly boolean[];
  disabled?: boolean;
  children?: ReactNode;
  renderStepLabel?: (index: number) => ReactNode;
};

export function AdmissionFormStepNavigation({
  steps,
  activeStep,
  onStepChange,
  completedSteps = [],
  stepErrors = [],
  disabled = false,
  children,
  renderStepLabel,
}: Props) {
  const vertical = useResponsive('up', 'md');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = scrollRef.current;
    if (vertical || !container) return undefined;
    const revealActiveStep = () => {
      if (container.clientWidth)
        container
          .querySelector<HTMLElement>('[aria-current="step"]')
          ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    };
    revealActiveStep();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(revealActiveStep);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeStep, vertical]);
  const renderSteps = () =>
    steps.map((step, index) => (
      <Step
        key={step.id}
        completed={completedSteps.includes(index)}
        aria-current={index === activeStep ? 'step' : undefined}
      >
        {renderStepLabel ? (
          <StepLabel
            error={stepErrors[index]}
            sx={{ '& .MuiStepLabel-labelContainer': { minWidth: 0 } }}
          >
            {renderStepLabel(index)}
          </StepLabel>
        ) : onStepChange ? (
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

  const stepper = (
    <Stepper
      activeStep={activeStep}
      orientation={vertical ? 'vertical' : 'horizontal'}
      nonLinear
      sx={{
        width: vertical ? 1 : 'max-content',
        minWidth: 1,
        '& .MuiStepConnector-line': { minHeight: 24 },
        '& .MuiStepLabel-label': { typography: 'subtitle2', overflowWrap: 'anywhere' },
      }}
    >
      {renderSteps()}
    </Stepper>
  );
  return (
    <Stack component="nav" aria-label="Form steps" spacing={1.5} sx={{ minWidth: 0 }}>
      {vertical ? (
        stepper
      ) : (
        <Scrollbar ref={scrollRef} sx={{ flexGrow: 0, pb: 1 }}>
          {stepper}
        </Scrollbar>
      )}
      {children}
    </Stack>
  );
}
