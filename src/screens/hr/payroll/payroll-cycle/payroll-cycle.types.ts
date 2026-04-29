export type PayrollCycleStepId = 'run_payroll' | 'payslips';

export type PayrollProcessIssueKind =
  | 'attendance_gap'
  | 'salary_structure'
  | 'statutory_tax'
  | 'negative_net'
  | 'other';

export type PayrollCycleStep = {
  id: PayrollCycleStepId;
  order: number;
  label: string;
  shortLabel: string;
  path: string;
  description: string;
};
