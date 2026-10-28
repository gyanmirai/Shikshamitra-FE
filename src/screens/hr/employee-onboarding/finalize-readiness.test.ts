import { it, expect, describe } from 'vitest';

import { finalizeIssues } from './finalize-readiness';
import { schemaFieldErrors } from '../components/form-validation';
import { statutoryProfileSchema } from '../employee/statutory-profile-fields';

const ready = {
  workAssignmentValid: true,
  workAssignmentConfirmed: true,
  staffErrors: {},
  canManageSalary: true,
  canManageEnrollment: true,
  statutoryErrors: {},
  salaryIssues: [],
  hasSalary: true,
  salaryMonthCurrent: true,
};

describe('finalize readiness', () => {
  it('has no blockers only when all prerequisites and the current salary are valid', () => {
    expect(finalizeIssues(ready)).toEqual([]);
  });

  it.each([
    [{ workAssignmentValid: false }, 'assignment', 0],
    [{ workAssignmentConfirmed: false }, 'assignment-confirmation', 0],
    [{ staffErrors: { panNo: 'PAN is invalid' } }, 'panNo', 1],
    [{ roleError: 'Roles could not be loaded. Try again.' }, 'roleId', 1],
    [{ academicError: 'Select an academic organization.' }, 'academic', 2],
    [{ canManageSalary: false }, 'salary-permission', 3],
    [{ canManageEnrollment: false }, 'enrollment-permission', 3],
    [{ hasSalary: false }, 'salary-preview', 3],
    [{ salaryMonthCurrent: false }, 'salary-month', 3],
  ] as const)('explains the %s gate with its correction step', (change, key, step) => {
    expect(finalizeIssues({ ...ready, ...change })).toContainEqual(
      expect.objectContaining({ key, step })
    );
  });

  it('preserves mandatory off reasons and reports exact fields without requiring registration numbers', () => {
    const off = { applyPf: false, applyEsic: false, pfDisabledReason: ' ', esicDisabledReason: '' };
    const statutoryErrors = schemaFieldErrors(statutoryProfileSchema, off);
    expect(statutoryErrors).toEqual({
      pfDisabledReason: 'Enter a reason for turning PF off.',
      esicDisabledReason: 'Enter a reason for turning ESIC off.',
    });
    const issues = finalizeIssues({ ...ready, hasSalary: false, statutoryErrors });
    expect(issues.map(({ field }) => field)).toEqual(['pfDisabledReason', 'esicDisabledReason']);
    expect(
      schemaFieldErrors(statutoryProfileSchema, {
        ...off,
        pfDisabledReason: 'Not enrolled',
        esicDisabledReason: 'Not enrolled',
      })
    ).toEqual({});
    expect(
      schemaFieldErrors(statutoryProfileSchema, {
        applyPf: true,
        applyEsic: true,
        pfNumber: '',
        uanNumber: '',
        esicInsuranceNumber: '',
      })
    ).toEqual({});
  });

  it('retains specific salary blockers instead of hiding them behind a missing-preview message', () => {
    const salaryIssues = [
      {
        key: 'esi-policy',
        message: 'Choose an effective ESIC policy.',
        selector: '[data-salary-statutory]',
      },
    ];
    expect(finalizeIssues({ ...ready, hasSalary: false, salaryIssues })).toEqual([
      { ...salaryIssues[0], step: 3 },
    ]);
  });

  it('shows lookup errors once when a role is also missing', () => {
    expect(
      finalizeIssues({
        ...ready,
        staffErrors: { roleId: 'Role is required' },
        roleError: 'Retry roles',
      })
    ).toEqual([{ key: 'roleId', step: 1, field: 'roleId', message: 'Retry roles' }]);
  });
});
