import type {
  StudentOnboardingStatus,
  StudentOnboardingStepStatus,
} from 'src/redux/student/admissions/student-onboarding-api';

export const ONBOARDING_STATUS_LABELS: Record<StudentOnboardingStatus, string> = {
  0: 'Pending',
  1: 'In progress',
  2: 'Ready for activation',
  3: 'Needs attention',
  4: 'Completed',
  5: 'Cancelled',
};

export const ONBOARDING_STEP_STATUS_LABELS: Record<StudentOnboardingStepStatus, string> = {
  0: 'Pending',
  1: 'In progress',
  2: 'Completed',
  3: 'Blocked',
  4: 'Waived',
  5: 'Not required',
};

export const getOnboardingStatusLabel = (status: number): string =>
  ONBOARDING_STATUS_LABELS[status as StudentOnboardingStatus] ?? 'Unknown';

export const getOnboardingStatusColor = (status: StudentOnboardingStatus) => {
  if (status === 2 || status === 4) return 'success' as const;
  if (status === 3) return 'error' as const;
  if (status === 1) return 'info' as const;
  if (status === 0) return 'warning' as const;
  return 'default' as const;
};

export const isOnboardingStepSatisfied = (status: StudentOnboardingStepStatus): boolean =>
  status === 2 || status === 4 || status === 5;
