import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ReadOnlyConcessionApprovalView from './ReadOnlyConcessionApprovalView';

const state = vi.hoisted(() => ({
  context: {} as any,
  preview: vi.fn(),
  approve: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/utils/icons', () => ({ GlobalIcons: {} }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: any) => <section>{children}</section>,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@mui/material', () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  return {
    Box: Container,
    Stack: Container,
    Typography: Container,
    Skeleton: () => null,
    TextField: () => null,
    Alert: ({ children, action }: any) => (
      <div role="alert">
        {children}
        {action}
      </div>
    ),
    Button: ({ children, onClick, disabled }: any) => (
      <button type="button" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  };
});
vi.mock('@mui/lab', () => ({
  LoadingButton: ({ children, onClick, disabled, loading }: any) => (
    <button type="button" onClick={onClick} disabled={disabled || loading}>
      {children}
    </button>
  ),
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useGetConcessionApprovalContextQuery: () => ({ data: state.context, refetch: state.refetch }),
  usePreviewConcessionApprovalMutation: () => [state.preview, {}],
  useApproveConcessionRequestMutation: () => [state.approve, {}],
}));
const approvedMessage =
  'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.';
const item = {
  studentConcessionTypeRequestId: 'pending-1000',
  concessionTypeName: 'School concession',
} as any;
beforeEach(() => {
  vi.clearAllMocks();
  state.context = {
    concessionRequestId: 'pending-1000',
    concessionPolicyName: 'Fixed concession',
    concessionPolicyVersion: 1,
    requestConcurrencyStamp: 'stamp',
    previewFingerprint: 'preview',
    totalRequestedConcessionAmount: 1000,
    feeHeadGroups: [],
  };
  state.preview.mockReturnValue({
    unwrap: async () => ({
      totalApprovedAmount: 1000,
      refundRequestAmount: 0,
      autoCreateRefund: false,
    }),
  });
  state.approve.mockReturnValue({ unwrap: async () => ({ refundRequests: [] }) });
});

describe('concession benefit approval eligibility', () => {
  it.each(['Approved', 'PartiallyReversed'])(
    'blocks pending ₹1,000 approval while an existing %s benefit remains',
    (status) => {
      state.context.benefitBlocker = {
        code: 'Finance:Concession:010034',
        message: 'Finance:Concession:010034',
        blockingRequestId: 'approved-200',
        blockingStatus: status,
      };
      const onBack = vi.fn();
      render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={onBack} />);
      expect(screen.getByRole('alert')).toHaveTextContent(approvedMessage);
      expect(screen.getByRole('button', { name: 'Review impact' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Review impact' }));
      expect(state.preview).not.toHaveBeenCalled();
      expect(state.approve).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(onBack).toHaveBeenCalledTimes(1);
    }
  );

  it('keeps review available when the server excludes the pending request itself', async () => {
    state.context.benefitBlocker = null;
    render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review impact' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirm approval' })).toBeEnabled()
    );
    expect(state.approve).not.toHaveBeenCalled();
  });

  it('keeps a duplicate-benefit race failure visible with its support reference', async () => {
    state.preview.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('One or more business rules were violated.'), {
          data: {
            errorCode: 'Finance:Concession:010034',
            detail: 'One or more business rules were violated.',
            traceId: 'duplicate-benefit-reference',
          },
        });
      },
    });
    render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review impact' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('already has an approved benefit')
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Reference: duplicate-benefit-reference');
    expect(state.approve).not.toHaveBeenCalled();
  });
});
