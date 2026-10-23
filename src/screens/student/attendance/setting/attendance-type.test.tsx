import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { it, vi, expect } from 'vitest';
import { render } from '@testing-library/react';

import AttendanceType from './attendance-type';

const state = vi.hoisted(() => ({ table: vi.fn(), query: vi.fn() }));

vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Attendance Settings</h1>,
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: () => null,
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    state.table(props);
    return <div />;
  },
}));
vi.mock('src/redux/student/attendance-type/attendance-type-api', () => ({
  useGetStudentAttendanceTypeQuery: (input: unknown) => {
    state.query(input);
    return { currentData: { items: [], totalCount: 0 }, isLoading: false, isError: false };
  },
  useDeleteStudentAttendanceTypeMutation: () => [vi.fn(), { isLoading: false }],
  useAddStudentAttendanceTypeMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateStudentAttendanceTypeMutation: () => [vi.fn(), { isLoading: false }],
}));

it('uses Export for leave types without changing pagination or loaded-page scope', () => {
  render(<AttendanceType />);
  expect(state.table).toHaveBeenCalledWith(
    expect.objectContaining({
      exportLabel: 'Export',
      serverSidePagination: true,
      page: 0,
      rowsPerPage: 10,
    })
  );
  expect(state.table.mock.lastCall?.[0].exportScope ?? 'loaded').toBe('loaded');
  expect(state.query).toHaveBeenCalledWith(
    expect.objectContaining({ skipCount: 0, maxResultCount: 10 })
  );
});
