import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { AdmissionCycleActionDialog } from './admission-cycle-action-dialog';

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

const renderDelete = (onConfirm = vi.fn()) =>
  render(
    <AdmissionCycleActionDialog
      action="delete"
      cycle={cycle}
      busy={false}
      onClose={vi.fn()}
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
    expect(screen.getByText('This cycle is ready to publish.')).toBeVisible();
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

  it('keeps Delete disabled when the impact check fails and offers Retry', async () => {
    impactHook.state.isFetching = false;
    impactHook.state.isError = true;
    renderDelete();

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
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

    expect(
      screen.getByText('Could not check linked records. Retry before continuing.')
    ).toBeVisible();
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
