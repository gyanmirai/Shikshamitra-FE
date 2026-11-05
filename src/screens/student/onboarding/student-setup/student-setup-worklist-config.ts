import type { StudentOnboardingStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import { onboardingStageMeta } from './student-onboarding-model';
import { getStudentSetupStatusDisplayLabel } from './student-setup-summary';

export const studentSetupStatusOptions: Array<{
  status: StudentOnboardingStatus;
  label: string;
  setupLabel: string;
}> = [
  {
    status: 0,
    label: onboardingStageMeta['to-prepare'].label,
    setupLabel: getStudentSetupStatusDisplayLabel('to-prepare'),
  },
  {
    status: 1,
    label: onboardingStageMeta['awaiting-approval'].label,
    setupLabel: getStudentSetupStatusDisplayLabel('awaiting-approval'),
  },
  {
    status: 2,
    label: onboardingStageMeta['ready-to-activate'].label,
    setupLabel: getStudentSetupStatusDisplayLabel('ready-to-activate'),
  },
  {
    status: 3,
    label: onboardingStageMeta['action-required'].label,
    setupLabel: getStudentSetupStatusDisplayLabel('action-required'),
  },
  {
    status: 4,
    label: onboardingStageMeta.completed.label,
    setupLabel: getStudentSetupStatusDisplayLabel('completed'),
  },
  {
    status: 5,
    label: onboardingStageMeta.cancelled.label,
    setupLabel: getStudentSetupStatusDisplayLabel('cancelled'),
  },
  {
    status: 6,
    label: onboardingStageMeta.provisioning.label,
    setupLabel: getStudentSetupStatusDisplayLabel('provisioning'),
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
