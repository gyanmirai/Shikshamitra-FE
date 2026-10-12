export const PAYROLL_ISSUE_LABELS: Record<
  string,
  { label: string; severity: 'CRITICAL' | 'WARNING' | 'INFO'; color: 'warning' | 'error' | 'info' }
> = {
  PF_MEMBERSHIP_REVIEW_REQUIRED: {
    label: 'Review school PF coverage and previous membership',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_ENROLLMENT_REQUIRED: {
    label: 'Mandatory or continuing PF enrollment required',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_CONSENT_REQUIRED: {
    label: 'Employee consent required for voluntary PF',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_ESTABLISHMENT_NOT_COVERED: {
    label: 'PF enrollment conflicts with school coverage',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_BASIC_COMPONENT_REQUIRED: {
    label: 'Review the selected ESIC Basic component',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_RATE_OVERRIDE: {
    label: 'Administrator ESIC rate override. Review the documented reason and evidence.',
    severity: 'WARNING',
    color: 'warning',
  },
  PF_WAGE_BASIS_REQUIRED: {
    label: 'PF wage basis required. Update the salary structure to match the assigned PF rule.',
    severity: 'CRITICAL',
    color: 'error',
  },
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
  PAYROLL_POLICY_CONFIGURATION: {
    label: 'Payroll policy needs setup',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_ESTABLISHMENT_INACTIVE: {
    label: 'ESI establishment setup is inactive',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_WAGE_CLASSIFICATION_REQUIRED: {
    label: 'ESI wage classification required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_ENROLLMENT_REVIEW_REQUIRED: {
    label: 'ESI enrollment review required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_INSURANCE_NUMBER_REQUIRED: {
    label: 'ESI insurance number required',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_PWD_RELIEF_EVIDENCE_REQUIRED: {
    label: 'PwD employer-share relief evidence needs review',
    severity: 'WARNING',
    color: 'warning',
  },
  COMPENSATION_REVISION_REQUIRED: {
    label: 'Effective salary setup required',
    severity: 'CRITICAL',
    color: 'error',
  },
  COMPENSATION_TARGET_VARIANCE: {
    label: 'Resolve the protected budget difference in compensation configuration',
    severity: 'CRITICAL',
    color: 'error',
  },
};
