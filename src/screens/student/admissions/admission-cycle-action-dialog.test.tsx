import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import userEvent from '@testing-library/user-event';
import { act, render, screen, cleanup } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { AdmissionCycleActionDialog } from './admission-cycle-action-dialog';

const notices = vi.hoisted(() => ({ error: vi.fn(() => 'cycle-error'), dismiss: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: notices }));

afterEach(async () => {
  cleanup();
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  vi.clearAllMocks();
});

const impactHook = vi.hoisted(() => ({
  trigger: vi.fn(),
  state: {
    originalArgs: 'cycle-1',
    isFetching: true,
    isError: false,
    data: undefined as
      | {
          admissionCycleId: string;
          linkedOfferingCount: number;
          activeOfferingCount: number;
          applicationCount: number;
        }
      | undefined,
  },
}));

vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useLazyGetAdmissionCycleImpactQuery: () => [impactHook.trigger, impactHook.state],
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const cycle: AdmissionCycle = {
  id: 'cycle-1',
  name: 'RTE',
  code: 'CYCLE_INTERNAL_123',
  academicYearId: 'year-1',
  academicYearName: '2026-2027',
  startDate: '2026-10-01',
  endDate: '2026-10-02',
  status: 0,
  windowStatus: 1,
  isAcceptingApplications: false,
  linkedOfferingCount: 0,
  activeOfferingCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp-1',
};

const renderDelete = (onConfirm = vi.fn(), onClose = vi.fn()) =>
  render(
    <AdmissionCycleActionDialog
      action="delete"
      cycle={cycle}
      busy={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );

describe('admission cycle publish confirmation', () => {
  it('uses the neutral primary action and omits the cycle identity line', () => {
    render(
      <AdmissionCycleActionDialog
        action="publish"
        cycle={cycle}
        validation={{ isValid: true, errors: [], warnings: [] }}
        busy={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Publish' })).toHaveClass('MuiButton-colorInherit');
    expect(screen.queryByText('RTE')).not.toBeInTheDocument();
    expect(screen.queryByText(/CYCLE_INTERNAL_123/)).not.toBeInTheDocument();
    expect(screen.getByText(/Applications are accepted only during/)).toBeVisible();
    expect(screen.queryByText('This cycle is ready to publish.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the publish payload unchanged', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <AdmissionCycleActionDialog
        action="publish"
        cycle={cycle}
        validation={{ isValid: true, errors: [], warnings: [] }}
        busy={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onConfirm).toHaveBeenCalledWith({
      concurrencyStamp: cycle.concurrencyStamp,
      reason: undefined,
      confirmActiveOfferings: false,
    });
  });

  it('keeps invalid publication blocked and its error visible', () => {
    render(
      <AdmissionCycleActionDialog
        action="publish"
        cycle={cycle}
        validation={{
          isValid: false,
          errors: [{ code: 'InvalidWindow', message: 'Correct the application window.' }],
          warnings: [],
        }}
        busy={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByText('Correct the application window.')).toBeVisible();
    expect(notices.error).not.toHaveBeenCalled();
  });

  it('keeps publication warnings visible without blocking an otherwise valid publication', () => {
    render(
      <AdmissionCycleActionDialog
        action="publish"
        cycle={cycle}
        validation={{
          isValid: true,
          errors: [],
          warnings: [{ code: 'ClosingSoon', message: 'The application window closes tomorrow.' }],
        }}
        busy={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('The application window closes tomorrow.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    expect(notices.error).not.toHaveBeenCalled();
  });

  it('locks Publish and Cancel while publishing', () => {
    render(
      <AdmissionCycleActionDialog
        action="publish"
        cycle={cycle}
        validation={{ isValid: true, errors: [], warnings: [] }}
        busy
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});

describe('admission cycle delete confirmation', () => {
  beforeEach(() => {
    impactHook.trigger.mockReset();
    impactHook.state.originalArgs = cycle.id;
    impactHook.state.isFetching = true;
    impactHook.state.isError = false;
    impactHook.state.data = undefined;
  });

  it('shows loading and the cycle name without its internal code', () => {
    renderDelete();

    expect(screen.getByRole('status')).toHaveTextContent('Checking linked offerings');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByText(/RTE/)).toBeInTheDocument();
    expect(screen.queryByText(/CYCLE_INTERNAL_123/)).not.toBeInTheDocument();
    expect(impactHook.trigger).toHaveBeenCalledWith(cycle.id);
  });

  it('keeps Delete disabled on a failed impact check and allows closing after an error toast', async () => {
    impactHook.state.isFetching = false;
    impactHook.state.isError = true;
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderDelete(onConfirm, onClose);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(notices.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Could not check linked records. Close this dialog and try again.',
      })
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(impactHook.trigger).toHaveBeenCalledWith(cycle.id);
  });

  it('does not use a response belonging to a different cycle', () => {
    impactHook.state.isFetching = false;
    impactHook.state.data = {
      admissionCycleId: 'another-cycle',
      linkedOfferingCount: 0,
      activeOfferingCount: 0,
      applicationCount: 0,
    };
    renderDelete();

    expect(notices.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Could not check linked records. Close this dialog and try again.',
      })
    );
    expect(screen.queryByText(/Could not check linked records/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('enables Delete only after a matching impact response confirms no linked records', async () => {
    impactHook.state.isFetching = false;
    impactHook.state.data = {
      admissionCycleId: cycle.id,
      linkedOfferingCount: 0,
      activeOfferingCount: 0,
      applicationCount: 0,
    };
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderDelete(onConfirm);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ concurrencyStamp: cycle.concurrencyStamp })
    );
  });
});

describe('admission cycle close confirmation', () => {
  beforeEach(() => {
    impactHook.trigger.mockReset();
    impactHook.state.originalArgs = cycle.id;
    impactHook.state.isFetching = false;
    impactHook.state.isError = false;
    impactHook.state.data = {
      admissionCycleId: cycle.id,
      linkedOfferingCount: 3,
      activeOfferingCount: 1,
      applicationCount: 7,
    };
  });

  const renderClose = (onConfirm = vi.fn(), busy = false) =>
    render(
      <AdmissionCycleActionDialog
        action="close"
        cycle={{ ...cycle, status: 1 }}
        busy={busy}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

  it('explains the consequence without counts, a banner, a checkbox, or a reason field', () => {
    renderClose();

    expect(screen.getByText(/stops new applications/)).toHaveTextContent(
      'Existing applications remain available for review.'
    );
    expect(screen.queryByText('Offerings')).not.toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/CYCLE_INTERNAL_123/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close cycle' })).toBeEnabled();
  });

  it('sends the staff confirmation and audit reason with the current concurrency stamp', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderClose(onConfirm);

    await userEvent.click(screen.getByRole('button', { name: 'Close cycle' }));
    expect(onConfirm).toHaveBeenCalledWith({
      concurrencyStamp: cycle.concurrencyStamp,
      reason: 'Admission cycle closed by staff confirmation.',
      confirmActiveOfferings: true,
    });
  });

  it('does not acknowledge active offerings when the cycle has none', async () => {
    impactHook.state.data!.activeOfferingCount = 0;
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderClose(onConfirm);

    await userEvent.click(screen.getByRole('button', { name: 'Close cycle' }));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ confirmActiveOfferings: false })
    );
  });

  it('keeps Close cycle disabled until the impact check completes', () => {
    impactHook.state.isFetching = true;
    renderClose();

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close cycle' })).toBeDisabled();
  });

  it('keeps Close cycle disabled for an error or a response for a different cycle', () => {
    impactHook.state.data!.admissionCycleId = 'another-cycle';
    renderClose();

    expect(notices.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Could not check linked records. Close this dialog and try again.',
      })
    );
    expect(screen.getByRole('button', { name: 'Close cycle' })).toBeDisabled();
  });

  it('locks Close cycle and Cancel during submission', () => {
    renderClose(vi.fn(), true);

    expect(screen.getByRole('button', { name: 'Close cycle' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
