import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { hrReportToast } from '../hr-report-notifications';
import { getHrReportExportPollingDecision } from '../hr-report-center-utils';
import { useHrReportExportPollingGuard } from './useHrReportExportPollingGuard';

vi.mock('../hr-report-notifications', () => ({
  hrReportToast: {
    warning: vi.fn(),
  },
}));

const exportJob = (overrides: Partial<HrReportExportJob>): HrReportExportJob => ({
  id: overrides.id ?? 'job-1',
  reportType: overrides.reportType ?? 'Employee Report',
  format: overrides.format ?? 'excel',
  status: overrides.status ?? 'Completed',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  expiresAt: overrides.expiresAt ?? '2026-06-08T10:00:00Z',
  isExpired: overrides.isExpired ?? false,
  ...overrides,
});

describe('useHrReportExportPollingGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts polling immediately when an export is highlighted', () => {
    const { result } = renderHook(() => useHrReportExportPollingGuard());

    act(() => {
      result.current.highlightExportJob('queued-job');
    });

    expect(result.current.highlightedExportId).toBe('queued-job');
    expect(result.current.shouldPollExports).toBe(true);
  });

  it('stops polling and warns after the highlighted export is missing for the grace window', () => {
    const { result } = renderHook(() => useHrReportExportPollingGuard());

    act(() => {
      result.current.highlightExportJob('queued-job');
    });

    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 1 });
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 2 });
    });

    expect(result.current.highlightedExportId).toBe('queued-job');
    expect(result.current.shouldPollExports).toBe(true);
    expect(hrReportToast.warning).not.toHaveBeenCalled();

    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 3 });
    });

    expect(result.current.highlightedExportId).toBeNull();
    expect(result.current.shouldPollExports).toBe(false);
    expect(hrReportToast.warning).toHaveBeenCalledWith(
      'Export was queued, but it is not visible in the current export list. Use Refresh to check again.'
    );
  });

  it('recovers when the highlighted export appears completed before the missing-job limit', () => {
    const { result } = renderHook(() => useHrReportExportPollingGuard());
    const completedExportJobs = [exportJob({ id: 'queued-job', status: 'Completed' })];

    act(() => {
      result.current.highlightExportJob('queued-job');
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 1 });
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 2 });
    });
    act(() => {
      result.current.observeExports({
        exportJobs: completedExportJobs,
        fulfilledTimeStamp: 3,
      });
    });

    expect(getHrReportExportPollingDecision(completedExportJobs, 'queued-job', 2)).toEqual(
      expect.objectContaining({
        hasHighlightedJob: true,
        shouldPoll: false,
      })
    );
    expect(result.current.highlightedExportId).toBe('queued-job');
    expect(result.current.shouldPollExports).toBe(false);
    expect(hrReportToast.warning).not.toHaveBeenCalled();
  });

  it('resets the missing-highlight count while any export is active', () => {
    const { result } = renderHook(() => useHrReportExportPollingGuard());

    act(() => {
      result.current.highlightExportJob('queued-job');
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 1 });
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 2 });
    });
    act(() => {
      result.current.observeExports({
        exportJobs: [exportJob({ id: 'other-job', status: 'Running' })],
        fulfilledTimeStamp: 3,
      });
    });

    expect(result.current.shouldPollExports).toBe(true);
    expect(result.current.highlightedExportId).toBe('queued-job');

    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 4 });
    });
    act(() => {
      result.current.observeExports({ exportJobs: [], fulfilledTimeStamp: 5 });
    });

    expect(result.current.shouldPollExports).toBe(true);
    expect(result.current.highlightedExportId).toBe('queued-job');
    expect(hrReportToast.warning).not.toHaveBeenCalled();
  });
});
