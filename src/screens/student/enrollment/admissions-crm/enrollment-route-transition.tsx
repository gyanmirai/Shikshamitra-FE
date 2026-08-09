import type { ReactNode } from 'react';

import { ViewTransition, addTransitionType, startTransition } from 'react';

export type EnrollmentNavigationDirection = 'nav-forward' | 'nav-back';

type Props = {
  children: ReactNode;
};

export function runEnrollmentNavigation(
  direction: EnrollmentNavigationDirection,
  navigate: () => void
) {
  startTransition(() => {
    addTransitionType(direction);
    navigate();
  });
}

export function EnrollmentRouteTransition({ children }: Props) {
  return (
    <ViewTransition
      enter={{
        'nav-forward': 'enrollment-nav-forward',
        'nav-back': 'enrollment-nav-back',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'enrollment-nav-forward',
        'nav-back': 'enrollment-nav-back',
        default: 'none',
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}

export function ApplicantTitleTransition({ leadId, children }: Props & { leadId: string }) {
  return (
    <ViewTransition
      name={`enrollment-applicant-title-${leadId}`}
      share="enrollment-text-morph"
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
