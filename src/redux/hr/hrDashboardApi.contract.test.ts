import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { buildHRDashboardDefaultParams, buildHRDashboardSummaryParams } from './hrDashboardApi';

describe('hrDashboardApi contracts', () => {
  it('builds summary query params without empty values', () => {
    expect(
      buildHRDashboardSummaryParams({
        date: '2026-05-23',
        month: '2026-05',
        range: 7,
      })
    ).toEqual({
      date: '2026-05-23',
      month: '2026-05',
      range: 7,
    });
  });

  it('omits optional dashboard params when they are not supplied', () => {
    expect(buildHRDashboardSummaryParams()).toEqual({});
  });

  it('builds explicit browser-local default dashboard params', () => {
    expect(buildHRDashboardDefaultParams(dayjs('2026-05-23T10:15:00'))).toEqual({
      date: '2026-05-23',
      month: '2026-05',
      range: 7,
    });
  });
});
