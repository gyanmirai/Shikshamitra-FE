import type { AttendanceDay } from 'src/redux/student/take-attendance/attendance-types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import TakeAttendanceScreen from './index';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams('date=2026-09-30&organization=level&class=class&division=division'),
  replace: vi.fn(),
  push: vi.fn(),
  refetch: vi.fn(),
  mark: vi.fn(),
  lock: vi.fn(),
  unlock: vi.fn(),
  query: {} as Record<string, unknown>,
  context: {} as Record<string, unknown>,
  workspace: {} as Record<string, unknown>,
  workspaceArgs: vi.fn(),
  tableProps: vi.fn(),
  globalReady: true,
  permissions: [{ name: 'Students.Attendance.MarkAttendance.Add', isGranted: true }],
  queryArgs: vi.fn(),
  queryOptions: vi.fn(),
  workspaceOptions: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  usePathname: () => '/student/attendance/take-attendance',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      globalState: {
        currentYear: {
          id: 'year',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          boards: [
            {
              id: 'board',
              name: 'CBSE',
              educationMediums: [
                {
                  id: 'medium',
                  name: 'English',
                  educationMediumStages: [
                    {
                      id: 'level',
                      name: 'Primary',
                      standards: [
                        {
                          id: 'class',
                          name: 'Class 1',
                          divisions: [{ id: 'division', name: 'A' }],
                        },
                      ],
                    },
                  ],
                },
                { id: 'medium-2', name: 'Hindi', educationMediumStages: [] },
              ],
            },
            { id: 'board-2', name: 'State Board', educationMediums: [] },
          ],
        },
        currentBoard: { id: 'board', name: 'CBSE' },
        currentMedium: {
          id: 'medium',
          educationMediumStages: [
            {
              id: 'level',
              name: 'Primary',
              standards: [
                { id: 'class', name: 'Class 1', divisions: [{ id: 'division', name: 'A' }] },
              ],
            },
          ],
        },
        ...(!mocks.globalReady ? { currentYear: {}, currentBoard: {}, currentMedium: {} } : {}),
      },
      auth: { permissions: mocks.permissions },
    }),
}));
vi.mock('src/redux/student/take-attendance/take-attendace-api', () => ({
  useGetAttendanceContextQuery: () => mocks.context,
  useGetAttendanceWorkspaceQuery: (args: unknown, options: unknown) => {
    mocks.workspaceArgs(args);
    mocks.workspaceOptions(options);
    return mocks.workspace;
  },
  useGetAttendanceByFilterQuery: (args: unknown, options: unknown) => {
    mocks.queryArgs(args);
    mocks.queryOptions(options);
    return mocks.query;
  },
  useMarkAttendanceMutation: () => [mocks.mark, { isLoading: false }],
  useLockAttendanceMutation: () => [mocks.lock, { isLoading: false }],
  useUnlockAttendanceMutation: () => [mocks.unlock, { isLoading: false }],
}));
vi.mock('src/hooks/use-student-academic-scope', () => {
  const currentMedium = {
    id: 'medium',
    name: 'English',
    educationMediumStages: [
      {
        id: 'level',
        name: 'Primary',
        standards: [{ id: 'class', name: 'Class 1', divisions: [{ id: 'division', name: 'A' }] }],
      },
    ],
  };
  const currentBoard = {
    id: 'board',
    name: 'CBSE',
    educationMediums: [currentMedium, { id: 'medium-2', name: 'Hindi', educationMediumStages: [] }],
  };
  const currentYear = {
    id: 'year',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    boards: [currentBoard, { id: 'board-2', name: 'State Board', educationMediums: [] }],
  };
  return {
    useStudentAcademicScope: () => ({
      currentYear,
      currentMedium,
      currentBoard,
      boards: [currentBoard],
      mediums: [currentMedium],
      isError: false,
    }),
  };
});
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: string; action?: React.ReactNode }) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    onChange,
    options,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { id: string; name: string }[];
    disabled: boolean;
  }) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({
    value,
    onChange,
  }: {
    value: { format: (value: string) => string };
    onChange: (value: unknown) => void;
  }) => (
    <input
      aria-label="Date"
      value={value.format('YYYY-MM-DD')}
      onChange={(event) => onChange({ isValid: () => true, format: () => event.target.value })}
    />
  ),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({
    directActions,
  }: {
    directActions: { id: string; label: string; disabled: boolean; onClick: () => void }[];
  }) => (
    <>
      {directActions.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-label={action.label}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('./attendance-details-dialog', () => ({ default: () => null }));
vi.mock('./attendance-correction-dialog', () => ({
  default: () => (
    <div role="dialog" aria-label="Request attendance correction">
      Request attendance correction
    </div>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    action,
    onClose,
  }: {
    open: boolean;
    title: string;
    action: React.ReactNode;
    onClose: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {action}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (proceed: () => void) => proceed(),
    confirmation: null,
  }),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
    isLoading,
    wrapperProps,
    tableContainerProps,
    noDataText,
    errorContent,
    ...rest
  }: {
    data: Record<string, unknown>[];
    columns: { id: string; render?: (value: unknown, row: unknown) => React.ReactNode }[];
    isLoading: boolean;
    wrapperProps: { sx: { height: number; minHeight: number } };
    tableContainerProps: { sx: { height: number } };
    noDataText: React.ReactNode;
    errorContent?: React.ReactNode;
    [key: string]: unknown;
  }) => {
    mocks.tableProps({ columns, data, ...rest });
    return (
      <div
        data-testid="register"
        data-height={wrapperProps.sx.height}
        data-minheight={wrapperProps.sx.minHeight}
        data-containerheight={tableContainerProps.sx.height}
      >
        {errorContent ||
          (isLoading
            ? 'Loading register'
            : data.length
              ? data.map((row) => (
                  <div key={String(row.studentId)}>
                    {columns.map((column) => (
                      <div key={column.id}>{column.render?.(row[column.id], row)}</div>
                    ))}
                  </div>
                ))
              : noDataText)}
      </div>
    );
  },
}));

const day = (patch: Partial<AttendanceDay> = {}): AttendanceDay => ({
  date: '2026-09-30',
  isLocked: false,
  isSubmitted: false,
  revision: 'first',
  rosterRevision: 'roster',
  canMark: true,
  canSubmit: true,
  canLock: true,
  isExpected: true,
  policy: { allowLate: true, allowHalfDay: true, lateCredit: 1, halfDayCredit: 0.5 },
  students: [
    {
      studentId: 'one',
      enrollmentId: 'e-one',
      firstName: 'Aarav',
      status: 0,
      isExpected: true,
      late: false,
      halfDay: false,
    },
    {
      studentId: 'two',
      enrollmentId: 'e-two',
      firstName: 'Meera',
      status: 0,
      isExpected: true,
      late: false,
      halfDay: false,
    },
  ],
  ...patch,
});
beforeEach(() => {
  mocks.globalReady = true;
  vi.clearAllMocks();
  mocks.params = new URLSearchParams(
    'date=2026-09-30&organization=level&class=class&division=division'
  );
  mocks.permissions = [
    { name: 'Students.Attendance.MarkAttendance.Add', isGranted: true },
    { name: 'Students.Attendance.MarkAttendance.Delete', isGranted: true },
  ];
  mocks.context = {
    currentData: {
      isAdmin: true,
      schoolToday: '2026-09-30',
      canManageLock: true,
      options: {
        academicYears: [{ id: 'year', name: '2026' }],
        boards: [
          { id: 'board', name: 'CBSE' },
          { id: 'board-2', name: 'State Board' },
        ],
        mediums: [
          { id: 'medium', name: 'English', parentId: 'board' },
          { id: 'medium-2', name: 'Hindi', parentId: 'board' },
        ],
        standards: [{ id: 'class', name: 'Class 1', parentId: 'medium' }],
        divisions: [{ id: 'division', name: 'A', parentId: 'class' }],
      },
      assignedClasses: [],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  };
  mocks.workspace = {
    currentData: { items: [], totalCount: 0 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  };
  mocks.query = {
    currentData: day(),
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  };
  mocks.mark.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ revision: 'saved', isSubmitted: false }),
  }));
});
describe('Daily Attendance workspace', () => {
  it('restores the requested class register when the shell academic context hydrates after reload', async () => {
    mocks.globalReady = false;
    const view = render(<TakeAttendanceScreen />);
    mocks.globalReady = true;
    view.rerender(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(screen.getByLabelText('Class')).toHaveValue('class');
    expect(screen.getByLabelText('Division')).toHaveValue('division');
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it('keeps Attendance rightmost and sticky without an actions column or Draft breadcrumb', async () => {
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    const columns = mocks.tableProps.mock.calls.at(-1)![0].columns;
    expect(columns.at(-1)).toMatchObject({
      id: 'statusLabel',
      label: 'Attendance',
      sticky: true,
      stickyPosition: 'right',
    });
    expect(columns.some((column: { id: string }) => ['actions', 'edit'].includes(column.id))).toBe(
      false
    );
    expect(screen.getByRole('banner')).not.toHaveTextContent('Draft');
    expect(
      screen.queryByRole('button', { name: /Edit attendance details/ })
    ).not.toBeInTheDocument();
  });
  it('shows optional inline remarks for Absent and includes them in the saved row', async () => {
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(screen.queryByRole('textbox', { name: 'Remarks: Aarav' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Absent: Aarav' }));
    const remarks = screen.getByRole('textbox', { name: 'Remarks: Aarav' });
    expect(remarks).toHaveAttribute('maxlength', '500');
    expect(remarks).not.toBeRequired();
    fireEvent.change(remarks, { target: { value: 'Unwell today' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0].entries).toContainEqual(
      expect.objectContaining({ studentId: 'one', status: 2, remarks: 'Unwell today' })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('accepts an absent mark without remarks', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Absent: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0].entries).toContainEqual(
      expect.objectContaining({ studentId: 'one', status: 2 })
    );
  });
  it('keeps remarks and all mark controls read-only on locked attendance', async () => {
    const register = day({ isLocked: true, canMark: false, canSubmit: false });
    register.students[0] = { ...register.students[0], status: 2, remarks: 'Medical leave' };
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('textbox', { name: 'Remarks: Aarav' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Remarks: Aarav' })).toHaveValue('Medical leave');
    expect(screen.getByText('Absent', { exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Present: Meera' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
  });
  it('does not submit a complete-looking search result when hidden students are still Pending', async () => {
    mocks.params = new URLSearchParams(
      'date=2026-09-30&class=class&division=division&search=Aarav'
    );
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Present: Aarav' }));
    expect(screen.queryByRole('button', { name: 'Present: Meera' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it.each([false, undefined])(
    'fails closed when submission capability is %s',
    async (canSubmit) => {
      const register = day({ canSubmit });
      register.students.forEach((row) => {
        row.status = 1;
      });
      mocks.query = { ...mocks.query, currentData: register };
      render(<TakeAttendanceScreen />);
      await screen.findByRole('button', { name: 'Present: Aarav' });
      expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
      expect(mocks.mark).not.toHaveBeenCalled();
    }
  );
  it('marks only editable pending students Present and preserves leave, absent, and ineligible rows', async () => {
    const register = day();
    register.students = [
      ...register.students,
      {
        ...register.students[0],
        studentId: 'leave',
        firstName: 'Leave student',
        approvedLeaveId: 'leave-id',
      },
      {
        ...register.students[0],
        studentId: 'ineligible',
        firstName: 'Not scheduled',
        isExpected: false,
        notExpectedReason: 'Attendance has not started',
      },
    ];
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Absent: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark pending as Present' }));
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Present: Meera' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Pending: Leave student' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Pending: Not scheduled' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Present: Not scheduled' })).toBeDisabled();
  });
  it('does not expose lock controls to teachers', async () => {
    mocks.context.currentData = {
      ...(mocks.context.currentData as object),
      isAdmin: false,
      canManageLock: false,
    };
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Lock attendance' })).not.toBeInTheDocument();
  });
  it('does not expose Lock without both the server capability and frontend permission', async () => {
    mocks.permissions = [{ name: 'Students.Attendance.MarkAttendance.Add', isGranted: true }];
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(screen.queryByRole('button', { name: 'Lock attendance' })).not.toBeInTheDocument();
  });
  it('requires an audit reason for changing submitted attendance without a correction queue', async () => {
    const register = day({ isSubmitted: true, attendanceDayId: 'day' });
    register.students.forEach((row) => {
      row.status = 1;
    });
    register.policy.sameDayCorrectionRequiresReason = true;
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Absent: Aarav' }));
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), {
      target: { value: 'Corrected after class confirmation' },
    });
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      correctionReason: 'Corrected after class confirmation',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('opens a teachers single assigned register when no academic filters are selected', async () => {
    mocks.params = new URLSearchParams('date=2026-09-30');
    mocks.context.currentData = {
      ...(mocks.context.currentData as object),
      isAdmin: false,
      canManageLock: false,
      assignedClasses: [{ standardId: 'class', divisionId: 'division' }],
    };
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(mocks.queryArgs).toHaveBeenLastCalledWith(
      expect.objectContaining({
        AcademicYearId: 'year',
        StandardId: 'class',
        DivisionId: 'division',
        Date: '2026-09-30',
      })
    );
    expect(screen.getByLabelText('Class')).toHaveValue('class');
    expect(screen.getByLabelText('Division')).toHaveValue('division');
  });
  it('starts admins with a broad read-only students table until a class and division are selected', async () => {
    mocks.params = new URLSearchParams('date=2026-09-30');
    mocks.workspace.currentData = { items: day().students, totalCount: 82 };
    render(<TakeAttendanceScreen />);
    await screen.findByText('Aarav');
    expect(screen.queryByRole('button', { name: 'Present: Aarav' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    expect(mocks.tableProps.mock.calls.at(-1)![0]).toMatchObject({
      serverSidePagination: true,
      serverSideSearch: true,
    });
    expect(mocks.workspaceArgs).toHaveBeenLastCalledWith(
      expect.objectContaining({
        academicYearId: 'year',
        date: '2026-09-30',
        skipCount: 0,
        maxResultCount: 25,
      })
    );
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it('preserves a recorded historical mark when the current placement is no longer applicable', async () => {
    mocks.params = new URLSearchParams('date=2026-09-30');
    const recorded = {
      ...day().students[0],
      isExpected: false,
      status: 2,
      remarks: 'Saved before division transfer',
      notExpectedReason: 'No eligible placement for this date',
    };
    mocks.workspace.currentData = { items: [recorded], totalCount: 1 };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByText('Absent')).toBeVisible();
    expect(screen.getByText('Not applicable')).toBeVisible();
    expect(screen.getByText('Saved before division transfer')).toBeVisible();
    expect(screen.queryByLabelText('Remarks: Aarav')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Present: Aarav' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it('restores legacy Roll number sorting in a class register and compares numeric values', async () => {
    mocks.params = new URLSearchParams(
      `date=2026-09-30&class=class&division=division&sorts=${encodeURIComponent(JSON.stringify([{ column: 'rollNo', direction: 'asc' }]))}`
    );
    const register = day();
    register.students[0].rollNo = 10;
    register.students[1].rollNo = 2;
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    const table = mocks.tableProps.mock.calls.at(-1)![0];
    expect(table.data.map((row: { studentId: string }) => row.studentId)).toEqual(['two', 'one']);
    expect(table.columns.find((column: { id: string }) => column.id === 'rollNo')).toMatchObject({
      isSort: true,
    });
    expect(table.sorts).toEqual([{ column: 'rollNo', direction: 'asc' }]);
  });
  it('does not send unsupported legacy Roll number sorting to the broad students API', async () => {
    mocks.params = new URLSearchParams(
      `date=2026-09-30&sorts=${encodeURIComponent(JSON.stringify([{ column: 'rollNo', direction: 'desc' }]))}`
    );
    mocks.workspace.currentData = { items: day().students, totalCount: 2 };
    render(<TakeAttendanceScreen />);
    await screen.findByText('Aarav');
    expect(mocks.workspaceArgs).toHaveBeenLastCalledWith(
      expect.objectContaining({ sorting: undefined })
    );
    const table = mocks.tableProps.mock.calls.at(-1)![0];
    expect(table.sorts).toEqual([]);
    expect(table.columns.find((column: { id: string }) => column.id === 'rollNo')).toMatchObject({
      isSort: false,
    });
  });
  it('shows four attendance choices and keeps half day behind the school policy', async () => {
    const register = day();
    register.policy.allowHalfDay = false;
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Present: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Half-day: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pending: Aarav' })).toBeEnabled();
  });
  it('enables present and absent for an eligible current-day roster', async () => {
    const date = '2026-09-30';
    mocks.params = new URLSearchParams(
      `date=${date}&organization=level&class=class&division=division`
    );
    mocks.query = { ...mocks.query, currentData: day({ date, canMark: true, isExpected: true }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Present: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeEnabled();
  });
  it('saves a half-day mark with present status and half-day credit', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Half-day: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      submit: false,
      entries: expect.arrayContaining([
        expect.objectContaining({ studentId: 'one', status: 1, halfDay: true, late: false }),
      ]),
    });
  });
  it('does not allow future attendance even when the URL contains a future date', async () => {
    mocks.params = new URLSearchParams(
      'date=2026-10-01&organization=level&class=class&division=division'
    );
    render(<TakeAttendanceScreen />);
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Attendance cannot be taken for a future date.'
    );

  });
  it('shows Student List filters and clears dependent choices when either changes', () => {
    mocks.params = new URLSearchParams(
      'date=2026-09-30&board=board&medium=medium&class=class&division=division'
    );
    render(<TakeAttendanceScreen />);
    expect(screen.getByLabelText('Board')).toHaveValue('board');
    expect(screen.getByLabelText('Medium')).toHaveValue('medium');
    expect(screen.queryByLabelText('School level')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Medium'), { target: { value: 'medium-2' } });
    expect(screen.getByLabelText('Class')).toHaveValue('all');
    expect(screen.getByLabelText('Division')).toHaveValue('all');
    expect(mocks.replace).toHaveBeenLastCalledWith(expect.stringContaining('medium=medium-2'), {
      scroll: false,
    });
    fireEvent.change(screen.getByLabelText('Board'), { target: { value: 'board-2' } });
    expect(screen.getByLabelText('Medium')).toHaveValue('all');
    expect(screen.getByLabelText('Class')).toHaveValue('all');
    expect(mocks.replace).toHaveBeenLastCalledWith(expect.stringContaining('board=board-2'), {
      scroll: false,
    });
  });
  it('preserves the leave-credit correction boundary without adding correction actions', async () => {
    const registered = day({ isSubmitted: true, needsReview: true, attendanceDayId: 'day' });
    registered.students[0] = {
      ...registered.students[0],
      status: 1,
      approvedLeaveId: 'leave',
      needsCreditCorrection: true,
    };
    registered.students[1].status = 1;
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByText('Leave correction needed')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Present: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Request attendance correction/ })
    ).not.toBeInTheDocument();
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it('saves other editable rows without including a submitted row needing leave-credit correction', async () => {
    const registered = day({ isSubmitted: true, needsReview: true, attendanceDayId: 'day' });
    registered.policy.sameDayCorrectionRequiresReason = false;
    registered.students[0] = {
      ...registered.students[0],
      status: 1,
      approvedLeaveId: 'leave',
      needsCreditCorrection: true,
    };
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Present: Meera' }));
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      submit: false,
      entries: [{ studentId: 'two', status: 1 }],
    });
    expect(mocks.mark.mock.calls[0][0].entries).toHaveLength(1);
  });
  it('keeps already-recorded rows read-only when approval is required while unmarked rows remain markable', async () => {
    mocks.permissions.push({ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true });
    const registered = day({ attendanceDayId: 'day' });
    registered.students[0] = {
      ...registered.students[0],
      status: 1,
      requiresCorrectionApproval: true,
    };
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Absent: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Present: Meera' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: /Request attendance correction/ })
    ).not.toBeInTheDocument();
  });
  it('keeps recorded readonly marks protected without a correction dialog', async () => {
    const registered = day({ canMark: false, canSubmit: false, attendanceDayId: 'day' });
    registered.students[0].status = 1;
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Absent: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Present: Meera' })).toBeDisabled();
    expect(
      screen.queryByRole('dialog', { name: 'Request attendance correction' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Request attendance correction/ })
    ).not.toBeInTheDocument();
  });
  it('allows complete submitted attendance to be reviewed and resubmitted when the server flags a changed roster', async () => {
    mocks.permissions.push({ name: 'Students.Attendance.MarkAttendance.Delete', isGranted: true });
    const registered = day({ isSubmitted: true, needsReview: true });
    registered.students.forEach((row) => {
      row.status = 1;
    });
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    expect(
      await screen.findByText('Roster changed after submission. Review and submit again.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit attendance' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
  });
  it('keeps heading and flex table geometry during initial loading', () => {
    mocks.query = { ...mocks.query, currentData: undefined, isLoading: true };
    render(<TakeAttendanceScreen />);
    expect(screen.getByRole('heading', { name: 'Daily Attendance' })).toBeVisible();
    expect(screen.getByText('Loading register')).toBeVisible();
    expect(screen.getByTestId('register')).toHaveAttribute('data-height', '1');
    expect(screen.getByTestId('register')).toHaveAttribute('data-minheight', '0');
  });
  it('shows loading instead of a false empty result while fetching a new filter selection', () => {
    mocks.params = new URLSearchParams('date=2026-09-30');
    mocks.workspace = {
      ...mocks.workspace,
      currentData: undefined,
      isLoading: false,
      isFetching: true,
    };
    render(<TakeAttendanceScreen />);
    expect(screen.getByText('Loading register')).toBeVisible();
    expect(screen.queryByText('No students match your search or filters.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  });
  it('saves a partial draft but requires the complete eligible roster before submit', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Present: Aarav' }));
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalled());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      submit: false,
      date: '2026-09-30',
      rosterRevision: 'roster',
      entries: [
        { studentId: 'one', status: 1 },
        { studentId: 'two', status: 0 },
      ],
    });
    expect(mocks.mark.mock.calls[0][0].operationId).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('submits complete attendance without locking the register', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Absent: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Present: Meera' }));
    expect(screen.getByRole('button', { name: 'Lock attendance' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit attendance' }));
    expect(screen.getByRole('dialog', { name: 'Submit Attendance?' })).toBeVisible();
    fireEvent.click(screen.getAllByRole('button', { name: 'Submit attendance' }).at(-1)!);
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledOnce());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      submit: true,
      entries: [
        { studentId: 'one', status: 2 },
        { studentId: 'two', status: 1 },
      ],
    });
    expect(mocks.lock).not.toHaveBeenCalled();
  });
  it('locks an already submitted complete register without submitting again', async () => {
    mocks.permissions.push({ name: 'Students.Attendance.MarkAttendance.Delete', isGranted: true });
    mocks.lock.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
    const registered = day({ isSubmitted: true, attendanceDayId: 'day' });
    registered.students.forEach((student) => {
      student.status = 1;
    });
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Lock attendance' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Lock attendance' }).at(-1)!);
    await waitFor(() => expect(mocks.lock).toHaveBeenCalledOnce());
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it('uses server authority for read-only marking and explains the boundary', async () => {
    mocks.query = { ...mocks.query, currentData: day({ canMark: false }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Present: Aarav' })).toBeDisabled();
    expect(screen.getByText(/This register is read-only/)).toBeVisible();
  });
  it('warns after cutoff while leaving authorized draft marking available', async () => {
    mocks.query = { ...mocks.query, currentData: day({ isPastMarkingCutoff: true }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByText(/school marking cutoff has passed/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Present: Aarav' })).toBeEnabled();
  });
  it.each([
    { isExpected: false, isSubmitted: false },
    { isExpected: true, isSubmitted: true },
  ])('does not warn about cutoff for completed or ineligible days: %j', async (flags) => {
    mocks.query = {
      ...mocks.query,
      currentData: day({ ...flags, isPastMarkingCutoff: true }),
    };
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    expect(screen.queryByText(/school marking cutoff has passed/)).not.toBeInTheDocument();
  });
  it('shows only the four mark choices for an ineligible day and disables them', async () => {
    const closed = day({ isExpected: false, canMark: false, notExpectedReason: 'Weather closure' });
    closed.students = closed.students.map((student) => ({
      ...student,
      isExpected: false,
      notExpectedReason: 'Weather closure',
    }));
    mocks.query = { ...mocks.query, currentData: closed };
    render(<TakeAttendanceScreen />);
    await screen.findByRole('button', { name: 'Present: Aarav' });
    ['Present', 'Half-day', 'Pending', 'Absent'].forEach((choice) => {
      expect(screen.getByRole('button', { name: `${choice}: Aarav` })).toBeDisabled();
    });
    expect(screen.queryByText('Not expected')).not.toBeInTheDocument();
  });
  it('preserves local marks when a refreshed roster conflicts with the draft', async () => {
    const view = render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Present: Aarav' }));
    mocks.query = {
      ...mocks.query,
      currentData: day({ revision: 'newer', rosterRevision: 'changed' }),
    };
    view.rerender(<TakeAttendanceScreen />);
    expect(screen.getByRole('button', { name: 'Present: Aarav' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByText(/roster changed after this draft/)).toBeVisible();
  });
  it('retains the failed draft and reuses the operation id on a safe retry', async () => {
    mocks.mark.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Connection interrupted'), {
            data: { detail: 'Connection interrupted' },
          })
        ),
    }));
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Present: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByText(/Connection interrupted/);
    expect(screen.getByRole('button', { name: 'Present: Aarav' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalledTimes(2));
    expect(mocks.mark.mock.calls[1][0].operationId).toBe(mocks.mark.mock.calls[0][0].operationId);
  });
  it('restores URL-selected date after history navigation', async () => {
    const view = render(<TakeAttendanceScreen />);
    mocks.params = new URLSearchParams(
      'date=2026-09-29&organization=level&class=class&division=division'
    );
    await act(async () => view.rerender(<TakeAttendanceScreen />));
    expect(screen.getByLabelText('Date')).toHaveValue('2026-09-29');
    expect(mocks.queryArgs).toHaveBeenLastCalledWith(
      expect.objectContaining({ Date: '2026-09-29' })
    );
  });
  it('shows failed reads as errors with a retry rather than a successful empty register', () => {
    mocks.query = {
      ...mocks.query,
      currentData: undefined,
      isError: true,
      error: { data: { detail: 'Unavailable' } },
    };
    render(<TakeAttendanceScreen />);
    expect(screen.getByText(/Attendance could not be loaded. Unavailable/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
