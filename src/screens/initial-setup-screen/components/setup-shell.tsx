import type { ReactNode } from 'react';

import { SetupFlowShell } from 'src/components/setup-flow';

import { initialSetupSteps, initialSetupStepStates } from './setup-sidebar';

export default function SetupShell({
  step,
  furthest,
  schoolCode,
  disabled,
  onStep,
  pendingSteps,
  children,
  footer,
}: {
  step: number;
  furthest: number;
  schoolCode: string;
  disabled: boolean;
  onStep: (index: number) => void;
  pendingSteps?: number[];
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <SetupFlowShell
      steps={initialSetupSteps}
      activeStep={step}
      furthestStep={furthest}
      stepStates={initialSetupStepStates(furthest, pendingSteps)}
      schoolCode={schoolCode}
      disabled={disabled}
      onStep={onStep}
      sidebarTitle="INSTITUTE SETUP"
      headerLabel="Initial setup"
      contextLabel="Your progress is saved to your institute. You can return and continue later."
      footer={footer}
    >
      {children}
    </SetupFlowShell>
  );
}
