import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import AttendanceType from './attendance-type';
import { renderAttendanceErrorRecovery } from '../attendance-toast-test-fixture';

const state = vi.hoisted(() => ({
  table: vi.fn(),
  query: vi.fn(),
  retry: vi.fn(),
  failure: false,
}));
beforeEach(() => {
  state.failure = false;
  state.retry.mockClear();
});

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
    return <div>{props.errorContent || props.noDataText}</div>;
  },
}));
vi.mock('src/redux/student/attendance-type/attendance-type-api', () => ({
  useGetStudentAttendanceTypeQuery: (input: unknown) => {
    state.query(input);
    return {
      currentData: state.failure ? undefined : { items: [], totalCount: 0 },
      isLoading: false,
      isError: state.failure,
      error: { data: { detail: 'Leave types service unavailable' } },
      refetch: state.retry,
    };
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

it('does not present a failed leave-type read as an empty collection', async () => {
  state.failure = true;
  render(<AttendanceType />);
  await expectStudentErrorToast('Leave types service unavailable');
  expect(screen.getByLabelText('Leave types unavailable')).toBeInTheDocument();
  expect(screen.queryByText('No leave types have been added yet.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  const recovery = renderAttendanceErrorRecovery();
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(state.retry).toHaveBeenCalledOnce();
});

it('displays numeric leave-type dates without changing the list query', () => {
  render(<AttendanceType />);
  const table = state.table.mock.lastCall?.[0] as ICustomizableTableProps;
  const updated = table.columns.find((column) => column.id === 'lastUpdatedAt');
  expect(updated?.render?.('2026-11-06T00:00:00', {})).toBe('06/11/2026');
  expect(updated?.render?.(null, {})).toBe('\u2014');
  expect(state.query).toHaveBeenCalledWith(
    expect.objectContaining({ skipCount: 0, maxResultCount: 10 })
  );
});
