import { it, expect, describe } from 'vitest';

import {
  compensationEndpoint,
  buildSaveEmployeeCompensationRequest,
} from './compensation-revision-api';

describe('compensation revision API contract', () => {
  const quote = {
    templateVersionId: 'template-version-2',
    salaryBasis: 'EMPLOYER_COST' as const,
    protectionPolicy: 'PROTECT_EMPLOYER_COST' as const,
    monthlyAmount: 20000,
    effectiveMonth: '2026-08-01T00:00:00.000Z',
    pfApplicable: false,
    pfRuleId: null,
    statutoryProfile: 'IN-GJ' as const,
    overrides: [],
    customizationReason: null,
    idempotencyKey: 'operation-1',
    expectedRevision: null,
  };

  it('uses the staff-scoped direct-save endpoint', () => {
    expect(compensationEndpoint('employee-1')).toBe(
      '/payroll/employees/employee-1/compensation'
    );
    expect(buildSaveEmployeeCompensationRequest('employee-1', quote)).toEqual({
      url: '/payroll/employees/employee-1/compensation',
      method: 'PUT',
      body: quote,
    });
  });
});
