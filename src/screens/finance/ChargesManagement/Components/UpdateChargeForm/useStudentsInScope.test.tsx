import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [lookup] }));
vi.mock('src/redux/student', () => ({ useLazyGetStudentsByScopeQuery: vi.fn() }));

import { useStudentsInScope } from './useStudentsInScope';

describe('charge scope loading', () => {
  beforeEach(() => lookup.mockReset());
  it('does not refetch or reset on arrays recreated with identical values', async () => {
    lookup.mockResolvedValue({
      data: [
        { studentId: 'student', studentName: 'Diya', gender: 1, hasFeeStructureAssignment: true },
      ],
    });
    const { result, rerender } = renderHook(() =>
      useStudentsInScope('board', 'medium', ['class'], ['division'])
    );
    await waitFor(() => expect(result.current.hasFetched).toBe(true));
    rerender();
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(result.current.students[0]).toMatchObject({
      id: 'student',
      gender: 1,
      hasFeeStructureAssignment: true,
    });
  });
  it('does not mark a failed response as authoritative empty data', async () => {
    lookup.mockResolvedValue({ error: { status: 503 } });
    const { result } = renderHook(() =>
      useStudentsInScope('board', 'medium', ['class'], ['division'])
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.hasFetched).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
  it('ignores an older scope response arriving after the new scope', async () => {
    let resolveOld: (value: any) => void = () => {};
    lookup.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        })
    );
    lookup.mockResolvedValueOnce({ data: [{ studentId: 'new', studentName: 'Current' }] });
    const { result, rerender } = renderHook(
      ({ medium }) => useStudentsInScope('board', medium, ['class'], ['division']),
      { initialProps: { medium: 'old' } }
    );
    rerender({ medium: 'new' });
    await waitFor(() => expect(result.current.students[0]?.id).toBe('new'));
    resolveOld({ data: [{ studentId: 'old', studentName: 'Stale' }] });
    await waitFor(() => expect(result.current.students[0]?.id).toBe('new'));
  });
});
