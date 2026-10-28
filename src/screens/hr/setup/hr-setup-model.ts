import type { HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { hrSetupSteps } from 'src/constants/hr-setup';

export function firstIncompleteSetupStep(readiness: HrSetupReadiness) {
  const index = hrSetupSteps.findIndex((step) =>
    readiness.checks.some((check) => check.step === step.id && check.state !== 'ready')
  );
  return index < 0 ? hrSetupSteps.length - 1 : index;
}

export function setupStepComplete(readiness: HrSetupReadiness, index: number) {
  const step = hrSetupSteps[index];
  if (step.id === 'completion') return readiness.isReady;
  const checks = readiness.checks.filter((check) => check.step === step.id);
  return checks.length > 0 && checks.every((check) => check.state === 'ready');
}

export function setupTaskForCheck(readiness: HrSetupReadiness, code: string) {
  if (
    ['payroll-policy', 'attendance-policy'].includes(code) &&
    readiness.checks.some((check) => check.code === 'calendar' && check.state !== 'ready')
  )
    return 'calendar';
  return code;
}

export const setupCheckLabels: Record<string, string> = {
  'academic-year': 'Academic Year',
  shift: 'Staff Shift',
  'teaching-role': 'Teaching Staff Role',
  'non-teaching-role': 'Non Teaching Staff Role',
  calendar: 'Work Calendar',
  'attendance-policy': 'Default Attendance Policy',
  'leave-policy': 'Default Leave Policy',
  'payroll-policy': 'Default Payroll Policy',
  earnings: 'Earning Components',
  'salary-template': 'Salary Template',
  deductions: 'Deduction Components',
  pf: 'PF Rule',
  esi: 'ESIC Policy',
  'professional-tax': 'Professional Tax',
};
