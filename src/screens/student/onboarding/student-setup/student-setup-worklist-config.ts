import type { StudentOnboardingStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import { onboardingStageMeta } from './student-onboarding-model';

export const studentSetupStatusOptions: Array<{ status: StudentOnboardingStatus; label: string }> =
  [
    { status: 0, label: onboardingStageMeta['to-prepare'].label },
    { status: 1, label: onboardingStageMeta['awaiting-approval'].label },
    { status: 2, label: onboardingStageMeta['ready-to-activate'].label },
    { status: 3, label: onboardingStageMeta['action-required'].label },
    { status: 4, label: onboardingStageMeta.completed.label },
    { status: 5, label: onboardingStageMeta.cancelled.label },
    { status: 6, label: onboardingStageMeta.provisioning.label },
  ];

export const studentSetupSortFields: Record<string, string> = {
  studentName: 'StudentName',
  placement: 'Placement',
  divisionTask: 'Placement',
  rollNumberTask: 'RollNumber',
  ownerName: 'OwnerName',
  statusLabel: 'Status',
};
