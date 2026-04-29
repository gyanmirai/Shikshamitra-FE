import { PAYROLL_CYCLE_STEPS } from './payroll-cycle.constants';

export const payrollHomePath = '/hr/payroll';

export function payrollCyclePathToStepIndex(pathname: string): number {
  const normalized = pathname.replace(/\/$/, '');
  for (let i = 0; i < PAYROLL_CYCLE_STEPS.length; i += 1) {
    const step = PAYROLL_CYCLE_STEPS[i];
    if (step && normalized === step.path.replace(/\/$/, '')) {
      return i;
    }
  }
  if (normalized === payrollHomePath || normalized.includes('/hr/payroll/setting/')) {
    return -1;
  }
  return -1;
}
