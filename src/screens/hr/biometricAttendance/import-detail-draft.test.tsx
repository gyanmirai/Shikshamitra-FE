import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ImportDetailDialog } from './index';

const state = vi.hoisted(() => ({
  rows: {} as any,
  table: {} as any,
  operational: {} as any,
  request: {} as any,
  save: vi.fn(),
  refetch: vi.fn(),
  close: vi.fn(),
  closeHandler: null as (() => void) | null,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock(
  'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails',
  () => ({ InfoItem: () => null })
);
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: (request: any) => {
    state.request = request;
    return { ...state.operational, refetch: state.refetch };
  },
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, params }: any) =>
    type === 'mutation'
      ? [state.save]
      : params?.skipCount !== undefined
        ? { data: state.rows, isLoading: false, isFetching: false, refetch: state.refetch }
        : { data: { id: 'batch' }, isLoading: false },
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: () => null,
  renderTimeViewClock: vi.fn(),
  TimePicker: ({ value, onChange, disabled }: any) => (
    <input
      aria-label="Edit import time"
      disabled={disabled}
      value={value?.format('HH:mm') || ''}
      onChange={(event) => onChange(dayjs(`1970-01-01T${event.target.value}`))}
    />
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onClose, action, title }: any) =>
    open ? (
      <div role="alertdialog" aria-label={title}>
        <button onClick={onClose} type="button">
          Keep editing
        </button>
        {action}
      </div>
    ) : null,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return (
      <div>
        <input
          aria-label="Table search"
          disabled={props.searchFieldProps?.disabled}
          onChange={(event) => props.onServerSearch(event.target.value)}
        />
        <button
          type="button"
          onClick={() =>
            props.onServerSort('employeeName', [{ column: 'employeeName', direction: 'asc' }])
          }
        >
          Query sort
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter([{ column: 'employeeName', type: 'contains', value: 'other' }])
          }
        >
          Query filter
        </button>
        <button type="button" onClick={() => props.onServerPagination(2, 20)}>
          Query page
        </button>
        {props.data.map((row: any) => (
          <div key={row.id} data-testid={row.id}>
            {row.employeeName}
            {row.timeIn}
            {typeof row.attendanceStatus === 'number'
              ? ['Present', 'Absent', 'HalfDay'][row.attendanceStatus]
              : row.attendanceStatus}
            {props.columns
              .find((col: any) => col.id === 'attendanceStatus')
              ?.render(row.attendanceStatus, row)}
            {props.columns.find((col: any) => col.id === 'timeIn')?.render(row.timeIn, row)}
          </div>
        ))}
      </div>
    );
  },
}));
const originalRows = () => ({
  items: [
    {
      id: 'row-1',
      rowNumber: 1,
      employeeId: 'employee-1',
      employeeName: 'Synthetic staff',
      employeeCode: 'SYN-1',
      attendanceDate: '2026-10-26',
      timeIn: '09:00',
      timeOut: '17:00',
      statusCode: 0,
      status: 'Present',
      errors: [],
      warnings: [],
    },
  ],
  totalCount: 45,
});
const mount = () =>
  render(
    <ImportDetailDialog
      importData={{ id: 'batch' } as any}
      onClose={state.close}
      registerCloseHandler={(handler) => {
        state.closeHandler = handler;
      }}
    />,
    {
      wrapper: ({ children }) => (
        <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
      ),
    }
  );

beforeEach(() => {
  state.rows = originalRows();
  state.operational = { isFetching: false, currentData: undefined };
  state.save.mockReset();
  state.refetch.mockReset();
  state.close.mockReset();
  state.closeHandler = null;
});

it('locks all query changes and ignores a background result without losing the edited row or page', () => {
  const view = mount();
  state.operational = { currentData: originalRows(), isFetching: false };
  fireEvent.click(screen.getByText('Query sort'));
  fireEvent.click(screen.getByRole('button', { name: 'Mark Absent for Synthetic staff' }));
  expect(state.table.paginationDisabled).toBe(true);
  expect(screen.getByRole('textbox', { name: 'Table search' })).toBeDisabled();
  expect(state.table.serverColumnTypes).toEqual({});
  fireEvent.click(screen.getByText('Query sort'));
  act(() =>
    state.table.onServerSort('employeeName', [{ column: 'employeeName', direction: 'desc' }])
  );
  fireEvent.click(screen.getByText('Query filter'));
  fireEvent.click(screen.getByText('Query page'));
  act(() => state.table.onServerSearch('other'));
  expect(state.request).toMatchObject({
    offset: 0,
    criteria: { search: '', filters: [], sorts: [{ column: 'employeeName', direction: 'asc' }] },
  });
  state.rows = {
    items: [{ ...originalRows().items[0], employeeName: 'Background replacement' }],
    totalCount: 1,
  };
  state.operational = { currentData: state.rows, isFetching: false };
  view.rerender(<ImportDetailDialog importData={{ id: 'batch' } as any} onClose={state.close} />);
  expect(screen.getByTestId('row-1')).toHaveTextContent('Synthetic staff09:00Absent');
  expect(state.table.totalCount).toBe(45);
});

it('locks an open time editor, keeps its value on refresh, and cancel releases only the editor', () => {
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Edit In Time' }));
  fireEvent.change(screen.getByLabelText('Edit import time'), { target: { value: '10:25' } });
  expect(state.table.paginationDisabled).toBe(true);
  state.rows = originalRows();
  view.rerender(<ImportDetailDialog importData={{ id: 'batch' } as any} onClose={state.close} />);
  expect(screen.getByLabelText('Edit import time')).toHaveValue('10:25');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel In Time edit' }));
  expect(screen.getByTestId('row-1')).toHaveTextContent('09:00Present');
  expect(state.table.paginationDisabled).toBe(false);
  expect(screen.getByRole('textbox', { name: 'Table search' })).toBeEnabled();
});

it('freezes editing/query/discard/exit while saving and allows a global query after successful save', async () => {
  let finish!: (result: unknown) => void;
  state.save.mockReturnValue({
    unwrap: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  state.refetch.mockResolvedValue({
    data: { ...originalRows(), items: [{ ...originalRows().items[0], timeIn: '10:25' }] },
  });
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Edit In Time' }));
  fireEvent.change(screen.getByLabelText('Edit import time'), { target: { value: '10:25' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(state.save).toHaveBeenCalledWith(
    expect.objectContaining({
      entries: [expect.objectContaining({ rowId: 'row-1', inTime: '10:25' })],
    })
  );
  expect(state.table.paginationDisabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Mark Absent for Synthetic staff' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Discard changes' })).toBeDisabled();
  act(() => state.closeHandler?.());
  expect(state.close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Query sort'));
  expect(state.request.criteria.sorts).toEqual([]);
  await act(async () => finish({ upsertedCount: 1 }));
  expect(state.table.paginationDisabled).toBe(false);
  expect(screen.getByTestId('row-1')).toHaveTextContent('10:25Present');
  state.operational = {
    currentData: { items: [{ ...originalRows().items[0], timeIn: '10:25' }], totalCount: 1 },
    isFetching: false,
  };
  fireEvent.click(screen.getByText('Query sort'));
  expect(state.request.criteria.sorts).toEqual([{ column: 'employeeName', direction: 'asc' }]);
  expect(screen.getByTestId('row-1')).toHaveTextContent('10:25Present');
});

it('applies the explicit post-save matching population when the saved row leaves an active filter', async () => {
  state.save.mockReturnValue({ unwrap: async () => ({ upsertedCount: 1 }) });
  state.refetch.mockResolvedValue({ data: { items: [], totalCount: 0 } });
  mount();
  state.operational = { currentData: originalRows(), isFetching: false };
  act(() =>
    state.table.onServerFilter([{ column: 'attendanceStatus', type: 'equals', value: 'Present' }])
  );
  fireEvent.click(screen.getByRole('button', { name: 'Mark Absent for Synthetic staff' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
  expect(state.table.data).toEqual([]);
  expect(state.table.totalCount).toBe(0);
  expect(state.table.paginationDisabled).toBe(false);
  expect(state.request.criteria.filters).toEqual([
    { column: 'attendanceStatus', type: 'equals', value: 'Present' },
  ]);
});

it('keeps edits after a rejected save, and only explicit confirmed discard restores them', async () => {
  state.save.mockReturnValue({
    unwrap: async () => {
      throw new Error('Synthetic save failed');
    },
  });
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mark Absent for Synthetic staff' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
  expect(screen.getByTestId('row-1')).toHaveTextContent('09:00Absent');
  expect(state.table.paginationDisabled).toBe(true);
  act(() => state.closeHandler?.());
  fireEvent.click(screen.getByText('Keep editing'));
  expect(state.close).not.toHaveBeenCalled();
  expect(screen.getByTestId('row-1')).toHaveTextContent('Absent');
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Discard changes' })[1]);
  expect(screen.getByTestId('row-1')).toHaveTextContent('09:00Present');
  expect(state.table.paginationDisabled).toBe(false);
  act(() => state.closeHandler?.());
  expect(state.close).toHaveBeenCalledOnce();
});
