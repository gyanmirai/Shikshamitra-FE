import type { SetupFlowStepState } from 'src/components/setup-flow';

import SetupFlowSidebar from 'src/components/setup-flow/setup-flow-sidebar';

import { setupSteps } from '../services/setup-model';

export const initialSetupSteps = setupSteps.map(({ title }) => ({ key: title, title }));

export function initialSetupStepStates(furthest: number, pendingSteps: number[] = []) {
  const states: Record<string, SetupFlowStepState> = {};
  initialSetupSteps.forEach(({ key }, index) => {
    if (pendingSteps.includes(index)) states[key] = 'pending';
    else if (index < furthest) states[key] = 'complete';
  });
  return states;
}

export default function SetupSidebar({
  step,
  furthest,
  schoolCode,
  disabled,
  onStep,
  pendingSteps = [],
}: {
  step: number;
  furthest: number;
  schoolCode: string;
  disabled: boolean;
  onStep: (index: number) => void;
  pendingSteps?: number[];
}) {
  return (
    <SetupFlowSidebar
      steps={initialSetupSteps}
      activeStep={step}
      furthestStep={furthest}
      schoolCode={schoolCode}
      disabled={disabled}
      onStep={onStep}
      stepStates={initialSetupStepStates(furthest, pendingSteps)}
      sidebarTitle="INSTITUTE SETUP"
      contextLabel="Your progress is saved to your institute. You can return and continue later."
    />
  );
}
