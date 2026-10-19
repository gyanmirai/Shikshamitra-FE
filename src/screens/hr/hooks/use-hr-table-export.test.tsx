import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useHrTableExport } from './use-hr-table-export';

const rpc = vi.hoisted(() => ({
  create: vi.fn(),
  status: vi.fn(),
  download: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock('src/redux/hr/hrTableExportApi', () => ({
  useCreateHrTableExportMutation: () => [rpc.create],
  useLazyHrTableExportStatusQuery: () => [rpc.status],
  useDownloadHrTableExportMutation: () => [rpc.download],
  useCancelHrTableExportMutation: () => [rpc.cancel],
}));
const request = {
  format: 'excel' as const,
  columns: [{ id: 'netPay', label: 'Net pay' }],
  searchTerm: '',
  filters: [],
  sorts: [],
};
const completed = { id: 'export-1', status: 'Completed', rowCount: 25001 };
const response = (value: unknown) => ({ unwrap: () => Promise.resolve(value) });

describe('complete HR table exports', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.values(rpc).forEach((mock) => mock.mockReset());
    rpc.create.mockReturnValue(response(completed));
    rpc.download.mockReturnValue(response(new Blob(['complete table'])));
    rpc.cancel.mockReturnValue(response(undefined));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('sends the complete query and ordered data columns without source rows or paging overrides', async () => {
    const { result } = renderHook(() =>
      useHrTableExport('hr-salary-documents', {
        filters: { month: '2026-09' },
        sorts: [{ field: 'netPay', direction: 'desc' }],
      })
    );
    await act(() => result.current(request));
    expect(rpc.create).toHaveBeenCalledWith({
      table: 'hr-salary-documents',
      format: 'excel',
      query: { filters: { month: '2026-09' }, sorts: [{ field: 'netPay', direction: 'desc' }] },
      columns: [{ id: 'netPay', label: 'Net pay' }],
    });
    expect(rpc.download).toHaveBeenCalledWith('export-1');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  });

  it('keeps the captured filters while the screen changes and waits for completion', async () => {
    rpc.create.mockReturnValue(response({ ...completed, status: 'Queued' }));
    rpc.status.mockReturnValue(response(completed));
    const { result, rerender } = renderHook(
      ({ month }) => useHrTableExport('hr-salary-documents', { month }),
      { initialProps: { month: '2026-09' } }
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current(request);
    });
    rerender({ month: '2026-10' });
    expect(rpc.download).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await pending;
    });
    expect(rpc.create.mock.calls[0][0].query.month).toBe('2026-09');
    expect(rpc.status).toHaveBeenCalledWith('export-1', false);
    expect(rpc.download).toHaveBeenCalledOnce();
  });

  it('cancels the background job and never downloads after cancellation', async () => {
    rpc.create.mockReturnValue(response({ ...completed, status: 'Running' }));
    rpc.status.mockReturnValue(response(completed));
    const controller = new AbortController();
    const { result } = renderHook(() => useHrTableExport('employee-table', {}));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current({ ...request, signal: controller.signal });
    });
    controller.abort();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await pending;
    });
    expect(rpc.cancel).toHaveBeenCalledWith('export-1');
    expect(rpc.download).not.toHaveBeenCalled();
  });

  it('keeps limit failures explicit and permits a fresh retry', async () => {
    rpc.create.mockReturnValueOnce(
      response({ ...completed, status: 'Failed', error: 'PDF exceeds 10,000 rows. Use Excel.' })
    );
    const { result } = renderHook(() => useHrTableExport('employee-table', {}));
    await expect(result.current({ ...request, format: 'pdf' })).rejects.toThrow('Use Excel');
    expect(rpc.download).not.toHaveBeenCalled();
    await act(() => result.current(request));
    expect(rpc.create).toHaveBeenCalledTimes(2);
    expect(rpc.download).toHaveBeenCalledOnce();
  });

  it('does not download after the owning table unmounts', async () => {
    rpc.create.mockReturnValue(response({ ...completed, status: 'Queued' }));
    rpc.status.mockReturnValue(response(completed));
    const { result, unmount } = renderHook(() => useHrTableExport('employee-table', {}));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current(request);
    });
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await pending;
    });
    expect(rpc.download).not.toHaveBeenCalled();
  });
});
