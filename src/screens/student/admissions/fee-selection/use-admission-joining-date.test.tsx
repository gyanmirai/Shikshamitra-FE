import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useAdmissionJoiningDate } from './use-admission-joining-date';

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  preview: vi.fn(),
  save: vi.fn(),
  unwrap: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-joining-date-api', () => ({
  useGetAdmissionJoiningDateQuery: mocks.read,
  usePreviewAdmissionJoiningDateQuery: mocks.preview,
  useSaveAdmissionJoiningDateMutation: () => [mocks.save, { isLoading: false }],
}));
const state = {
  joiningDate: '2026-06-01',
  concurrencyStamp: 'stamp-1',
  canEdit: true,
  canPreview: true,
  isLocked: false,
  lockReason: null,
  academicYearStartDate: '2026-06-01',
  academicYearEndDate: '2027-05-31',
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.read.mockReturnValue({
    currentData: state,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  mocks.preview.mockReturnValue({
    currentData: undefined,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  mocks.save.mockReturnValue({ unwrap: mocks.unwrap });
  mocks.unwrap.mockResolvedValue({
    ...state,
    joiningDate: '2026-06-02',
    concurrencyStamp: 'stamp-2',
  });
});
const renderDate = (options = {}) =>
  renderHook(() => useAdmissionJoiningDate('app-1', { enabled: true, ...options }));

it('prefills the saved joining date and skips all reads without collection view', () => {
  const view = renderDate({ enabled: false });
  expect(mocks.read).toHaveBeenCalledWith('app-1', expect.objectContaining({ skip: true }));
  expect(view.result.current.value?.format('YYYY-MM-DD')).toBe('2026-06-01');
  expect(mocks.save).not.toHaveBeenCalled();
});

it('does not preview an empty or invalid date and retains validation beside the field', () => {
  const view = renderDate();
  act(() => view.result.current.change(null));
  act(() => view.result.current.blur());
  expect(view.result.current.error).toBe('Actual joining date is required.');
  expect(view.result.current.blocked).toBe(true);
  act(() => view.result.current.change(dayjs('2028-01-01')));
  expect(view.result.current.error).toMatch(/academic year/i);
  expect(mocks.preview.mock.lastCall?.[1].skip).toBe(true);
});

it('debounces candidate dates and rejects an old date preview immediately', async () => {
  mocks.preview.mockReturnValue({
    currentData: { joiningDate: '2026-06-01', totalAmount: 10000 },
    isFetching: false,
    isError: false,
  });
  const view = renderDate();
  act(() => view.result.current.change(dayjs('2026-06-02')));
  expect(view.result.current.preview).toBeUndefined();
  expect(view.result.current.blocked).toBe(true);
  await waitFor(() =>
    expect(mocks.preview).toHaveBeenCalledWith(
      expect.objectContaining({ joiningDate: '2026-06-02' }),
      expect.objectContaining({ skip: false })
    )
  );
  expect(mocks.save).not.toHaveBeenCalled();
});

it('confirms the date with its original concurrency stamp only on the collection command', async () => {
  mocks.preview.mockReturnValue({
    currentData: { joiningDate: '2026-06-02', totalAmount: 9973 },
    isFetching: false,
    isError: false,
  });
  const view = renderDate();
  act(() => view.result.current.change(dayjs('2026-06-02')));
  await waitFor(() => expect(view.result.current.blocked).toBe(false));
  await act(() => view.result.current.confirm());
  expect(mocks.save).toHaveBeenCalledWith({
    applicationId: 'app-1',
    joiningDate: '2026-06-02',
    concurrencyStamp: 'stamp-1',
  });
});

it('uses the immutable prepared date without previewing or saving a replacement', async () => {
  mocks.read.mockReturnValue({
    currentData: {
      ...state,
      isLocked: true,
      canEdit: false,
      canPreview: false,
      lockReason: 'Fees already prepared.',
    },
    isFetching: false,
    isError: false,
  });
  const view = renderDate();
  expect(view.result.current.blocked).toBe(false);
  expect(mocks.preview.mock.lastCall?.[1].skip).toBe(true);
  await act(() => view.result.current.confirm());
  expect(mocks.save).not.toHaveBeenCalled();
});

it('displays the saved date when concurrent preparation locks an unsaved date draft', async () => {
  const view = renderDate();
  act(() => view.result.current.change(dayjs('2026-06-02')));
  mocks.read.mockReturnValue({
    currentData: { ...state, isLocked: true, canEdit: false, canPreview: false },
    isFetching: false,
    isError: false,
  });
  view.rerender();
  expect(view.result.current.value?.format('YYYY-MM-DD')).toBe('2026-06-01');
  await act(() => view.result.current.confirm());
  expect(mocks.save).not.toHaveBeenCalled();
});

it('preserves a draft after save failure and does not submit against a refreshed application stamp', async () => {
  mocks.preview.mockReturnValue({
    currentData: { joiningDate: '2026-06-02', totalAmount: 9973 },
    isFetching: false,
    isError: false,
  });
  const view = renderDate();
  act(() => view.result.current.change(dayjs('2026-06-02')));
  await waitFor(() => expect(view.result.current.blocked).toBe(false));
  mocks.unwrap.mockRejectedValueOnce(new Error('Conflict'));
  await expect(view.result.current.confirm()).rejects.toThrow('Conflict');
  expect(view.result.current.value?.format('YYYY-MM-DD')).toBe('2026-06-02');
  mocks.read.mockReturnValue({
    currentData: { ...state, concurrencyStamp: 'external-change' },
    isFetching: false,
    isError: false,
  });
  view.rerender();
  expect(view.result.current.blocked).toBe(true);
  expect(view.result.current.stale).toBe(true);
});
