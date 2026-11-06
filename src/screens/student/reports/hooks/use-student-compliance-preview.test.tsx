import type { RecordsReportInput, RecordsReportPreview } from 'src/redux/student/records/student-record-reports-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useStudentCompliancePreview } from './use-student-compliance-preview';

const mocks = vi.hoisted(() => ({
  query: vi.fn(), create: vi.fn(), success: vi.fn(), error: vi.fn(),
  preview: { currentData: { columns: ['Student'], rows: [{ Student: 'Saved student' }], totalCount: 1, asOf: '2026-11-05T00:00:00Z' } as RecordsReportPreview | undefined, isFetching: false, isError: false },
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success, error: mocks.error } }));
vi.mock('src/redux/student/records/student-record-reports-api', () => ({
  useGetRecordsReportPreviewQuery: (...args: unknown[]) => { mocks.query(...args); return mocks.preview; },
  useCreateRecordsReportMutation: () => [mocks.create, { isLoading: false }],
}));
const input: RecordsReportInput = { reportType: 'UdiseBaseline', academicYearId: 'year', boardId: 'board', mediumId: 'medium', standardId: 'class', divisionId: 'division' };

beforeEach(() => {
  vi.clearAllMocks(); mocks.preview.currentData = { columns: ['Student'], rows: [{ Student: 'Saved student' }], totalCount: 1, asOf: '2026-11-05T00:00:00Z' };
  mocks.preview.isFetching = false; mocks.preview.isError = false;
  mocks.create.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'job', status: 'Queued' }) });
});

describe('Compliance report preview and export parity', () => {
  it('paginates the preview but exports the complete unchanged scope', async () => {
    const accepted = vi.fn();
    const { result } = renderHook(() => useStudentCompliancePreview(input, true, accepted));
    await act(async () => { result.current.setPage(2); result.current.setSize(10); });
    expect(mocks.query).toHaveBeenLastCalledWith({ ...input, skipCount: 20, maxResultCount: 10 }, { refetchOnMountOrArgChange: true });
    await act(async () => { await result.current.queue(); });
    expect(mocks.create).toHaveBeenCalledWith({ ...input, skipCount: 0, maxResultCount: 100, clientKey: expect.any(String) });
    expect(accepted).toHaveBeenCalledOnce();
  });
  it('keeps the same retry key and input after rejected generation', async () => {
    const accepted = vi.fn();
    mocks.create.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Export service unavailable')) });
    const { result } = renderHook(() => useStudentCompliancePreview(input, true, accepted));
    await act(async () => { await result.current.queue(); });
    expect(accepted).not.toHaveBeenCalled(); expect(mocks.error).toHaveBeenCalledOnce();
    await act(async () => { await result.current.queue(); });
    expect(mocks.create.mock.calls[0][0]).toEqual(mocks.create.mock.calls[1][0]);
    expect(accepted).toHaveBeenCalledOnce();
  });
  it('prevents duplicate generation while the first request is pending', async () => {
    let resolve: (() => void) | undefined;
    const pending = new Promise<void>((done) => { resolve = done; });
    mocks.create.mockReturnValue({ unwrap: () => pending });
    const { result } = renderHook(() => useStudentCompliancePreview(input, true, vi.fn()));
    await act(async () => {
      const first = result.current.queue(); const second = result.current.queue();
      expect(mocks.create).toHaveBeenCalledOnce(); resolve?.(); await Promise.all([first, second]);
    });
  });
  it('does not generate from an initial loading read, failed read, or missing Add grant', async () => {
    mocks.preview.currentData = undefined; mocks.preview.isFetching = true;
    const { result, rerender } = renderHook(({ allowed }) => useStudentCompliancePreview(input, allowed, vi.fn()), { initialProps: { allowed: true } });
    await act(async () => { await result.current.queue(); });
    mocks.preview.isFetching = false; mocks.preview.isError = true; rerender({ allowed: true });
    await act(async () => { await result.current.queue(); });
    mocks.preview.isError = false; mocks.preview.currentData = { columns: [], rows: [], totalCount: 0, asOf: '' }; rerender({ allowed: false });
    await act(async () => { await result.current.queue(); });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
