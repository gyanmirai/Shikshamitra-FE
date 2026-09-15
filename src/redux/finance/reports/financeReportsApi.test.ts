import { it, expect, describe } from 'vitest';

import { normalizeFinanceReportRequest } from './financeReportsApi';

describe('financeReportsApi contract', () => {
  it('creates a five-row preview without changing semantic filters', () => {
    const request = normalizeFinanceReportRequest(
      {
        reportType: 'Fee Collection Month And FeeHeadwise',
        format: 'pdf',
        filters: {
          academicYearIds: ['year-1'],
          months: [4, 5],
          feeHeadIds: ['head-1'],
        },
      },
      5
    );

    expect(request).toMatchObject({
      page: 1,
      pageSize: 5,
      filters: {
        academicYearIds: ['year-1'],
        months: [4, 5],
        feeHeadIds: ['head-1'],
      },
    });
  });

  it('uses a larger page only at the export boundary', () => {
    expect(
      normalizeFinanceReportRequest(
        { reportType: 'Fee Monthly Register', format: 'excel', filters: {} },
        50
      )
    ).toMatchObject({ page: 1, pageSize: 50, format: 'excel' });
  });
});
