import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useStudentDirectoryExport } from './use-student-directory-export';

const rpc = vi.hoisted(() => ({ dispatch: vi.fn(), initiate: vi.fn(), exportTable: vi.fn() }));
vi.mock('react-redux', () => ({ useDispatch: () => rpc.dispatch }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  studentRecordsApi: { endpoints: { getStudentRecordsDirectory: { initiate: rpc.initiate } } },
}));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: rpc.exportTable }));

const student = (id: string, fields: Partial<StudentDirectoryItem> = {}) =>
  ({
    id,
    studentId: id,
    firstName: `Student ${id}`,
    maskedFields: [],
    ...fields,
  }) as StudentDirectoryItem;
const resultPage = (items: StudentDirectoryItem[], totalCount: number) => ({ items, totalCount });
const queryResult = (value: unknown) => ({
  unwrap: vi.fn().mockResolvedValue(value),
  abort: vi.fn(),
  unsubscribe: vi.fn(),
});
const request: TableExportRequest = {
  format: 'excel',
  columns: [
    { id: 'name', label: 'Student' },
    { id: 'grNumber', label: 'GR number' },
  ],
  searchTerm: 'Student',
  filters: [],
  sorts: [],
};
const input = {
  academicYearId: 'year',
  boardId: 'board',
  mediumId: 'medium',
  standardIds: ['class-one', 'class-two'],
  divisionIds: ['division-a', 'division-b'],
  population: 'Active' as const,
  search: 'Student',
  sorting: 'name desc',
  columnFilters: [{ column: 'status' as const, operator: 'equals' as const, value: '6' }],
  skipCount: 25,
  maxResultCount: 25,
};

describe('Student Directory common export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.initiate.mockImplementation((query, options) => ({ query, options }));
    rpc.exportTable.mockResolvedValue(undefined);
  });

  it('exports all matching pages, keeps scope and masking, and excludes selection/actions', async () => {
    const first = queryResult(resultPage([student('one'), student('two')], 3));
    const last = queryResult(
      resultPage(
        [
          student('three', {
            firstName: null,
            middleName: null,
            lastName: null,
            grNumber: null,
            maskedFields: ['Identity'],
            standardName: 'Class 2',
            divisionName: 'A',
          }),
        ],
        3
      )
    );
    rpc.dispatch.mockReturnValueOnce(first).mockReturnValueOnce(last);
    const { result } = renderHook(() => useStudentDirectoryExport(input));

    await act(() =>
      result.current({
        ...request,
        columns: [
          ...request.columns,
          { id: 'selection', label: '' },
          { id: 'actions', label: 'Actions' },
        ],
      })
    );

    expect(rpc.initiate.mock.calls.map(([query]) => query)).toEqual([
      { ...input, skipCount: 0, maxResultCount: 100 },
      { ...input, skipCount: 2, maxResultCount: 100 },
    ]);
    expect(
      rpc.initiate.mock.calls.every(
        ([, options]) => options.subscribe === false && options.forceRefetch
      )
    ).toBe(true);
    expect(first.unsubscribe).toHaveBeenCalledOnce();
    expect(last.unsubscribe).toHaveBeenCalledOnce();
    expect(rpc.exportTable).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'excel',
        columns: request.columns,
        tableTitle: 'Student List',
        rows: [
          expect.objectContaining({ studentId: 'one', name: 'Student one' }),
          expect.objectContaining({ studentId: 'two', name: 'Student two' }),
          expect.objectContaining({
            studentId: 'three',
            name: 'Restricted identity',
            grNumber: null,
            classDivision: 'Class 2 / A',
          }),
        ],
      })
    );
  });

  it('captures the current query and readable context while another scope is rendered', async () => {
    let resolveFirst!: (value: unknown) => void;
    const first = queryResult(null);
    first.unwrap.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );
    rpc.dispatch
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(queryResult(resultPage([student('two')], 2)));
    const context = ['Academic year: 2026-2027', 'Board: CBSE', 'Medium: English'];
    const { result, rerender } = renderHook(
      ({ query, details }) => useStudentDirectoryExport(query, details),
      { initialProps: { query: input, details: context } }
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current(request);
    });
    context.push('This later change must not enter the export');
    rerender({
      query: { ...input, boardId: 'different-board' },
      details: ['Academic year: 2027-2028', 'Board: GSEB'],
    });
    await act(async () => {
      resolveFirst(resultPage([student('one')], 2));
      await pending;
    });
    expect(rpc.initiate.mock.calls.map(([query]) => query.boardId)).toEqual(['board', 'board']);
    expect(rpc.exportTable.mock.calls[0][0].context).toEqual([
      'Academic year: 2026-2027',
      'Board: CBSE',
      'Medium: English',
      'Population: Active',
      'Search: Student',
      'Sort: name desc',
      '1 column filters applied',
    ]);
  });

  it.each(['changed-total', 'duplicate', 'missing-page'])(
    'refuses an incomplete file when pagination has %s',
    async (problem) => {
      const next =
        problem === 'changed-total'
          ? resultPage([student('two')], 1)
          : problem === 'duplicate'
            ? resultPage([student('one')], 2)
            : resultPage([], 2);
      rpc.dispatch
        .mockReturnValueOnce(queryResult(resultPage([student('one')], 2)))
        .mockReturnValueOnce(queryResult(next));
      const { result } = renderHook(() => useStudentDirectoryExport(input));
      await expect(result.current(request)).rejects.toThrow();
      expect(rpc.exportTable).not.toHaveBeenCalled();
    }
  );

  it('propagates a later-page authorization failure and never downloads a partial file', async () => {
    const denied = queryResult(null);
    denied.unwrap.mockRejectedValue({ status: 403, data: { detail: 'Access denied' } });
    rpc.dispatch
      .mockReturnValueOnce(queryResult(resultPage([student('one')], 2)))
      .mockReturnValueOnce(denied);
    const { result } = renderHook(() => useStudentDirectoryExport(input));
    await expect(result.current(request)).rejects.toMatchObject({ status: 403 });
    expect(denied.unsubscribe).toHaveBeenCalledOnce();
    expect(rpc.exportTable).not.toHaveBeenCalled();
  });

  it('aborts the in-flight directory request and stops pagination/download', async () => {
    const controller = new AbortController();
    const pendingPage = queryResult(null);
    pendingPage.unwrap.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          pendingPage.abort.mockImplementation(() =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        })
    );
    rpc.dispatch.mockReturnValueOnce(pendingPage);
    const { result } = renderHook(() => useStudentDirectoryExport(input));
    const pending = result.current({ ...request, signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(pendingPage.abort).toHaveBeenCalledOnce();
    expect(pendingPage.unsubscribe).toHaveBeenCalledOnce();
    expect(rpc.dispatch).toHaveBeenCalledOnce();
    expect(rpc.exportTable).not.toHaveBeenCalled();
  });

  it('does not issue a request for a pre-aborted export or a missing academic year', async () => {
    const controller = new AbortController();
    controller.abort();
    const { result, rerender } = renderHook(({ query }) => useStudentDirectoryExport(query), {
      initialProps: { query: input },
    });
    await expect(result.current({ ...request, signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
    rerender({ query: { ...input, academicYearId: '' } });
    await expect(result.current(request)).rejects.toThrow('academic year');
    expect(rpc.dispatch).not.toHaveBeenCalled();
  });

  it('rejects an oversized PDF before loading every page', async () => {
    rpc.dispatch.mockReturnValueOnce(queryResult(resultPage([student('one')], 10001)));
    const { result } = renderHook(() => useStudentDirectoryExport(input));
    await expect(result.current({ ...request, format: 'pdf' })).rejects.toThrow('PDF');
    expect(rpc.dispatch).toHaveBeenCalledOnce();
    expect(rpc.exportTable).not.toHaveBeenCalled();
  });
});
