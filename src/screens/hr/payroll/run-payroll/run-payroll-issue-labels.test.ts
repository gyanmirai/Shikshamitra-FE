import { it, expect, describe } from 'vitest';

import { ISSUE_LABELS } from './run-payroll-issue-labels';

describe('run payroll issue labels', () => {
  it('marks late arrival salary deduction setup gaps as critical', () => {
    expect(ISSUE_LABELS.ATTENDANCE_SALARY_DEDUCTION_CONFIGURATION).toMatchObject({
      label: 'Late deduction setup missing',
      severity: 'CRITICAL',
      color: 'error',
    });
  });
});
