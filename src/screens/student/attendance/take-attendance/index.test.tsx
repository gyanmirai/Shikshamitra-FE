import type { AttendanceDay } from 'src/redux/student/take-attendance/attendance-types';

import dayjs from 'dayjs';
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
  permissions: [{ name: 'Students.Attendance.MarkAttendance.Add', isGranted: true }],
  queryArgs: vi.fn(),
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
      },
      auth: { permissions: mocks.permissions },
    }),
}));
vi.mock('src/redux/student/take-attendance/take-attendace-api', () => ({
  useGetAttendanceByFilterQuery: (args: unknown) => {
    mocks.queryArgs(args);
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
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
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
  }: {
    data: Record<string, unknown>[];
    columns: { id: string; render?: (value: unknown, row: unknown) => React.ReactNode }[];
    isLoading: boolean;
    wrapperProps: { sx: { height: number; minHeight: number } };
    tableContainerProps: { sx: { height: number } };
    noDataText: React.ReactNode;
  }) => (
    <div
      data-testid="register"
      data-height={wrapperProps.sx.height}
      data-minheight={wrapperProps.sx.minHeight}
      data-containerheight={tableContainerProps.sx.height}
    >
      {isLoading
        ? 'Loading register'
        : data.length
          ? data.map((row) => (
              <div key={String(row.studentId)}>
                {columns.map((column) => (
                  <div key={column.id}>{column.render?.(row[column.id], row)}</div>
                ))}
              </div>
            ))
          : noDataText}
    </div>
  ),
}));

const day = (patch: Partial<AttendanceDay> = {}): AttendanceDay => ({
  date: '2026-09-30',
  isLocked: false,
  isSubmitted: false,
  revision: 'first',
  rosterRevision: 'roster',
  canMark: true,
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
  vi.clearAllMocks();
  mocks.params = new URLSearchParams(
    'date=2026-09-30&organization=level&class=class&division=division'
  );
  mocks.permissions = [{ name: 'Students.Attendance.MarkAttendance.Add', isGranted: true }];
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
  it('shows four attendance choices and keeps half day behind the school policy', async () => {
    const register = day();
    register.policy.allowHalfDay = false;
    mocks.query = { ...mocks.query, currentData: register };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Full day: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Half day: Aarav' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pending: Aarav' })).toBeEnabled();
  });
  it('enables present and absent for an eligible current-day roster', async () => {
    const date = dayjs().format('YYYY-MM-DD');
    mocks.params = new URLSearchParams(
      `date=${date}&organization=level&class=class&division=division`
    );
    mocks.query = { ...mocks.query, currentData: day({ date, canMark: true, isExpected: true }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Full day: Aarav' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeEnabled();
  });
  it('saves a half-day mark with present status and half-day credit', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Half day: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
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
      `date=${dayjs().add(1, 'day').format('YYYY-MM-DD')}&organization=level&class=class&division=division`
    );
    render(<TakeAttendanceScreen />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lock' })).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Attendance cannot be taken for a future date.'
    );
  });
  it('shows board and medium filters and clears dependent choices when either changes', () => {
    render(<TakeAttendanceScreen />);
    expect(screen.getByLabelText('Board')).toHaveValue('board');
    expect(screen.getByLabelText('Medium')).toHaveValue('medium');
    expect(screen.getByLabelText('School level')).toHaveValue('level');

    fireEvent.change(screen.getByLabelText('Medium'), { target: { value: 'medium-2' } });
    expect(screen.getByLabelText('School level')).toHaveValue('');
    expect(screen.getByLabelText('Class')).toBeDisabled();
    expect(mocks.replace).toHaveBeenLastCalledWith(
      expect.stringContaining('board=board&medium=medium-2'),
      { scroll: false }
    );

    fireEvent.change(screen.getByLabelText('Board'), { target: { value: 'board-2' } });
    expect(screen.getByLabelText('Medium')).toHaveValue('');
    expect(screen.getByLabelText('School level')).toBeDisabled();
    expect(mocks.replace).toHaveBeenLastCalledWith(expect.stringContaining('board=board-2'), {
      scroll: false,
    });
  });
  it.each([true, false])(
    'routes leave-credit changes through the correction action with permission=%s',
    async (canCorrect) => {
      if (canCorrect)
        mocks.permissions.push({ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true });
      const registered = day({ isSubmitted: true, needsReview: true, attendanceDayId: 'day' });
      registered.students[0] = {
        ...registered.students[0],
        status: 1,
        approvedLeaveId: 'leave',
        needsCreditCorrection: true,
        requiresCorrectionApproval: false,
      };
      registered.students[1].status = 1;
      mocks.query = { ...mocks.query, currentData: registered };
      render(<TakeAttendanceScreen />);
      expect(await screen.findByText('Leave correction needed')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Full day: Aarav' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Absent: Aarav' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Lock' })).toBeDisabled();
      expect(screen.getByText(/before submitting this register again/)).toBeVisible();
      const request = screen.getByRole('button', {
        name: 'Request attendance correction: Aarav',
      });
      if (canCorrect) {
        expect(request).toBeEnabled();
        fireEvent.click(request);
        expect(screen.getByRole('dialog', { name: 'Request attendance correction' })).toBeVisible();
      } else {
        expect(request).toBeDisabled();
      }
      expect(mocks.mark).not.toHaveBeenCalled();
    }
  );
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
    fireEvent.click(await screen.findByRole('button', { name: 'Full day: Meera' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Lock' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
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
    expect(screen.getByRole('button', { name: 'Full day: Meera' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Request attendance correction: Aarav' })
    ).toBeEnabled();
  });
  it('lets an authorized user request corrections for recorded readonly marks, while pending marks remain ineligible', async () => {
    mocks.permissions.push({ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true });
    const registered = day({ canMark: false, attendanceDayId: 'day' });
    registered.students[0].status = 1;
    mocks.query = { ...mocks.query, currentData: registered };
    render(<TakeAttendanceScreen />);
    const request = await screen.findByRole('button', {
      name: 'Request attendance correction: Aarav',
    });
    expect(request).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Request attendance correction: Meera' })
    ).toBeDisabled();
    fireEvent.click(request);
    expect(screen.getByRole('dialog', { name: 'Request attendance correction' })).toBeVisible();
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
    expect(screen.getByRole('button', { name: 'Lock' })).toBeEnabled();
  });
  it('keeps heading and flex table geometry during initial loading', () => {
    mocks.query = { ...mocks.query, currentData: undefined, isLoading: true };
    render(<TakeAttendanceScreen />);
    expect(screen.getByRole('heading', { name: 'Daily Attendance' })).toBeVisible();
    expect(screen.getByText('Loading register')).toBeVisible();
    expect(screen.getByTestId('register')).toHaveAttribute('data-height', '1');
    expect(screen.getByTestId('register')).toHaveAttribute('data-minheight', '0');
  });
  it('saves a partial draft but requires the complete eligible roster before submit', async () => {
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Full day: Aarav' }));
    expect(screen.getByRole('button', { name: 'Lock' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
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
  it('submits and locks after an explicit complete-register review', async () => {
    mocks.permissions.push({ name: 'Students.Attendance.MarkAttendance.Delete', isGranted: true });
    mocks.lock.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
    render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Absent: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Full day: Meera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lock' }));
    expect(screen.getByRole('dialog', { name: 'Lock attendance?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Lock attendance' }));
    await waitFor(() => expect(mocks.mark).toHaveBeenCalled());
    await waitFor(() => expect(mocks.lock).toHaveBeenCalled());
    expect(mocks.mark.mock.calls[0][0]).toMatchObject({
      submit: true,
      entries: [
        { studentId: 'one', status: 2 },
        { studentId: 'two', status: 1 },
      ],
    });
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
    fireEvent.click(await screen.findByRole('button', { name: 'Lock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lock attendance' }));
    await waitFor(() => expect(mocks.lock).toHaveBeenCalledOnce());
    expect(mocks.mark).not.toHaveBeenCalled();
  });
  it('uses server authority for read-only marking and explains the boundary', async () => {
    mocks.query = { ...mocks.query, currentData: day({ canMark: false }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByRole('button', { name: 'Full day: Aarav' })).toBeDisabled();
    expect(screen.getByText(/This register is read-only/)).toBeVisible();
  });
  it('warns after cutoff while leaving authorized draft marking available', async () => {
    mocks.query = { ...mocks.query, currentData: day({ isPastMarkingCutoff: true }) };
    render(<TakeAttendanceScreen />);
    expect(await screen.findByText(/school marking cutoff has passed/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Full day: Aarav' })).toBeEnabled();
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
    await screen.findByRole('button', { name: 'Full day: Aarav' });
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
    await screen.findByRole('button', { name: 'Full day: Aarav' });
    ['Full day', 'Half day', 'Pending', 'Absent'].forEach((choice) => {
      expect(screen.getByRole('button', { name: `${choice}: Aarav` })).toBeDisabled();
    });
    expect(screen.queryByText('Not expected')).not.toBeInTheDocument();
  });
  it('preserves local marks when a refreshed roster conflicts with the draft', async () => {
    const view = render(<TakeAttendanceScreen />);
    fireEvent.click(await screen.findByRole('button', { name: 'Full day: Aarav' }));
    mocks.query = {
      ...mocks.query,
      currentData: day({ revision: 'newer', rosterRevision: 'changed' }),
    };
    view.rerender(<TakeAttendanceScreen />);
    expect(screen.getByRole('button', { name: 'Full day: Aarav' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
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
    fireEvent.click(await screen.findByRole('button', { name: 'Full day: Aarav' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText(/Connection interrupted/);
    expect(screen.getByRole('button', { name: 'Full day: Aarav' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
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
