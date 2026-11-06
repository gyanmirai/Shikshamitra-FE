import type { ReactNode } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { screen, render as renderUi } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import AttendanceReportScreen from './index';

const render = (ui: ReactNode) =>
  renderUi(<LocalizationProvider dateAdapter={AdapterDayjs}>{ui}</LocalizationProvider>);

const state = vi.hoisted(() => ({
  year: 'year-1',
  medium: 'medium-1',
  params: new URLSearchParams('from=2026-09-01&to=2026-09-30'),
  result: {
    rows: [
      {
        studentId: 'student-1',
        enrollmentId: 'enrollment-1',
        fullName: 'Aarav Sharma',
        expectedDays: 20,
        recordedDays: 18,
        missingDays: 2,
        presentCredit: 17,
        percentage: 94.44444 as number | null,
        isProvisional: true,
        isBelowThreshold: undefined as boolean | undefined,
        lowAttendanceThreshold: undefined as number | undefined,
      },
    ],
    totalCount: 1,
  },
  isError: false,
  refetch: vi.fn(),
  query: vi.fn(),
  table: vi.fn(),
}));

vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({
    currentYear: { id: state.year },
    currentBoard: { id: 'board-1' },
    currentMedium: { id: state.medium },
    params: state.params,
    standardId: '',
    divisionId: '',
    update: vi.fn(),
  }),
  AttendanceClassFilters: () => <div>Class filters</div>,
}));
vi.mock('src/redux/student/attendance-management/api', () => ({
  useGetAttendanceRegisterQuery: (args: unknown, options: { skip: boolean }) => {
    state.query(args, options);
    return {
      currentData: options.skip ? undefined : state.result,
      isLoading: false,
      isFetching: false,
      isError: state.isError,
      error: { data: { detail: 'Attendance service unavailable' } },
      refetch: state.refetch,
    };
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('./components/AttendanceAiReportButton', () => ({
  AttendanceAiReportButton: () => <button type="button">Generate with AI</button>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: {
    data: Record<string, unknown>[];
    noDataText: string;
    errorContent?: ReactNode;
  }) => {
    state.table(props);
    const { data, noDataText } = props;
    return (
      <div>
        {props.errorContent ||
          (data.length
            ? data.map((row) => (
                <div key={String(row.studentId)}>
                  {String(row.fullName)} {String(row.percentageLabel)} {String(row.completion)}{' '}
                  {String(row.calculationState)} {String(row.targetState)}
                </div>
              ))
            : noDataText)}
      </div>
    );
  },
}));

describe('canonical attendance register', () => {
  beforeEach(() => {
    state.year = 'year-1';
    state.medium = 'medium-1';
    state.params = new URLSearchParams('from=2026-09-01&to=2026-09-30');
    state.isError = false;
    state.result.rows[0].isBelowThreshold = undefined;
    state.result.rows[0].lowAttendanceThreshold = undefined;
    state.result.rows[0].expectedDays = 20;
    state.result.rows[0].recordedDays = 18;
    state.result.rows[0].missingDays = 2;
    state.result.rows[0].percentage = 94.44444;
    state.result.rows[0].isProvisional = true;
    vi.clearAllMocks();
  });
  it('shows the recorded percentage together with incomplete recording', () => {
    render(<AttendanceReportScreen />);
    expect(screen.getByText(/Aarav Sharma 94.44% 18\/20 Provisional/)).toBeInTheDocument();
    expect(state.query).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        boardId: 'board-1',
        educationMediumId: 'medium-1',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      }),
      { skip: false }
    );
  });
  it('uses Export as the button label without changing loaded-page report scope', () => {
    render(<AttendanceReportScreen />);
    expect(state.table).toHaveBeenCalledWith(
      expect.objectContaining({
        exportLabel: 'Export',
        serverSidePagination: true,
        rowsPerPage: 50,
        data: [expect.objectContaining({ studentId: 'student-1' })],
      })
    );
    expect(state.table.mock.lastCall?.[0].exportScope ?? 'loaded').toBe('loaded');
  });
  it('does not request attendance before school year context is ready', () => {
    state.year = '';
    render(<AttendanceReportScreen />);
    expect(state.query).toHaveBeenCalledWith(expect.anything(), { skip: true });
    expect(screen.getByText('Select an academic year to view attendance.')).toBeInTheDocument();
  });
  it('does not broaden a missing medium into a year-wide report request', () => {
    state.medium = '';
    render(<AttendanceReportScreen />);
    expect(state.query).toHaveBeenCalledWith(expect.anything(), { skip: true });
    expect(screen.getByText('Select a board and medium to view attendance.')).toBeInTheDocument();
  });
  it.each([
    { isProvisional: true, label: 'Provisional' },
    { isProvisional: false, label: 'Not expected' },
  ])(
    'shows $label for zero expected days with provisional=$isProvisional',
    ({ isProvisional, label }) => {
      Object.assign(state.result.rows[0], {
        expectedDays: 0,
        recordedDays: 0,
        missingDays: 0,
        percentage: null,
        isProvisional,
      });
      render(<AttendanceReportScreen />);
      expect(screen.getByText(new RegExp(`Aarav Sharma Not available 0/0 ${label}`))).toBeVisible();
      expect(
        screen.queryByText(new RegExp(isProvisional ? 'Not expected' : 'Provisional'))
      ).not.toBeInTheDocument();
    }
  );
  it('shows the server school-target warning alongside provisional attendance', () => {
    state.result.rows[0].isBelowThreshold = true;
    state.result.rows[0].lowAttendanceThreshold = 95;
    render(<AttendanceReportScreen />);
    expect(screen.getByText(/94.44% 18\/20 Provisional Below school target/)).toBeInTheDocument();
  });
  it('rejects impossible dates before sending them to the register', () => {
    state.params = new URLSearchParams('from=2026-02-30&to=2026-03-31');
    render(<AttendanceReportScreen />);
    expect(state.query).toHaveBeenCalledWith(expect.anything(), { skip: true });
    expect(screen.getByText(/Select a valid date range/)).toBeInTheDocument();
  });
  it('keeps report context and suppresses successful empty results after a service failure', async () => {
    state.isError = true;
    render(<AttendanceReportScreen />);
    expect(screen.getByRole('heading', { name: 'Attendance Reports' })).toBeInTheDocument();
    await expectStudentErrorToast('Attendance service unavailable');
    expect(
      screen.queryByText('No eligible students match this date range and class scope.')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Attendance report unavailable')).toBeInTheDocument();
  });
});
