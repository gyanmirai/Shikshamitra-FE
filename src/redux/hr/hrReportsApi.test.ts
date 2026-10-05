import { it, expect, describe } from 'vitest';

import { buildHrReportDownloadUrl, normalizeHrReportRequest } from './hrReportsApi';

describe('hrReportsApi helpers', () => {
  it('normalizes preview paging defaults', () => {
    expect(normalizeHrReportRequest({ reportType: 'Staff Directory' })).toMatchObject({
      reportType: 'Staff Directory',
      page: 1,
      pageSize: 50,
      filters: {},
    });
  });

  it('preserves valid paging and filters', () => {
    expect(
      normalizeHrReportRequest({
        reportType: 'Staff Directory',
        page: 3,
        pageSize: 100,
        filters: { departments: ['HR'] },
      })
    ).toMatchObject({
      page: 3,
      pageSize: 100,
      filters: { departments: ['HR'] },
    });
  });

  it('normalizes invalid paging values', () => {
    expect(
      normalizeHrReportRequest({
        reportType: 'Staff Directory',
        page: 0,
        pageSize: -1,
      })
    ).toMatchObject({
      page: 1,
      pageSize: 50,
    });
  });

  it('builds export download URLs', () => {
    expect(buildHrReportDownloadUrl('job-123')).toBe('/hr/reports/exports/job-123/download');
  });

  it('preserves chart definitions while normalizing requests', () => {
    expect(
      normalizeHrReportRequest({
        reportType: 'Attendance Summary',
        chart: {
          type: 'donut',
          categoryField: 'status',
          function: 'count',
        },
      })
    ).toMatchObject({
      chart: {
        type: 'donut',
        categoryField: 'status',
        function: 'count',
      },
    });
  });

  it('preserves optional export lineage metadata while normalizing requests', () => {
    expect(
      normalizeHrReportRequest({
        reportType: 'Staff Directory',
        templateId: 'template-1',
        templateName: 'Staff Template',
        parentJobId: 'job-1',
        sourceAction: 'regenerate',
      })
    ).toMatchObject({
      templateId: 'template-1',
      templateName: 'Staff Template',
      parentJobId: 'job-1',
      sourceAction: 'regenerate',
    });
  });
});
