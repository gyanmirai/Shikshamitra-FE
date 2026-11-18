import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [lookup] }));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({
  useLazyGetEligibleChargeStudentsQuery: vi.fn(),
}));

import { useStudentsInScope } from './useStudentsInScope';

describe('charge scope loading', () => {
  beforeEach(() => lookup.mockReset());
  it('does not refetch or reset on arrays recreated with identical values', async () => {
    lookup.mockResolvedValue({
      data: {
        items: [
          { studentId: 'student', studentName: 'Diya', gender: 1, hasFeeStructureAssignment: true },
        ],
        candidateStudentIds: ['student', 'other'],
        matchingStudentIds: ['student', 'other'],
        totalCount: 2,
        page: 1,
        pageSize: 25,
      },
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
    expect(result.current.candidateStudentIds).toEqual(['student', 'other']);
    expect(result.current.totalCount).toBe(2);
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
    lookup.mockResolvedValueOnce({
      data: {
        items: [{ studentId: 'new', studentName: 'Current' }],
        candidateStudentIds: ['new'],
        matchingStudentIds: ['new'],
        totalCount: 1,
        page: 1,
        pageSize: 25,
      },
    });
    const { result, rerender } = renderHook(
      ({ medium }) => useStudentsInScope('board', medium, ['class'], ['division']),
      { initialProps: { medium: 'old' } }
    );
    rerender({ medium: 'new' });
    await waitFor(() => expect(result.current.students[0]?.id).toBe('new'));
    resolveOld({
      data: {
        items: [{ studentId: 'old', studentName: 'Stale' }],
        candidateStudentIds: ['old'],
        matchingStudentIds: ['old'],
        totalCount: 1,
        page: 1,
        pageSize: 25,
      },
    });
    await waitFor(() => expect(result.current.students[0]?.id).toBe('new'));
  });
  it('sends filters and a one-based page while retaining the full candidate audience', async () => {
    lookup.mockImplementation(async (params: { page: number } = { page: 1 }) => ({
      data: {
        items: [{ studentId: `page-${params.page}`, studentName: 'Student' }],
        candidateStudentIds: ['page-1', 'page-2'],
        matchingStudentIds: ['page-2'],
        matchingStudentNames: { 'page-2': 'Off-page student' },
        totalCount: 1,
        page: params.page,
        pageSize: 25,
      },
    }));
    const { result, rerender } = renderHook(
      ({ page }) =>
        useStudentsInScope('board', 'medium', ['class'], ['division'], 'category', {
          page,
          filters: {
            division: 'division',
            gender: '1',
            rollFrom: '10',
            rollTo: '20',
            charged: 'no',
            assigned: '',
          },
        }),
      { initialProps: { page: 0 } }
    );
    await waitFor(() => expect(result.current.hasFetched).toBe(true));
    rerender({ page: 1 });
    await waitFor(() => expect(result.current.students[0]?.id).toBe('page-2'));
    expect(lookup).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 25,
        chargeCategoryId: 'category',
        divisionFilterId: 'division',
        gender: 1,
        rollNoFrom: 10,
        rollNoTo: 20,
        charged: false,
      })
    );
    expect(result.current.candidateStudentIds).toEqual(['page-1', 'page-2']);
    expect(result.current.matchingStudentIds).toEqual(['page-2']);
    expect(result.current.matchingStudentNames['page-2']).toBe('Off-page student');
  });
  it('shows no unassigned students because charge eligibility requires an assignment', async () => {
    lookup.mockResolvedValue({
      data: {
        items: [{ studentId: 'assigned', studentName: 'Assigned' }],
        candidateStudentIds: ['assigned'],
        matchingStudentIds: ['assigned'],
        matchingStudentNames: { assigned: 'Assigned' },
        totalCount: 1,
      },
    });
    const { result } = renderHook(() =>
      useStudentsInScope('board', 'medium', ['class'], [], undefined, {
        filters: {
          division: '',
          gender: '',
          rollFrom: '',
          rollTo: '',
          charged: '',
          assigned: 'no',
        },
      })
    );
    await waitFor(() => expect(result.current.hasFetched).toBe(true));
    expect(result.current.students).toEqual([]);
    expect(result.current.matchingStudentIds).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.candidateStudentIds).toEqual(['assigned']);
  });
});
