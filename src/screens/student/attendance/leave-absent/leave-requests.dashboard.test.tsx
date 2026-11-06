import type { Medium } from 'src/types/school';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';
import { TableBody } from 'src/components/customizabaleTable/components/TableBody';
import { within, screen, waitFor, fireEvent, render as renderUi } from '@testing-library/react';

import LeaveRequests from './leave-requests';
import { renderAttendanceErrorRecovery } from '../attendance-toast-test-fixture';

const theme = createTheme(defaultSettings);
const render = (ui: React.ReactNode) =>
  renderUi(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    ),
  });

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams('dashboard=pending'),
  saving: false,
  queryError: false,
  retry: vi.fn(),
  save: vi.fn(),
  halfDay: false,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: { permissions: [{ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true }] },
      confirmPopup: { isChanges: false },
      globalState: { currentYear: { id: 'year' } },
    }),
}));
vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({ params: mocks.params, update: vi.fn() }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: { type: string }) =>
    type === 'mutation'
      ? [mocks.save, { isLoading: mocks.saving }]
      : {
          currentData: {
            items: [
              {
                id: 'leave',
                studentName: 'Riya',
                status: 0,
                leaveDate: '2026-11-06',
                endDate: '2026-11-07',
                isHalfDay: mocks.halfDay,
                studentLeaveTypeId: 'leave-type',
                description: 'Interface fixture',
              },
            ],
            totalCount: 1,
          },
          isLoading: false,
          isFetching: false,
          isError: mocks.queryError,
          refetch: mocks.retry,
        },
}));
vi.mock('src/redux/student/student-leave/student-leave-api', () => ({
  useAddStudentLeaveMutation: vi.fn(),
  useUpdateStudentLeaveMutation: vi.fn(),
  useApproveStudentLeaveMutation: vi.fn(),
  useRejectStudentLeaveMutation: vi.fn(),
  useGetStudentLeaveQuery: () => ({ currentData: { totalCount: 1 } }),
  useGetStudentLeaveStatusCountsQuery: () => ({
    currentData: { pendingCount: 1, approvedCount: 1, rejectedCount: 1 },
  }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
    handleClose,
  }: {
    open: boolean;
    title: React.ReactNode;
    children: React.ReactNode;
    handleClose: () => void;
  }) =>
    open ? (
      <div role="dialog">
        {title}
        <button type="button" onClick={handleClose}>
          Close form
        </button>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
    handleRowClick,
    getRowAction,
    rowProps,
  }: {
    data: React.ComponentProps<typeof TableBody>['data'];
    columns: React.ComponentProps<typeof TableBody>['columns'];
    handleRowClick: React.ComponentProps<typeof TableBody>['onRowClick'];
    getRowAction: React.ComponentProps<typeof TableBody>['getRowAction'];
    rowProps: React.ComponentProps<typeof TableBody>['rowProps'];
  }) => (
    <table>
      <TableBody
        data={data}
        columns={columns}
        columnVisibility={Object.fromEntries(columns.map(({ id }) => [id, true]))}
        getStickyStyle={() => ({})}
        isLoading={false}
        dense={false}
        onRowClick={handleRowClick}
        getRowAction={getRowAction}
        rowProps={rowProps || (() => ({}))}
        expandedRows={{}}
        onExpandRow={() => {}}
        tableRef={0}
      />
    </table>
  ),
}));
vi.mock('./leave-request-actions', () => ({
  LeaveRequestActions: ({
    onEdit,
    onApprove,
    onReject,
    editDisabled,
  }: {
    onEdit: () => void;
    onApprove: () => void;
    onReject: () => void;
    editDisabled: boolean;
  }) => (
    <>
      <button disabled={editDisabled} type="button" onClick={onEdit}>
        Edit request
      </button>
      <button type="button" onClick={onApprove}>
        Approve request
      </button>
      <button type="button" onClick={onReject}>
        Reject request
      </button>
    </>
  ),
}));

beforeEach(() => {
  mocks.saving = false;
  mocks.halfDay = false;
  mocks.save.mockReset().mockReturnValue({ unwrap: async () => ({}) });
  mocks.queryError = false;
  mocks.retry.mockClear();
  mocks.params = new URLSearchParams('dashboard=pending');
});

it('retries a leave-list failure from its toast while retaining the pending context', async () => {
  mocks.queryError = true;
  render(<LeaveRequests scope={{ academicYearId: 'year' }} />);
  await expectStudentErrorToast('Leave requests could not be loaded.');
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  const recovery = renderAttendanceErrorRecovery();
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(mocks.retry).toHaveBeenCalledOnce();
  expect(mocks.params.get('dashboard')).toBe('pending');
});

it('opens leave details with a pointer or keyboard and keeps decision actions separate', () => {
  render(<LeaveRequests scope={{ academicYearId: 'year' }} />);
  fireEvent.click(screen.getByText('Riya'));
  expect(screen.getByRole('dialog')).toHaveTextContent('Leave Request Details');
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  const row = screen.getByLabelText('View leave request for Riya');
  fireEvent.keyDown(row, { key: 'Enter' });
  expect(screen.getByRole('dialog')).toHaveTextContent('Leave Request Details');
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  fireEvent.keyDown(row, { key: ' ' });
  expect(screen.getByRole('dialog')).toHaveTextContent('Leave Request Details');
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  fireEvent.click(screen.getByRole('button', { name: 'Approve request' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Approve Leave');
  expect(screen.getByRole('dialog')).not.toHaveTextContent('Leave Request Details');
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reject request' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Reject Leave');
  expect(screen.getByRole('dialog')).not.toHaveTextContent('Leave Request Details');
});

it('uses one discard decision and retains leave remarks when editing continues', () => {
  const nativeConfirm = vi.fn();
  vi.stubGlobal('confirm', nativeConfirm);
  render(<LeaveRequests scope={{ academicYearId: 'year' }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Reject request' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Remarks/ }), {
    target: { value: 'Please provide a supporting document' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  expect(nativeConfirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: /Remarks/ })).toHaveValue(
    'Please provide a supporting document'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.queryByRole('textbox', { name: /Remarks/ })).not.toBeInTheDocument();
  vi.unstubAllGlobals();
});

it('retains the all-medium pending list and decisions while disabling form entry', () => {
  render(<LeaveRequests scope={{ academicYearId: 'year' }} />);
  expect(screen.getByText('Riya')).toBeVisible();
  expect(
    screen.getByText(/Select a medium in the filters to add or edit leave requests/)
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Add leave request' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Edit request' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Approve request' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Reject request' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Approve request' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Approve Leave');
  expect(screen.getByRole('dialog')).toHaveTextContent('Riya');
});

it('enables form entry when the dashboard medium is selected and on ordinary routes', () => {
  const medium = { id: 'medium', educationMediumStages: [] } as unknown as Medium;
  const view = render(
    <LeaveRequests
      scope={{ academicYearId: 'year', educationMediumId: 'medium' }}
      selectedMedium={medium}
    />
  );
  expect(
    screen.queryByText(/Select a medium in the filters to add or edit leave requests/)
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add leave request' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Edit request' })).toBeEnabled();
  mocks.params = new URLSearchParams();
  view.rerender(
    <LeaveRequests
      scope={{ academicYearId: 'year', educationMediumId: 'medium' }}
      selectedMedium={medium}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit request' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Edit Leave Request');
  expect(screen.getByRole('textbox', { name: /^Leave description/ })).toHaveAttribute(
    'aria-required',
    'true'
  );
  const upload = screen.getByRole('button', { name: 'Choose supporting document' });
  expect(screen.getByRole('group', { name: 'Supporting document (optional)' })).toContainElement(
    upload
  );
  expect(upload).toHaveAttribute('aria-disabled', 'false');
  expect(upload.querySelector('input[type="file"]')).toBeEnabled();
  mocks.saving = true;
  view.rerender(
    <LeaveRequests
      scope={{ academicYearId: 'year', educationMediumId: 'medium' }}
      selectedMedium={medium}
    />
  );
  expect(upload).toHaveAttribute('aria-disabled', 'true');
  expect(upload).toHaveAttribute('tabindex', '-1');
  expect(upload.querySelector('input[type="file"]')).toBeDisabled();
});

it.each([false, true])(
  'shows numeric leave dates consistently and preserves offset payloads (half day=%s)',
  async (halfDay) => {
    mocks.halfDay = halfDay;
    const medium = { id: 'medium', educationMediumStages: [] } as unknown as Medium;
    render(
      <LeaveRequests
        scope={{ academicYearId: 'year', educationMediumId: 'medium' }}
        selectedMedium={medium}
      />
    );
    const row = screen.getByLabelText('View leave request for Riya');
    expect(row).toHaveTextContent('06/11/2026');
    expect(row).toHaveTextContent(halfDay ? '06/11/2026' : '07/11/2026');
    fireEvent.click(screen.getByText('Riya'));
    expect(screen.getByRole('dialog')).toHaveTextContent('06/11/2026');
    if (!halfDay) expect(screen.getByRole('dialog')).toHaveTextContent('07/11/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve request' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('06/11/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'leave',
          data: expect.objectContaining({
            isHalfDay: halfDay,
            leaveDate: expect.stringMatching(/^2026-11-06T00:00:00(?:[+-]\d{2}:\d{2}|Z)$/),
            endDate: halfDay
              ? null
              : expect.stringMatching(/^2026-11-07T00:00:00(?:[+-]\d{2}:\d{2}|Z)$/),
          }),
        })
      )
    );
  }
);
