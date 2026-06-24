export type RunPayrollIssueLabel = {
  label: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  color: 'warning' | 'error' | 'info';
};

export const ISSUE_LABELS: Record<string, RunPayrollIssueLabel> = {
  MISSING_SALARY_STRUCTURE: {
    label: 'Salary structure missing',
    severity: 'CRITICAL',
    color: 'error',
  },
  NO_ATTENDANCE: { label: 'No attendance', severity: 'CRITICAL', color: 'error' },
  LOW_ATTENDANCE: { label: 'Low attendance', severity: 'WARNING', color: 'warning' },
  NEGATIVE_NET_PAY: { label: 'Negative net pay', severity: 'CRITICAL', color: 'error' },
  NO_PREVIOUS_MONTH_COMPARISON: { label: 'No previous month', severity: 'INFO', color: 'info' },
  LARGE_SALARY_VARIANCE: { label: 'Large variance', severity: 'WARNING', color: 'warning' },
  ATTENDANCE_POLICY_EFFECTIVE_BOUNDARY: {
    label: 'Attendance policy boundary warning',
    severity: 'INFO',
    color: 'info',
  },
  ATTENDANCE_SALARY_DEDUCTION_CONFIGURATION: {
    label: 'Late deduction setup missing',
    severity: 'CRITICAL',
    color: 'error',
  },
  PAYROLL_POLICY_CONFIGURATION: {
    label: 'Payroll policy needs setup',
    severity: 'CRITICAL',
    color: 'error',
  },
};
