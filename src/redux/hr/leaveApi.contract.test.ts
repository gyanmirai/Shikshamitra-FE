import { it, expect, describe } from 'vitest';

import { buildLeaveRequestQueryParams } from './leaveApi';

describe('leaveApi contracts', () => {
  it('uses paid type filters and omits legacy leave type filters', () => {
    expect(
      buildLeaveRequestQueryParams({
        academicYearId: 'academic-year-1',
        page: 2,
        pageSize: 50,
        status: 'APPROVED',
        leavePolicyId: 'policy-1',
        paidType: 'Unpaid',
        employeeId: 'employee-1',
      })
    ).toEqual({
      academicYearId: 'academic-year-1',
      page: 2,
      pageSize: 50,
      status: 'APPROVED',
      leavePolicyId: 'policy-1',
      paidType: 'Unpaid',
      employeeId: 'employee-1',
    });
  });
});
