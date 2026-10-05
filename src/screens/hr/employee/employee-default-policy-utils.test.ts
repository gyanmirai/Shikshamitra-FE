import { it, expect, describe } from 'vitest';

import {
  getEmployeeCreationDefaultPolicyMessage,
  EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE,
  EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE,
  EMPLOYEE_CREATION_DEFAULT_POLICY_MISSING_MESSAGE,
  EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE,
} from './employee-default-policy-utils';

describe('staff creation default policy message', () => {
  const validInput = {
    currentYearId: 'year-1',
    payrollPolicyId: 'payroll-1',
    attendancePolicyId: 'attendance-1',
    leavePolicyId: 'leave-1',
  };

  it('reports loading before missing defaults', () => {
    expect(
      getEmployeeCreationDefaultPolicyMessage({
        currentYearId: 'year-1',
        isLoading: true,
      })
    ).toBe(EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE);
  });

  it('reports missing academic year first', () => {
    expect(getEmployeeCreationDefaultPolicyMessage({ ...validInput, currentYearId: '' })).toBe(
      EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE
    );
  });

  it('reports multiple defaults distinctly', () => {
    expect(
      getEmployeeCreationDefaultPolicyMessage({
        ...validInput,
        hasMultipleDefaults: true,
      })
    ).toBe(EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE);
  });

  it('reports missing defaults after loading completes', () => {
    expect(
      getEmployeeCreationDefaultPolicyMessage({
        ...validInput,
        leavePolicyId: '',
      })
    ).toBe(EMPLOYEE_CREATION_DEFAULT_POLICY_MISSING_MESSAGE);
  });

  it('returns empty message when all defaults are present', () => {
    expect(getEmployeeCreationDefaultPolicyMessage(validInput)).toBe('');
  });

  it('does not turn a failed or incomplete query into missing setup', () => {
    expect(
      getEmployeeCreationDefaultPolicyMessage({
        ...validInput,
        setupStates: { leave: 'unknown', attendance: 'ready', payroll: 'ready' },
      })
    ).toBe('Default policies could not be verified');
  });

  it.each(['leave', 'attendance', 'payroll'] as const)(
    'names the missing %s default after authoritative success',
    (policy) => {
      expect(
        getEmployeeCreationDefaultPolicyMessage({
          ...validInput,
          setupStates: {
            leave: 'ready',
            attendance: 'ready',
            payroll: 'ready',
            [policy]: 'missing',
          },
        })
      ).toBe(`Default ${policy} policy missing`);
    }
  );
});
