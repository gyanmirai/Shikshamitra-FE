export const PAYROLL_ISSUE_LABELS: Record<
  string,
  {
    label: string;
    guidance?: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    color: 'warning' | 'error' | 'info';
  }
> = {
  PF_APPLY_DISABLED: {
    label: 'PF turned off. No employee or employer contribution will apply.',
    severity: 'WARNING',
    color: 'warning',
  },
  PF_NUMBER_MISSING: {
    label: 'PF number missing. Contributions apply when eligible. Add the number when available.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_APPLY_DISABLED: {
    label: 'ESIC turned off. No employee or employer contribution will apply.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_NUMBER_MISSING: {
    label:
      'ESIC insurance number missing. Contributions apply when eligible. Add the number when available.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_BASIS_RECONCILIATION_DIFFERENCE: {
    label: 'Selected ESIC basis differs from the statutory wage assessment. Review the evidence.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_STATUTORY_ASSESSMENT_UNAVAILABLE: {
    label: 'Statutory wage assessment unavailable. Review earning classifications.',
    severity: 'WARNING',
    color: 'warning',
  },
  STATUTORY_APPLICATION_COST_VARIANCE: {
    label: 'Enrollment changes explain the CTC difference. Saved gross salary has been preserved.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_COMPONENT_REQUIRED: {
    label: 'The selected ESIC salary component is missing or inactive.',
    guidance: 'Select an active salary component in ESIC settings.',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_MEMBERSHIP_REVIEW_REQUIRED: {
    label: 'Review school PF coverage and previous membership',
    guidance: 'Confirm school PF coverage and the affected staff member’s previous membership.',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_ENROLLMENT_REQUIRED: {
    label: 'Mandatory or continuing PF enrollment required',
    guidance: 'Review PF enrollment in the affected staff member’s payroll details.',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_CONSENT_REQUIRED: {
    label: 'Employee consent required for voluntary PF',
    guidance: 'Record the staff member’s consent reference before applying voluntary PF.',
    severity: 'CRITICAL',
    color: 'error',
  },
  PF_ESTABLISHMENT_NOT_COVERED: {
    label: 'PF enrollment conflicts with school coverage',
    guidance: 'Review school PF coverage and the affected staff member’s enrollment together.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_BASIC_COMPONENT_REQUIRED: {
    label: 'Review the selected ESIC Basic component',
    guidance: 'Select the correct Basic earning component in ESIC settings.',
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
    guidance: 'Open salary setup for the affected staff, then recalculate payroll.',
    severity: 'CRITICAL',
    color: 'error',
  },
  MISSING_SALARY_STRUCTURE: {
    label: 'Salary structure missing',
    guidance: 'Complete salary setup for the affected staff for this month.',
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
    guidance: 'Review payroll policies and staff assignments for the selected academic year.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_ESTABLISHMENT_INACTIVE: {
    label: 'ESI establishment setup is inactive',
    guidance: 'Review the school establishment setup in statutory settings.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_WAGE_CLASSIFICATION_REQUIRED: {
    label: 'ESI wage classification required',
    guidance: 'Review how earning components count toward ESIC wages in statutory settings.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_ENROLLMENT_REVIEW_REQUIRED: {
    label: 'ESI enrollment review required',
    guidance: 'Review ESIC enrollment for the affected staff in statutory settings.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ESI_INSURANCE_NUMBER_REQUIRED: {
    label:
      'ESIC registration pending. Contributions apply when eligible. Add the insurance number when available.',
    severity: 'WARNING',
    color: 'warning',
  },
  ESI_PWD_RELIEF_EVIDENCE_REQUIRED: {
    label: 'PwD employer-share relief evidence needs review',
    severity: 'WARNING',
    color: 'warning',
  },
  COMPENSATION_REVISION_REQUIRED: {
    label: 'Effective salary setup required',
    guidance: 'Save a salary revision that applies to the selected payroll month.',
    severity: 'CRITICAL',
    color: 'error',
  },
  COMPENSATION_TARGET_VARIANCE: {
    label: 'Resolve the protected budget difference in compensation configuration',
    guidance: 'Review the salary preview and resolve the difference before saving the revision.',
    severity: 'CRITICAL',
    color: 'error',
  },
  ATTENDANCE_SALARY_DEDUCTION_CONFIGURATION: {
    label: 'Attendance deduction setup needs attention',
    guidance: 'Review the salary deduction rule in the assigned attendance policy.',
    severity: 'CRITICAL',
    color: 'error',
  },
  NO_WORKING_DAYS: {
    label: 'No working days configured',
    guidance: 'Review the work calendar and payroll basis for the selected month.',
    severity: 'CRITICAL',
    color: 'error',
  },
};
