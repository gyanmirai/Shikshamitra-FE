import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LeavePolicyImpactDrawer } from './LeavePolicyImpactDrawer';

import type { LeavePolicyImpactReview } from '../leave-policy-workspace-utils';

vi.mock('./HRPolicySharedUI', () => ({
  DrawerHeader: ({
    title,
    onClose,
    closeDisabled,
  }: {
    title: string;
    onClose: () => void;
    closeDisabled: boolean;
  }) => (
    <header>
      <h2>{title}</h2>
      <button
        type="button"
        aria-label="Close policy impact"
        onClick={onClose}
        disabled={closeDisabled}
      >
        Close
      </button>
    </header>
  ),
}));

const review: LeavePolicyImpactReview = {
  policyId: 'leave-policy',
  policyName: 'Annual leave',
  action: 'update',
  bucketSummary: 'Paid',
  affectedEmployeeCount: null,
  affectedRequestCount: null,
  balanceImpactCount: null,
  payrollMonthRiskCount: null,
  assignmentConflictCount: null,
  risks: [],
  requiresConfirmation: false,
};

describe('Leave policy impact request feedback', () => {
  it('shows the synchronous impact review without claiming a pending preview request', () => {
    const onClose = vi.fn();
    render(<LeavePolicyImpactDrawer open review={review} archiving={false} onClose={onClose} />);
    expect(screen.getByText('Annual leave')).toBeInTheDocument();
    expect(screen.getByText('Staff: Not calculated')).toBeInTheDocument();
    expect(screen.getByText('Requests: Not calculated')).toBeInTheDocument();
    expect(screen.getByText('Balances: Not calculated')).toBeInTheDocument();
    expect(screen.getByText('Payroll risks: Not calculated')).toBeInTheDocument();
    expect(screen.getByText('Assignment conflicts: Not calculated')).toBeInTheDocument();
    expect(
      screen.queryByText(/Loading leave policy impact|Archiving leave policy/)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('announces the actual archive request while retaining the review and existing close locks', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <LeavePolicyImpactDrawer open review={review} archiving onClose={onClose} />
    );
    expect(screen.getByText('Archiving leave policy...').closest('[role="status"]')).toBeTruthy();
    expect(screen.queryByText(/Loading leave policy impact/)).not.toBeInTheDocument();
    expect(screen.getByText('Annual leave')).toBeInTheDocument();
    expect(screen.getByText('Staff: Not calculated')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar', { hidden: true })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Close policy impact' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Close$/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).not.toHaveBeenCalled();

    rerender(<LeavePolicyImpactDrawer open review={review} archiving={false} onClose={onClose} />);
    expect(screen.queryByText('Archiving leave policy...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Close$/ })).toBeEnabled();
  });
});
