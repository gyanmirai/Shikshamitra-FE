import { renderHook } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';

import { useStudentICardRosterExport } from './use-student-icard-roster-export';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  initiate: vi.fn(),
  exportTable: vi.fn(),
}));

vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }));
vi.mock('src/redux/student/records/student-icard-assignment-api', () => ({
  studentICardAssignmentApi: {
    endpoints: { getICardAssignmentRoster: { initiate: mocks.initiate } },
  },
}));
vi.mock('src/components/customizabaleTable/table-export', () => ({
  exportTable: mocks.exportTable,
}));

const scope = {
  academicYearId: 'year',
  standardId: 'class',
  divisionId: 'division',
};
const criteria = {
  ...scope,
  search: 'Just typed',
  columnFilters: [{ column: 'hasValidIssuedCard', operator: 'equals', value: 'false' }],
};
const columns = [{ id: 'studentName', label: 'Student' }];
const student = (index: number) => ({
  studentId: `student-${index}`,
  studentName: `Student ${index}`,
});

beforeEach(() => {
  vi.resetAllMocks();
});

it('exports all filtered rows with the current template and visible columns', async () => {
  const page = (items: ReturnType<typeof student>[]) => ({
    unwrap: async () => ({ items, totalCount: 102 }),
    unsubscribe: vi.fn(),
  });
  const firstPage = page(Array.from({ length: 100 }, (_, index) => student(index)));
  const secondPage = page([student(100), student(101)]);
  mocks.dispatch.mockReturnValueOnce(firstPage).mockReturnValueOnce(secondPage);
  const { result } = renderHook(() =>
    useStudentICardRosterExport(scope, 'Students in Class 1', 'Blue')
  );
  // The visible search can change before the debounced roster request commits to the URL.
  await result.current({
    format: 'excel',
    columns,
    searchTerm: 'Just typed',
    filters: [{ column: 'hasValidIssuedCard', type: 'equals', value: false, valueType: 'enum' }],
    sorts: [],
  });

  expect(mocks.initiate.mock.calls.map(([input]) => input)).toEqual([
    { ...criteria, skipCount: 0, maxResultCount: 100 },
    { ...criteria, skipCount: 100, maxResultCount: 100 },
  ]);
  expect(mocks.exportTable).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ format: 'excel', tableTitle: 'Students in Class 1', columns })
  );
  const [{ rows }] = mocks.exportTable.mock.calls[0];
  expect(rows).toHaveLength(102);
  expect(rows.at(-1)).toEqual({ ...student(101), templateName: 'Blue' });
  expect(firstPage.unsubscribe).toHaveBeenCalledOnce();
  expect(secondPage.unsubscribe).toHaveBeenCalledOnce();
});

it('stops on an incomplete page and avoids downloading a partial file', async () => {
  mocks.dispatch.mockReturnValueOnce({
    unwrap: async () => ({ items: [], totalCount: 1 }),
    unsubscribe: vi.fn(),
  });
  const { result } = renderHook(() =>
    useStudentICardRosterExport({ academicYearId: 'year', standardId: 'class' }, 'Class 1', 'Blue')
  );
  await expect(
    result.current({ format: 'pdf', columns, searchTerm: '', filters: [], sorts: [] })
  ).rejects.toThrow('The class roster changed during export.');
  expect(mocks.exportTable).not.toHaveBeenCalled();
});
