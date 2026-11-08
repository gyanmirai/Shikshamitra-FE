import React from 'react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import AttendanceTrackingScreen from './index';

const state = vi.hoisted(() => ({
  rows: [] as any[],
  adjust: vi.fn(),
  bulk: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (read: any) => read({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('src/utils/icons', () => ({ GlobalIcons: {} }));
vi.mock('src/constants/hr-menus', () => ({ hrPaths: { attendance: { dashboard: '/hr' } } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/custom-tooltip', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/paginated-search-select', () => ({ PaginatedSearchSelect: () => null }));
vi.mock('src/components/custom-date-range-picker', () => ({ CustomDateRangePicker: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: any) => action,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: state.success, error: state.error },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/screens/hr/utils/table-values', () => ({ durationHours: () => 0 }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeQuery: () => [vi.fn()] }));
vi.mock('src/screens/hr/hooks/useAcademicOrganizationOptions', () => ({
  useAcademicOrganizationOptions: () => ({ options: [], isLoading: false }),
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/screens/hr/hooks/use-hr-table-query', () => ({
  useHrTableQuery: (_: any, query: any) => ({ ...query, tableProps: {} }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => currentQueryAndMutation(),
}));
vi.mock('src/redux/hr/attendanceApi', () => ({
  useGetGroupedAttendanceRegisterQuery: () => ({
    currentData: { items: state.rows, totalCount: state.rows.length },
  }),
  useAdjustAttendanceRegisterMutation: () => [state.adjust, { isLoading: false }],
  useBulkAdjustAttendanceRegisterMutation: () => [state.bulk, { isLoading: false }],
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <div>
      {data.map((row: any, index: number) => (
        <div key={index}>
          {columns.find((column: any) => column.id === 'actions')?.render?.(null, row)}
          {columns.find((column: any) => column.id === 'employeeName')?.children?.(row)}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('@mui/material', () => {
  const Container = ({ children, role }: any) => <div role={role}>{children}</div>;
  const Button = ({ children, onClick, disabled, 'aria-label': label }: any) => (
    <button type="button" disabled={disabled} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
  return {
    Box: Container,
    Stack: Container,
    Typography: Container,
    DialogActions: Container,
    FormControl: Container,
    Button,
    IconButton: Button,
    Divider: () => null,
    Chip: () => null,
    Checkbox: () => null,
    Collapse: ({ in: open, children }: any) => (open ? children : null),
    InputLabel: () => null,
    MenuItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    Select: ({ label, value, onChange, children }: any) => (
      <select aria-label={label} value={value} onChange={onChange}>
        {children}
      </select>
    ),
    TextField: ({ label, value, onChange }: any) => (
      <input aria-label={label} value={value} onChange={onChange} />
    ),
  };
});
vi.mock('@mui/x-date-pickers', () => ({
  TimePicker: ({ label, slotProps }: any) => (
    <div>
      <input aria-label={label} />
      <span>{slotProps?.textField?.helperText}</span>
    </div>
  ),
  renderTimeViewClock: vi.fn(),
}));

const day = (captureMode: string, overrides = {}) => ({
  attendanceId: 'attendance-1',
  employeeId: 'employee-1',
  employeeName: 'Synthetic staff',
  employeeCode: 'SYN-1',
  attendanceDate: '2026-10-01',
  payrollMonth: '2026-10',
  status: 'Present',
  captureMode,
  canEdit: true,
  isDayLocked: false,
  isPayrollLocked: false,
  ...overrides,
});
const show = (days: any[]) => {
  state.rows = [
    {
      employeeId: 'employee-1',
      employeeName: 'Synthetic staff',
      employeeCode: 'SYN-1',
      recordedDays: days.length,
      present: days.length,
      halfDay: 0,
      absent: 0,
      editable: days.length,
      locked: 0,
      missingPunch: 0,
      hasExceptions: false,
      days,
    },
  ];
  render(<AttendanceTrackingScreen />);
};
const openSingle = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Adjust', exact: true }));

beforeEach(() => {
  vi.clearAllMocks();
  state.adjust.mockImplementation(() => ({
    unwrap: async () => ({ updatedCount: 1, skippedCount: 0, rows: [{ updated: true }] }),
  }));
  state.bulk.mockImplementation(() => ({
    unwrap: async () => ({ updatedCount: 1, skippedCount: 0 }),
  }));
});
afterEach(cleanup);

it('saves a status-only single adjustment without requiring or sending punch times', async () => {
  show([day('manual_status')]);
  openSingle();
  expect(screen.queryByLabelText('In time')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(state.adjust).toHaveBeenCalledWith(
      expect.objectContaining({
        attendanceId: 'attendance-1',
        statusWire: 'PRESENT',
        inTime: null,
        outTime: null,
      })
    )
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(state.success).toHaveBeenCalledWith({ message: 'Attendance adjusted.' });
});

it('retains a skipped single-row draft and shows the reason, then closes after a confirmed retry', async () => {
  state.adjust.mockImplementationOnce(() => ({
    unwrap: async () => ({
      updatedCount: 0,
      skippedCount: 1,
      rows: [{ updated: false, reason: 'Payroll is locked.' }],
    }),
  }));
  show([day('manual_status')]);
  openSingle();
  fireEvent.change(screen.getByLabelText('Remarks'), { target: { value: 'Keep this correction' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Payroll is locked.'));
  expect((screen.getByLabelText('Remarks') as HTMLInputElement).value).toBe('Keep this correction');
  expect(state.success).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(state.adjust).toHaveBeenCalledTimes(2);
});

it('sends an all-unmarked status-only bulk selection using employeeDates with no times', async () => {
  show([day('manual_status', { attendanceId: null, status: 'NotMarked' })]);
  fireEvent.click(screen.getByRole('button', { name: 'Adjust attendance for Synthetic staff' }));
  expect(screen.queryByLabelText('In time')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(state.bulk).toHaveBeenCalledWith(
      expect.objectContaining({
        attendanceIds: [],
        employeeDates: [{ employeeId: 'employee-1', attendanceDate: '2026-10-01' }],
        inTime: null,
        outTime: null,
      })
    )
  );
});

it('still requires punch times when a bulk selection contains an editable time-based day', () => {
  show([
    day('manual_status'),
    day('manual_with_time', { attendanceId: 'attendance-2', attendanceDate: '2026-10-02' }),
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Adjust attendance for Synthetic staff' }));
  expect(screen.getByLabelText('In time')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('In time is required.')).toBeTruthy();
  expect(state.bulk).not.toHaveBeenCalled();
});
