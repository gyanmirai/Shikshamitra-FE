import type { ReactNode } from 'react';
import type { AttendanceCorrection } from 'src/redux/student/attendance-management/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import LeaveAndCorrections from './index';

const state = vi.hoisted(() => ({
  correction: {} as AttendanceCorrection,
  decide: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({
      auth: { permissions: [{ name: 'Students.Attendance.LeaveAndAbsent.Add', isGranted: true }] },
    }),
}));
vi.mock('../setting/attendance-context', () => ({
  useAttendanceContext: () => ({
    currentYear: { id: 'year' },
    params: new URLSearchParams('view=corrections'),
    standardId: '',
    divisionId: '',
    update: vi.fn(),
  }),
  AttendanceClassFilters: () => null,
}));
vi.mock('src/redux/student/attendance-management/api', () => ({
  useGetAttendanceCorrectionsQuery: () => ({
    currentData: { items: [state.correction], totalCount: 1 },
    isLoading: false,
    isError: false,
  }),
  useDecideAttendanceCorrectionMutation: () => [state.decide, { isLoading: false }],
}));
vi.mock('./leave-requests', () => ({ default: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/routes/components', () => ({ RouterLink: 'a' }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ) : null,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
  }: {
    data: AttendanceCorrection[];
    columns: { id: string; render?: (value: unknown, row: AttendanceCorrection) => ReactNode }[];
  }) => (
    <div>
      {data.map((row) => (
        <div key={row.id}>
          {columns.map((column) => {
            const value = row[column.id as keyof AttendanceCorrection];
            return (
              <div key={column.id}>
                {column.render ? column.render(value, row) : String(value ?? '')}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ),
}));

describe('attendance correction review', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.decide.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
    state.correction = {
      id: 'correction-1',
      studentId: 'student-1',
      studentName: 'Aarav Sharma',
      date: '2026-10-01',
      reason: 'Approved half-day leave',
      status: 'Pending',
      beforeStatus: 2,
      requestedStatus: 2,
      revision: 'revision-1',
      academicYearId: 'year',
      standardId: 'standard',
      divisionId: 'division',
      late: false,
      halfDay: false,
      isCreditCorrection: true,
      beforePresentCredit: 0,
      requestedPresentCredit: 0,
      beforeDenominatorCredit: 1,
      requestedDenominatorCredit: 0.5,
    };
  });

  it('shows trusted leave credit impact before requiring an audited approval reason', async () => {
    render(<LeaveAndCorrections />);
    expect(screen.getByText('Leave credit update')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Approve correction for Aarav Sharma' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Approve attendance correction' }));
    expect(dialog.getByText(/Absent → Absent/)).toBeVisible();
    expect(dialog.getByText('Expected attendance day credit: 1 → 0.5')).toBeVisible();
    expect(dialog.getByText('Present credit: 0 → 0')).toBeVisible();
    expect(dialog.getByText('Leave credit update')).toBeVisible();
    fireEvent.click(dialog.getByRole('button', { name: 'Approve correction' }));
    expect(await dialog.findByText('Enter a review reason')).toBeVisible();
    expect(state.decide).not.toHaveBeenCalled();
    fireEvent.change(dialog.getByRole('textbox', { name: 'Review reason' }), {
      target: { value: 'Verified approved half-day leave' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Approve correction' }));
    await waitFor(() =>
      expect(state.decide).toHaveBeenCalledExactlyOnceWith({
        id: 'correction-1',
        action: 'approve',
        revision: 'revision-1',
        reason: 'Verified approved half-day leave',
      })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps unavailable legacy credit evidence distinct from zero', () => {
    Object.assign(state.correction, {
      beforePresentCredit: null,
      requestedPresentCredit: undefined,
      beforeDenominatorCredit: undefined,
      requestedDenominatorCredit: null,
    });
    render(<LeaveAndCorrections />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve correction for Aarav Sharma' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(
      dialog.getByText('Expected attendance day credit: Unavailable → Unavailable')
    ).toBeVisible();
    expect(dialog.getByText('Present credit: Unavailable → Unavailable')).toBeVisible();
    expect(
      dialog.getByText('Unavailable credit values have no preserved evidence in this correction.')
    ).toBeVisible();
    expect(dialog.queryByText(/credit: 0/)).not.toBeInTheDocument();
  });

  it('keeps ordinary status corrections compatible without a leave credit label', () => {
    state.correction.isCreditCorrection = undefined;
    state.correction.requestedStatus = 1;
    render(<LeaveAndCorrections />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject correction for Aarav Sharma' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Reject attendance correction' }));
    expect(dialog.getByText(/Absent → Present/)).toBeVisible();
    expect(dialog.getByRole('textbox', { name: 'Review reason' })).toBeVisible();
    expect(screen.queryByText('Leave credit update')).not.toBeInTheDocument();
    expect(dialog.queryByText(/Expected attendance day credit/)).not.toBeInTheDocument();
  });
});
