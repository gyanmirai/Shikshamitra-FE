import type { StudentOnboardingStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import { onboardingStageMeta } from './student-onboarding-model';
import { studentSetupStatusMeta } from './student-setup-summary';

export const studentSetupStatusOptions: Array<{
  status: StudentOnboardingStatus;
  label: string;
  setupLabel: string;
}> = [
  {
    status: 0,
    label: onboardingStageMeta['to-prepare'].label,
    setupLabel: studentSetupStatusMeta['to-prepare'].label,
  },
  {
    status: 1,
    label: onboardingStageMeta['awaiting-approval'].label,
    setupLabel: studentSetupStatusMeta['awaiting-approval'].label,
  },
  {
    status: 2,
    label: onboardingStageMeta['ready-to-activate'].label,
    setupLabel: studentSetupStatusMeta['ready-to-activate'].label,
  },
  {
    status: 3,
    label: onboardingStageMeta['action-required'].label,
    setupLabel: studentSetupStatusMeta['action-required'].label,
  },
  {
    status: 4,
    label: onboardingStageMeta.completed.label,
    setupLabel: studentSetupStatusMeta.completed.label,
  },
  {
    status: 5,
    label: onboardingStageMeta.cancelled.label,
    setupLabel: studentSetupStatusMeta.cancelled.label,
  },
  {
    status: 6,
    label: onboardingStageMeta.provisioning.label,
    setupLabel: studentSetupStatusMeta.provisioning.label,
  },
];

export const studentSetupSortFields: Record<string, string> = {
  studentName: 'StudentName',
  placement: 'Placement',
  divisionTask: 'Placement',
  rollNumberTask: 'RollNumber',
  ownerName: 'OwnerName',
  statusLabel: 'Status',
};
