export type FinalizeIssue = {
  key: string;
  message: string;
  step: number;
  field?: string;
  selector?: string;
};

export function finalizeIssues({
  workAssignmentValid,
  workAssignmentConfirmed,
  staffErrors,
  roleError,
  academicError,
  canManageSalary,
  canManageEnrollment,
  statutoryErrors,
  salaryIssues,
  hasSalary,
  salaryMonthCurrent,
}: {
  workAssignmentValid: boolean;
  workAssignmentConfirmed: boolean;
  staffErrors: Record<string, string>;
  roleError?: string;
  academicError?: string;
  canManageSalary: boolean;
  canManageEnrollment: boolean;
  statutoryErrors: Record<string, string>;
  salaryIssues: Omit<FinalizeIssue, 'step'>[];
  hasSalary: boolean;
  salaryMonthCurrent: boolean;
}): FinalizeIssue[] {
  const issues: FinalizeIssue[] = [];
  if (!workAssignmentValid)
    issues.push({
      key: 'assignment',
      step: 0,
      message: 'Review the work assignment and resolve its organization requirements.',
      selector: '[data-work-assignment]',
    });
  if (!workAssignmentConfirmed)
    issues.push({
      key: 'assignment-confirmation',
      step: 0,
      message: 'Confirm the organization / work assignment.',
      selector: '[data-work-assignment] input[type="checkbox"]',
    });
  Object.entries(staffErrors).forEach(([field, message]) => {
    if (field !== 'roleId' || !roleError) issues.push({ key: field, step: 1, field, message });
  });
  if (roleError) issues.push({ key: 'roleId', step: 1, field: 'roleId', message: roleError });
  if (academicError) issues.push({ key: 'academic', step: 2, message: academicError });
  if (!canManageSalary)
    issues.push({
      key: 'salary-permission',
      step: 3,
      message: 'Salary management permission is required. Ask an authorized HR user to finalize.',
    });
  if (!canManageEnrollment)
    issues.push({
      key: 'enrollment-permission',
      step: 3,
      message:
        'Statutory enrollment permission is required. Ask an authorized HR user to finalize.',
    });
  Object.entries(statutoryErrors).forEach(([field, message]) =>
    issues.push({ key: field, step: 3, field, message })
  );
  if (canManageSalary && canManageEnrollment) {
    issues.push(...salaryIssues.map((issue) => ({ ...issue, step: 3 })));
    if (!hasSalary && !salaryIssues.length && !Object.keys(statutoryErrors).length)
      issues.push({
        key: 'salary-preview',
        step: 3,
        message: 'Prepare a valid salary preview before finalizing.',
        selector: '[data-onboarding-salary]',
      });
    if (hasSalary && !salaryMonthCurrent)
      issues.push({
        key: 'salary-month',
        step: 3,
        message:
          'The salary preview month no longer matches the joining date. Refresh the salary preview.',
        selector: '[data-onboarding-salary]',
      });
  }
  return issues;
}
