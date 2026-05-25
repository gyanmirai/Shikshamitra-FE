import { it, expect, describe } from 'vitest';

import { buildHrReportDownloadUrl, normalizeHrReportRequest } from './hrReportsApi';

describe('hrReportsApi helpers', () => {
  it('normalizes preview paging defaults', () => {
    expect(normalizeHrReportRequest({ reportType: 'Employee List' })).toMatchObject({
      reportType: 'Employee List',
      page: 1,
      pageSize: 50,
      filters: {},
    });
  });

  it('builds export download URLs', () => {
    expect(buildHrReportDownloadUrl('job-123')).toBe('/hr/reports/exports/job-123/download');
  });
});
