import { toast } from 'sonner';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useHrReportExports } from './useHrReportExports';

const mocks = vi.hoisted(() => ({
  createExport: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/redux/hr/hrReportsApi', () => ({
  useCreateHrReportExportMutation: () => [mocks.createExport, { isLoading: false }],
}));

describe('useHrReportExports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createExport.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ jobId: 'export-1', status: 'Queued' }),
    });
  });

  it('queues an export, refreshes history, and announces the queued job', async () => {
    const refetchExports = vi.fn();
    const onExportQueued = vi.fn();
    const requestFor = vi.fn().mockReturnValue({
      reportType: 'Staff Report',
      dataSource: 'employee',
      filters: {},
    });

    const { result } = renderHook(() =>
      useHrReportExports({
        isFetchingExports: false,
        refetchExports,
        onExportQueued,
        requestFor,
      })
    );

    await act(async () => {
      await result.current.exportReport('excel');
    });

    expect(requestFor).toHaveBeenCalledWith(1, 25, 'excel');
    expect(mocks.createExport).toHaveBeenCalledWith({
      reportType: 'Staff Report',
      dataSource: 'employee',
      filters: {},
    });
    expect(refetchExports).toHaveBeenCalledTimes(1);
    expect(onExportQueued).toHaveBeenCalledWith({ jobId: 'export-1', format: 'excel' });
    expect(onExportQueued.mock.invocationCallOrder[0]).toBeLessThan(
      refetchExports.mock.invocationCallOrder[0]
    );
    expect(toast.success).toHaveBeenCalledWith('Excel export queued. Track it in Reports Center.', {
      position: 'top-right',
      duration: 3000,
    });
  });

  it('keeps the queued navigation path when export history refresh fails', async () => {
    const refetchExports = vi.fn().mockRejectedValue(new Error('network drift'));
    const onExportQueued = vi.fn();
    const requestFor = vi.fn().mockReturnValue({
      reportType: 'Staff Report',
      dataSource: 'employee',
      filters: {},
    });

    const { result } = renderHook(() =>
      useHrReportExports({
        isFetchingExports: false,
        refetchExports,
        onExportQueued,
        requestFor,
      })
    );

    await act(async () => {
      await result.current.exportReport('excel');
    });

    expect(onExportQueued).toHaveBeenCalledWith({ jobId: 'export-1', format: 'excel' });
    expect(toast.warning).toHaveBeenCalledWith(
      'Export queued, but export history could not refresh. It will update on the next poll or manual refresh.',
      {
        position: 'top-right',
        duration: 3000,
      }
    );
  });

  it('warns when export history refresh resolves with an RTK error payload', async () => {
    const refetchExports = vi.fn().mockResolvedValue({ error: { status: 500 } });
    const onExportQueued = vi.fn();
    const requestFor = vi.fn().mockReturnValue({
      reportType: 'Staff Report',
      dataSource: 'employee',
      filters: {},
    });

    const { result } = renderHook(() =>
      useHrReportExports({
        isFetchingExports: false,
        refetchExports,
        onExportQueued,
        requestFor,
      })
    );

    await act(async () => {
      await result.current.exportReport('excel');
    });

    expect(onExportQueued).toHaveBeenCalledWith({ jobId: 'export-1', format: 'excel' });
    expect(toast.warning).toHaveBeenCalledWith(
      'Export queued, but export history could not refresh. It will update on the next poll or manual refresh.',
      {
        position: 'top-right',
        duration: 3000,
      }
    );
  });

  it('shows an error and keeps the user in the builder when export queueing fails', async () => {
    const refetchExports = vi.fn();
    const onExportQueued = vi.fn();
    const requestFor = vi.fn().mockReturnValue({
      reportType: 'Staff Report',
      dataSource: 'employee',
      filters: {},
    });
    mocks.createExport.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('queue failed')),
    });

    const { result } = renderHook(() =>
      useHrReportExports({
        isFetchingExports: false,
        refetchExports,
        onExportQueued,
        requestFor,
      })
    );

    await act(async () => {
      await result.current.exportReport('excel');
    });

    expect(onExportQueued).not.toHaveBeenCalled();
    expect(refetchExports).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Export could not be queued.', {
      position: 'top-right',
      duration: 3000,
    });
  });
});
