import { it, expect, describe } from 'vitest';

import {
  buildLeavePolicyQueryParams,
  buildLeaveRequestQueryParams,
  buildLeaveYearEndSettlementQueryParams,
  buildLeaveYearEndSettlementPreviewBody,
} from './leaveApi';

describe('leaveApi contracts', () => {
  it('preserves active-only defaults unless the policy workspace requests an archive view', () => {
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
      })
    ).toEqual({
      academicYearId: 'academic-year-1',
      page: 1,
      pageSize: 10,
    });
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
        archivedOnly: false,
      })
    ).toMatchObject({ archivedOnly: false });
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
        archivedOnly: true,
      })
    ).toMatchObject({ archivedOnly: true });
  });

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

  it('uses academic year only for year-end settlement routes', () => {
    expect(buildLeaveYearEndSettlementQueryParams({ academicYearId: 'academic-year-1' })).toEqual({
      academicYearId: 'academic-year-1',
    });
    expect(buildLeaveYearEndSettlementPreviewBody({ academicYearId: 'academic-year-1' })).toEqual({
      academicYearId: 'academic-year-1',
    });
  });
});
