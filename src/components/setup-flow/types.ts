import type { ReactNode } from 'react';

export type SetupFlowStep = { key: string; title: string };
export type SetupFlowStepState = 'complete' | 'pending' | 'deferred';

export type SetupFlowShellProps = {
  steps: readonly SetupFlowStep[];
  activeStep: number;
  furthestStep: number;
  stepStates?: Readonly<Record<string, SetupFlowStepState>>;
  disabled: boolean;
  onStep: (index: number) => void;
  schoolCode: string;
  sidebarTitle: string;
  headerLabel: string;
  contextLabel?: string;
  navigationLabel?: string;
  children: ReactNode;
  footer: ReactNode;
  heightMode?: 'viewport' | 'container';
};
