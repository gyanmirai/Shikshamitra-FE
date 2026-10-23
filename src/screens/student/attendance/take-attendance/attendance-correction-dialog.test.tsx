import { vi, it, expect, describe, beforeEach } from 'vitest';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AttendanceCorrectionDialog from './attendance-correction-dialog';

const mocks = vi.hoisted(() => ({ request: vi.fn(), success: vi.fn(), close: vi.fn() }));
vi.mock('src/redux/student/take-attendance/take-attendace-api', () => ({
  useRequestAttendanceCorrectionMutation: () => [mocks.request, { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.success,
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section aria-label={title}>{children}</section>
  ),
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <label htmlFor="correction-status">
      {label}
      <select
        id="correction-status"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="1">Present</option>
        <option value="2">Absent</option>
      </select>
    </label>
  ),
}));

const props = {
  student: {
    studentId: 'student',
    firstName: 'Aarav',
    status: AttendanceStatus.Absent,
    late: false,
    halfDay: false,
    isExpected: true,
  },
  policy: { allowLate: true, allowHalfDay: true, lateCredit: 1, halfDayCredit: 0.5 },
  scope: {
    academicYearId: 'year',
    standardId: 'class',
    divisionId: 'division',
    date: '2026-09-30',
  },
  revision: 'revision',
  onClose: mocks.close,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ id: 'correction', status: 'Pending' }),
  }));
});
describe('attendance correction request', () => {
  it('keeps an ordinary unchanged mark disabled even after a reason is entered', () => {
    render(<AttendanceCorrectionDialog {...props} />);
    fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
      target: { value: 'A reason alone must not create a no-op correction.' },
    });
    expect(screen.getByRole('button', { name: 'Request correction' })).toBeDisabled();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it.each(['Pending', 'Applied'] as const)(
    'requests audited leave-credit recalculation with the original mark and handles %s',
    async (status) => {
      mocks.request.mockImplementation(() => ({
        unwrap: () => Promise.resolve({ id: 'correction', status }),
      }));
      render(
        <AttendanceCorrectionDialog
          {...props}
          student={{ ...props.student, approvedLeaveId: 'leave', needsCreditCorrection: true }}
        />
      );
      expect(screen.getByText(/even when Present or Absent stays unchanged/)).toBeVisible();
      expect(screen.getByRole('button', { name: 'Request correction' })).toBeEnabled();
      fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
      expect(await screen.findByText('Enter a correction reason.')).toBeVisible();
      expect(mocks.request).not.toHaveBeenCalled();
      fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
        target: { value: '  Leave was approved after the register was submitted.  ' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
      await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
      expect(mocks.request.mock.calls[0][0]).toMatchObject({
        studentId: 'student',
        status: AttendanceStatus.Absent,
        late: false,
        halfDay: false,
        remarks: '',
        reason: 'Leave was approved after the register was submitted.',
        revision: 'revision',
        date: '2026-09-30',
      });
      expect(mocks.request.mock.calls[0][0]).not.toHaveProperty('needsCreditCorrection');
      expect(mocks.success).toHaveBeenCalledWith({
        message:
          status === 'Applied'
            ? 'Attendance correction applied.'
            : 'Attendance correction sent for approval.',
      });
      expect(mocks.close).toHaveBeenCalledOnce();
    }
  );
  it('retains a failed leave-credit request and retries with the same audit operation', async () => {
    mocks.request.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Leave correction could not be sent.'), {
            data: { detail: 'Leave correction could not be sent.' },
          })
        ),
    }));
    render(
      <AttendanceCorrectionDialog
        {...props}
        student={{ ...props.student, needsCreditCorrection: true }}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
      target: { value: 'Reconcile leave approved after submission.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    expect(await screen.findByText(/Leave correction could not be sent/)).toBeVisible();
    expect(screen.getByLabelText('Correct attendance to')).toHaveValue('2');
    expect(screen.getByRole('textbox', { name: /Correction reason/ })).toHaveValue(
      'Reconcile leave approved after submission.'
    );
    expect(mocks.close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
    expect(mocks.request.mock.calls[1][0].operationId).toBe(
      mocks.request.mock.calls[0][0].operationId
    );
  });
  it('requires a reason and an actual change before requesting a correction', async () => {
    render(<AttendanceCorrectionDialog {...props} />);
    expect(screen.getByRole('button', { name: 'Request correction' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Correct attendance to'), { target: { value: '1' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Request correction' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    expect(await screen.findByText('Enter a correction reason.')).toBeVisible();
    expect(mocks.request).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
      target: { value: 'Register marked before arrival was confirmed.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
    expect(mocks.request.mock.calls[0][0]).toMatchObject({
      studentId: 'student',
      status: 1,
      reason: 'Register marked before arrival was confirmed.',
      revision: 'revision',
      date: '2026-09-30',
    });
    expect(mocks.request.mock.calls[0][0].operationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.success).toHaveBeenCalledWith({
      message: 'Attendance correction sent for approval.',
    });
  });
  it('retains the request after a failed save and reuses the operation id on retry', async () => {
    mocks.request.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Connection interrupted'), {
            data: { detail: 'Connection interrupted' },
          })
        ),
    }));
    render(<AttendanceCorrectionDialog {...props} />);
    fireEvent.change(screen.getByLabelText('Correct attendance to'), { target: { value: '1' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
      target: { value: 'Arrival verified' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    await screen.findByText(/Connection interrupted/);
    expect(screen.getByRole('textbox', { name: /Correction reason/ })).toHaveValue(
      'Arrival verified'
    );
    expect(mocks.close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Request correction' }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
    expect(mocks.request.mock.calls[0][0].operationId).toBe(
      mocks.request.mock.calls[1][0].operationId
    );
  });
});
