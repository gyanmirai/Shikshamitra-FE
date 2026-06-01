import { hrPaths } from 'src/constants/hr-menus';

import type { PayrollCycleStep } from './payroll-cycle.types';

export const PAYROLL_CYCLE_STEPS: PayrollCycleStep[] = [
  {
    id: 'run_payroll',
    order: 1,
    label: 'Run payroll',
    shortLabel: 'Run',
    path: hrPaths.payroll.runPayroll,
    description: 'Generate, review, and lock monthly payroll.',
  },
  {
    id: 'payslips',
    order: 2,
    label: 'Payslips',
    shortLabel: 'Payslips',
    path: hrPaths.payroll.payslipGeneration,
    description: 'Generate and distribute payslips after locking payroll.',
  },
];
