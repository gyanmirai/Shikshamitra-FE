
import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { BulkAdmissionOfferingActivation } from './bulk-admission-offering-activation';

import type { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const state = () =>
  ({
    selectedRows: [{ id: 'one' }, { id: 'two' }],
    selectedIds: ['one', 'two'],
    eligibleRows: [],
    busy: false,
    progress: null,
    failures: [],
    confirmationOpen: false,
    clearSelection: vi.fn(),
    requestActivation: vi.fn(),
    confirmActivation: vi.fn(),
    cancelActivation: vi.fn(),
    toggleSelection: vi.fn(),
    toggleAll: vi.fn(),
  }) as unknown as ReturnType<typeof useBulkAdmissionOfferingActivation>;

describe('Bulk activation controls', () => {
  it('shows the selection count and an outcome-labelled action', () => {
    const activation = state();
    render(<BulkAdmissionOfferingActivation activation={activation} disabled={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('2 offerings selected');
    fireEvent.click(screen.getByRole('button', { name: 'Activate Selected' }));
    expect(activation.requestActivation).toHaveBeenCalledOnce();
  });
  it('uses a plain confirmation without extra information cards', () => {
    const activation = { ...state(), confirmationOpen: true };
    render(<BulkAdmissionOfferingActivation activation={activation} disabled={false} />);
    expect(screen.getByRole('dialog', { name: 'Activate Admission Offerings?' })).toBeVisible();
    expect(screen.getByText('2 selected offerings will become active.')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    expect(activation.confirmActivation).toHaveBeenCalledOnce();
  });
  it('locks competing actions and shows progress while activating', () => {
    const activation = {
      ...state(),
      busy: true,
      confirmationOpen: true,
      progress: { completed: 1, total: 2 },
    };
    render(<BulkAdmissionOfferingActivation activation={activation} disabled={false} />);
    expect(screen.getByText('Clear').closest('button')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeDisabled();
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(
      'Activating 1 of 2 offerings'
    );
  });
  it('keeps per-offering failure reasons visible and offers retry through the selected action', () => {
    const activation = {
      ...state(),
      failures: [
        { id: 'two', name: 'Class 2 General', message: 'Publish the registration form first.' },
      ],
    };
    render(<BulkAdmissionOfferingActivation activation={activation} disabled={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Class 2 General: Publish the registration form first.'
    );
    expect(screen.getByRole('button', { name: 'Activate Selected' })).toBeEnabled();
  });
  it('does not render an empty selection toolbar', () => {
    render(
      <BulkAdmissionOfferingActivation
        activation={{ ...state(), selectedRows: [], selectedIds: [] }}
        disabled={false}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('blocks activation during an external loading/error state', () => {
    render(<BulkAdmissionOfferingActivation activation={state()} disabled />);
    expect(screen.getByRole('button', { name: 'Activate Selected' })).toBeDisabled();
  });
});
