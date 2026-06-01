import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  parseHRDashboardPayload,
  buildHRDashboardDefaultParams,
  buildHRDashboardSummaryParams,
} from './hrDashboardApi';

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

  it('treats an empty snapshot payload as unavailable', () => {
    expect(
      parseHRDashboardPayload({
        dashboardKey: 'Main',
        scopeKey: 'hr-wide',
        status: 'Empty',
        payloadJson: '{}',
        payloadVersion: 1,
        isStale: true,
      })
    ).toBeUndefined();
  });

  it('parses a ready snapshot payload without requiring live summary params', () => {
    expect(
      parseHRDashboardPayload<{ workforce: { totalActiveStaff: number } }>({
        dashboardKey: 'Main',
        scopeKey: 'hr-wide',
        status: 'Ready',
        payloadJson: '{"workforce":{"totalActiveStaff":42}}',
        payloadVersion: 1,
        isStale: false,
        lastSuccessfulRefreshAt: '2026-05-23T06:00:00Z',
        nextScheduledRefreshAt: '2026-05-24T06:00:00Z',
      })
    ).toEqual({ workforce: { totalActiveStaff: 42 } });
  });
});
