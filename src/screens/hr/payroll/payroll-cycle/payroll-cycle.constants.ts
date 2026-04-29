import type { PayrollCycleStep } from './payroll-cycle.types';

export const PAYROLL_CYCLE_STEPS: PayrollCycleStep[] = [
  {
    id: 'run_payroll',
    order: 1,
    label: 'Run payroll',
    shortLabel: 'Run',
    path: '/hr/payroll/run-payroll',
    description: 'Generate, review, and lock monthly payroll.',
  },
  {
    id: 'payslips',
    order: 2,
    label: 'Payslips',
    shortLabel: 'Payslips',
    path: '/hr/payroll/payslip-generation',
    description: 'Generate and distribute payslips after locking payroll.',
  },
];
