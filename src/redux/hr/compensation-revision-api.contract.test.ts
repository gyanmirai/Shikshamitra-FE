import { it, expect, describe } from 'vitest';

import {
  compensationRevisionEndpoint,
  buildCreateCompensationRevisionRequest,
  buildCompensationRevisionActionRequest,
} from './compensation-revision-api';

describe('compensation revision API contract', () => {
  const quote = {
    templateVersionId: 'template-version-2',
    salaryBasis: 'EMPLOYER_COST' as const,
    protectionPolicy: 'PROTECT_EMPLOYER_COST' as const,
    monthlyAmount: 20000,
    effectiveMonth: '2026-08-01T00:00:00.000Z',
    pfRuleId: null,
    statutoryProfile: 'IN-GJ' as const,
  };

  it('uses the employee-scoped immutable revision endpoint', () => {
    expect(compensationRevisionEndpoint('employee-1')).toBe(
      '/payroll/employees/employee-1/compensation-revisions'
    );
    expect(buildCreateCompensationRevisionRequest('employee-1', quote)).toEqual({
      url: '/payroll/employees/employee-1/compensation-revisions',
      method: 'POST',
      body: quote,
    });
  });

  it('keeps submission and approval as separate actions', () => {
    expect(buildCompensationRevisionActionRequest('employee-1', 'revision-1', 'submit')).toEqual({
      url: '/payroll/employees/employee-1/compensation-revisions/revision-1/submit',
      method: 'POST',
    });
    expect(buildCompensationRevisionActionRequest('employee-1', 'revision-1', 'approve')).toEqual({
      url: '/payroll/employees/employee-1/compensation-revisions/revision-1/approve',
      method: 'POST',
    });
  });
});
