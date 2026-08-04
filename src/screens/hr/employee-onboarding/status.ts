export enum EmployeeApplicationStatus {
  InvitationSent = 0,
  Applied = 1,
  Screening = 2,
  Interviewing = 3,
  Offered = 4,
  ReadyForOnboarding = 5,
  Finalized = 6,
  Rejected = 7,
  Withdrawn = 8,
}

export const EMPLOYEE_APPLICATION_STATUSES = [
  EmployeeApplicationStatus.InvitationSent,
  EmployeeApplicationStatus.Applied,
  EmployeeApplicationStatus.Screening,
  EmployeeApplicationStatus.Interviewing,
  EmployeeApplicationStatus.Offered,
  EmployeeApplicationStatus.ReadyForOnboarding,
  EmployeeApplicationStatus.Finalized,
  EmployeeApplicationStatus.Rejected,
  EmployeeApplicationStatus.Withdrawn,
] as const;

export const employeeApplicationStatusLabels: Record<EmployeeApplicationStatus, string> = {
  [EmployeeApplicationStatus.InvitationSent]: 'Invitation sent',
  [EmployeeApplicationStatus.Applied]: 'Applied',
  [EmployeeApplicationStatus.Screening]: 'Screening',
  [EmployeeApplicationStatus.Interviewing]: 'Interviewing',
  [EmployeeApplicationStatus.Offered]: 'Offered',
  [EmployeeApplicationStatus.ReadyForOnboarding]: 'Ready for onboarding',
  [EmployeeApplicationStatus.Finalized]: 'Finalized',
  [EmployeeApplicationStatus.Rejected]: 'Rejected',
  [EmployeeApplicationStatus.Withdrawn]: 'Withdrawn',
};

export const employeeApplicationStatusColors: Record<
  EmployeeApplicationStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [EmployeeApplicationStatus.InvitationSent]: 'default',
  [EmployeeApplicationStatus.Applied]: 'info',
  [EmployeeApplicationStatus.Screening]: 'primary',
  [EmployeeApplicationStatus.Interviewing]: 'secondary',
  [EmployeeApplicationStatus.Offered]: 'warning',
  [EmployeeApplicationStatus.ReadyForOnboarding]: 'success',
  [EmployeeApplicationStatus.Finalized]: 'success',
  [EmployeeApplicationStatus.Rejected]: 'error',
  [EmployeeApplicationStatus.Withdrawn]: 'default',
};

export const normalizeEmployeeApplicationStatus = (
  value: EmployeeApplicationStatus | keyof typeof EmployeeApplicationStatus | string | number
): EmployeeApplicationStatus => {
  if (typeof value === 'number') {
    return value as EmployeeApplicationStatus;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric as EmployeeApplicationStatus;
  }

  return EmployeeApplicationStatus[value as keyof typeof EmployeeApplicationStatus];
};

export const getEmployeeApplicationStatusLabel = (
  value: EmployeeApplicationStatus | string | number
) => employeeApplicationStatusLabels[normalizeEmployeeApplicationStatus(value)] ?? String(value);

export const getEmployeeApplicationStatusColor = (
  value: EmployeeApplicationStatus | string | number
) => employeeApplicationStatusColors[normalizeEmployeeApplicationStatus(value)] ?? 'default';

export const canFinalizeEmployeeApplication = (
  value: EmployeeApplicationStatus | string | number
) =>
  ![
    EmployeeApplicationStatus.InvitationSent,
    EmployeeApplicationStatus.Finalized,
    EmployeeApplicationStatus.Rejected,
    EmployeeApplicationStatus.Withdrawn,
  ].includes(normalizeEmployeeApplicationStatus(value));

export const isEmployeeApplicationTerminal = (value: EmployeeApplicationStatus | string | number) =>
  [
    EmployeeApplicationStatus.Finalized,
    EmployeeApplicationStatus.Rejected,
    EmployeeApplicationStatus.Withdrawn,
  ].includes(normalizeEmployeeApplicationStatus(value));

export const canRegenerateEmployeeApplicationLink = (
  value: EmployeeApplicationStatus | string | number
) => normalizeEmployeeApplicationStatus(value) === EmployeeApplicationStatus.InvitationSent;

export const canCopyEmployeeApplicationLink = (
  value: EmployeeApplicationStatus | string | number
) => normalizeEmployeeApplicationStatus(value) !== EmployeeApplicationStatus.Finalized;

// Returns statuses that are valid targets from `currentStatus`.
// Rules:
//   - Forward transitions only (no going backward in the workflow)
//   - Finalized is excluded (reached via the Finalize button, not the status dropdown)
//   - Rejected and Withdrawn are always reachable from any non-terminal active state
// The current status itself is always included so the Select can render the selected value.
export const getValidNextStatuses = (
  currentStatus: EmployeeApplicationStatus
): EmployeeApplicationStatus[] => {
  if (isEmployeeApplicationTerminal(currentStatus)) {
    return [currentStatus];
  }

  if (currentStatus === EmployeeApplicationStatus.InvitationSent) {
    return [
      EmployeeApplicationStatus.InvitationSent,
      EmployeeApplicationStatus.Rejected,
      EmployeeApplicationStatus.Withdrawn,
    ];
  }

  return EMPLOYEE_APPLICATION_STATUSES.filter(
    (status) => status !== EmployeeApplicationStatus.Finalized && status >= currentStatus
  );
};
