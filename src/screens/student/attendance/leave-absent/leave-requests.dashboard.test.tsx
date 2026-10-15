import type { Medium } from 'src/types/school';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import LeaveRequests from './leave-requests';

const mocks = vi.hoisted(() => ({ params: new URLSearchParams('dashboard=pending') }));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: { permissions: [{ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true }] },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({ params: mocks.params, update: vi.fn() }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    currentData: { items: [{ id: 'leave', studentName: 'Riya', status: 0 }], totalCount: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('src/redux/student/student-leave/student-leave-api', () => ({
  useGetStudentLeaveQuery: () => ({ currentData: { totalCount: 1 } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title }: { open: boolean; title: React.ReactNode }) =>
    open ? <div role="dialog">{title}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
  }: {
    data: Record<string, unknown>[];
    columns: {
      id: string;
      render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    }[];
  }) => (
    <div>
      {data.map((row) => (
        <div key={String(row.id)}>
          {row.studentName as string}
          {columns.find((column) => column.id === 'action')?.render?.(undefined, row)}
        </div>
      ))}
    </div>
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
  mocks.params = new URLSearchParams('dashboard=pending');
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
});
