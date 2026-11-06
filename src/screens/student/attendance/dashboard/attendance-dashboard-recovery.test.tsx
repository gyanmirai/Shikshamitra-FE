import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import StudentAttendanceDashboardScreen from './index';
import { renderAttendanceErrorRecovery } from '../attendance-toast-test-fixture';

const summary = vi.hoisted(() => ({ retry: vi.fn(), historyArgs: vi.fn(), failure: true }));
beforeEach(() => {
  summary.failure = true;
  summary.historyArgs.mockClear();
});
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/redux/student', () => ({
  useGetStudentAttendanceDashboardSummaryQuery: () => ({
    data: summary.failure
      ? undefined
      : {
          recordedDays: 1,
          expectedDays: 1,
          classes: [
            { standardId: 'class', name: '1', divisions: [{ divisionId: 'division', name: 'A' }] },
          ],
        },
    isLoading: false,
    isFetching: false,
    isError: summary.failure,
    refetch: summary.retry,
  }),
  useGetStudentsByDivisionQuery: () => ({
    data: { items: [{ studentId: 'student', studentName: 'Riya' }] },
    isLoading: false,
  }),
  useGetStudentAttendanceHistoryQuery: (input: unknown) => {
    summary.historyArgs(input);
    return {
      data: { items: [{ date: '2026-11-06' }], totalCount: 1 },
      isLoading: false,
      isFetching: false,
    };
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Attendance Dashboard</h1>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({
    label,
    value,
    format,
    onChange,
  }: {
    label: string;
    value: Dayjs | null;
    format?: string;
    onChange: (value: Dayjs) => void;
  }) => (
    <input
      aria-label={label}
      value={value?.format(format || 'MM/DD/YYYY') || ''}
      onChange={(event) => onChange(dayjs(event.target.value))}
    />
  ),
}));
vi.mock('src/components/student-popover', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: { date: string }[] }) => (
    <div>
      {data.map((row) => (
        <span key={row.date}>{row.date}</span>
      ))}
    </div>
  ),
}));

it('retries the attendance summary from its error toast without showing a successful empty state', async () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentAttendanceDashboardScreen />
    </ThemeProvider>
  );
  await expectStudentErrorToast('Attendance summary could not be loaded.');
  expect(screen.queryByText('No attendance summary found.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  const recovery = renderAttendanceErrorRecovery();
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(summary.retry).toHaveBeenCalledOnce();
});

it('displays numeric history dates while retaining ISO history query boundaries and the month label', () => {
  summary.failure = false;
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentAttendanceDashboardScreen />
    </ThemeProvider>
  );
  fireEvent.change(screen.getByLabelText('Select Month'), { target: { value: '2026-11-06' } });
  expect(screen.getByLabelText('Select Month')).toHaveValue('Nov');
  fireEvent.click(screen.getByRole('button', { name: 'View class 1, division A' }));
  fireEvent.click(screen.getByText('Riya'));
  expect(screen.getByText('06/11/2026')).toBeVisible();
  expect(screen.getByLabelText('Start Date')).toHaveValue('01/11/2026');
  expect(screen.getByLabelText('End Date')).toHaveValue('30/11/2026');
  expect(summary.historyArgs).toHaveBeenLastCalledWith(
    expect.objectContaining({
      studentId: 'student',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
    })
  );
});
