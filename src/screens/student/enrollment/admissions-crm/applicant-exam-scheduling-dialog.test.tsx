import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { ApplicantExamSchedulingDialog } from './applicant-exam-scheduling-dialog';

const mocks = vi.hoisted(() => ({
  schedule: vi.fn(),
  unwrap: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  slots: {
    data: { items: [] as Array<Record<string, unknown>> },
    isFetching: false,
    isError: false,
  },
}));

vi.mock(
  'src/redux/student/admissions-crm/communication-exams-events-api',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('src/redux/student/admissions-crm/communication-exams-events-api')
      >();
    return {
      ...original,
      useGetAdmissionCrmExamSlotsQuery: () => ({ ...mocks.slots, refetch: mocks.refetch }),
      useScheduleAdmissionCrmEntranceExamMutation: () => [mocks.schedule, { isLoading: false }],
    };
  }
);

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: mocks.success,
    error: mocks.error,
  },
}));

const lead = {
  id: 'lead-1',
  firstName: 'Neil',
  lastName: 'Gandhi',
  desiredClassName: 'Class 5',
} as AdmissionCrmLeadDto;

const slot = (remainingCapacity: number) => ({
  id: 'slot-1',
  slotName: 'Morning Slot',
  startDate: '2026-08-10T09:00:00Z',
  remainingCapacity,
  isActive: true,
});

describe('Applicant exam scheduling dialog', () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    mocks.schedule.mockReset();
    mocks.unwrap.mockReset();
    mocks.refetch.mockReset();
    mocks.success.mockReset();
    mocks.error.mockReset();
    mocks.slots.data = { items: [slot(2)] };
    mocks.slots.isFetching = false;
    mocks.slots.isError = false;
    mocks.schedule.mockReturnValue({ unwrap: mocks.unwrap });
    mocks.unwrap.mockResolvedValue({});
  });

  it('loads slots, schedules the exact applicant, and reports success', async () => {
    const user = userEvent.setup();
    const onScheduled = vi.fn();
    const onClose = vi.fn();
    render(
      <ApplicantExamSchedulingDialog
        lead={lead}
        academicYearId="year-1"
        onScheduled={onScheduled}
        onClose={onClose}
      />
    );

    await user.click(screen.getByLabelText('Exam Slot'));
    await user.click(screen.getByRole('option', { name: /Morning Slot/ }));
    await user.click(screen.getByRole('button', { name: 'Schedule Assessment' }));

    await waitFor(() =>
      expect(mocks.schedule).toHaveBeenCalledWith({
        leadId: 'lead-1',
        body: {
          entranceExamSlotId: 'slot-1',
          overrideCapacity: false,
          capacityOverrideReason: undefined,
        },
      })
    );
    expect(onScheduled).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledWith({ message: 'Entrance exam scheduled.' });
  });

  it('protects an unsaved schedule when the standalone dialog is cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    render(<ApplicantExamSchedulingDialog lead={lead} academicYearId="year-1" onClose={onClose} />);

    await user.click(screen.getByLabelText('Exam Slot'));
    await user.click(screen.getByRole('option', { name: /Morning Slot/ }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('prevents selecting a full slot until a governed override is enabled', async () => {
    mocks.slots.data = { items: [slot(0)] };
    const user = userEvent.setup();
    render(<ApplicantExamSchedulingDialog lead={lead} academicYearId="year-1" onClose={vi.fn()} />);

    await user.click(screen.getByLabelText('Exam Slot'));
    expect(screen.getByRole('option', { name: /Morning Slot/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Schedule Assessment' })).toBeDisabled();
    expect(
      screen.queryByRole('switch', { name: 'Override slot capacity' })
    ).not.toBeInTheDocument();
    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  it('requires override permission and a reason before scheduling beyond capacity', async () => {
    mocks.slots.data = { items: [slot(0)] };
    const user = userEvent.setup();
    render(
      <ApplicantExamSchedulingDialog
        lead={lead}
        academicYearId="year-1"
        canOverrideCapacity
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'Override slot capacity' }));
    await user.click(screen.getByLabelText('Exam Slot'));
    await user.click(screen.getByRole('option', { name: /Morning Slot/ }));
    await user.type(
      screen.getByRole('textbox', { name: /Capacity Override Reason/ }),
      'Approved overflow seat'
    );
    await user.click(screen.getByRole('button', { name: 'Schedule Assessment' }));

    await waitFor(() =>
      expect(mocks.schedule).toHaveBeenCalledWith({
        leadId: 'lead-1',
        body: {
          entranceExamSlotId: 'slot-1',
          overrideCapacity: true,
          capacityOverrideReason: 'Approved overflow seat',
        },
      })
    );
  });

  it('keeps the dialog open and reports a scheduling failure', async () => {
    mocks.unwrap.mockRejectedValue(new Error('capacity changed'));
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ApplicantExamSchedulingDialog lead={lead} academicYearId="year-1" onClose={onClose} />);

    await user.click(screen.getByLabelText('Exam Slot'));
    await user.click(screen.getByRole('option', { name: /Morning Slot/ }));
    await user.click(screen.getByRole('button', { name: 'Schedule Assessment' }));

    await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Schedule Assessment' })).toBeVisible();
  });

  it('shows load and retry states without exposing a usable submit action', () => {
    mocks.slots.isFetching = true;
    const { rerender } = render(
      <ApplicantExamSchedulingDialog lead={lead} academicYearId="year-1" onClose={vi.fn()} />
    );
    expect(screen.getByLabelText('Loading entrance exam slots')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Schedule Assessment' })).toBeDisabled();

    mocks.slots.isFetching = false;
    mocks.slots.isError = true;
    rerender(
      <ApplicantExamSchedulingDialog lead={lead} academicYearId="year-1" onClose={vi.fn()} />
    );
    expect(screen.getByText(/Exam slots could not be loaded/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
