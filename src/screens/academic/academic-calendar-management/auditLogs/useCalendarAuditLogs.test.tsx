import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import useCalendarAuditLogs from './useCalendarAuditLogs';

const mocks = vi.hoisted(() => ({ query: vi.fn(), addNote: vi.fn() }));
vi.mock('react-redux', () => ({ useSelector: () => ({ permissions: [] }) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api', () => ({
  useGetAuditLogsQuery: mocks.query,
  useAddAuditLogReviewNoteMutation: () => [mocks.addNote],
}));
const response = {
  currentData: {
    items: [{ id: '1', action: 4, actionLabel: 'Day added', entityName: 'Holiday' }],
    totalCount: 51,
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: undefined,
  refetch: vi.fn(),
};

describe('audit request and page filtering state', () => {
  beforeEach(() => {
    mocks.query.mockReturnValue(response);
  });
  it('keeps the server count and later pages reachable when a page filter has no matches', () => {
    const { result } = renderHook(useCalendarAuditLogs);
    act(() => result.current.changePage(2, 20));
    act(() => result.current.changeFilters({ ...result.current.filters, search: 'unmatched' }));
    expect(result.current.displayedLogs).toEqual([]);
    expect(result.current.totalCount).toBe(51);
    expect(result.current.page).toBe(2);
  });
  it('resets paging and sends the supported action criterion to the endpoint', () => {
    const { result } = renderHook(useCalendarAuditLogs);
    act(() => result.current.changePage(2, 20));
    act(() => result.current.changeFilters({ ...result.current.filters, action: '4' }));
    expect(result.current.page).toBe(0);
    expect(mocks.query).toHaveBeenLastCalledWith(
      { action: 4, skipCount: 0, maxResultCount: 20 },
      { skip: false }
    );
  });
  it('uses a pending state while the requested page is unavailable instead of stale rows', () => {
    mocks.query.mockReturnValue({
      ...response,
      data: response.currentData,
      currentData: undefined,
      isFetching: true,
    });
    const { result } = renderHook(useCalendarAuditLogs);
    expect(result.current.pending).toBe(true);
    expect(result.current.displayedLogs).toEqual([]);
    expect(result.current.totalCount).toBeUndefined();
  });
  it('exposes failures separately from empty results and preserves safe rows during refresh', () => {
    const error = { status: 503 };
    mocks.query.mockReturnValue({ ...response, isError: true, error });
    const { result, rerender } = renderHook(useCalendarAuditLogs);
    expect(result.current.error).toBe(error);
    mocks.query.mockReturnValue({ ...response, isFetching: true });
    rerender();
    expect(result.current.refreshing).toBe(true);
    expect(result.current.displayedLogs).toHaveLength(1);
  });
});
