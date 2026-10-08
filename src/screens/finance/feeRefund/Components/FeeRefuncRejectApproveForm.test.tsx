import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import FeeRefundReasonApprovalForm from './FeeRefuncRejectApproveForm';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({ BackPopUpChecked: ({ children }: any) => children }));
vi.mock('src/components/customDialog', () => ({ DialogScrollContent: ({ children }: any) => children }));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));
vi.mock('src/screens/finance/components/FinanceRoutingFields', () => ({ default: () => null }));

describe('refund approval policy payment methods', () => {
  it('shows only snapshot methods and preserves a legacy selected alias', () => {
    render(<FeeRefundReasonApprovalForm mode="Approve" onClose={vi.fn()} allowedPayoutMethods={['UPI']} defaultMethod="Upi" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'UPI' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Cash' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Cheque' })).not.toBeInTheDocument();
  });

  it('disables approval when no snapshot methods are available', () => {
    render(<FeeRefundReasonApprovalForm mode="Approve" onClose={vi.fn()} allowedPayoutMethods={[]} />);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByText('No payment methods are available under this refund policy.')).toBeInTheDocument();
  });

  it('allows rejection with a reason without requiring a payment method', async () => {
    const onClose = vi.fn();
    render(<FeeRefundReasonApprovalForm mode="Reject" onClose={onClose} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason *' }), { target: { value: 'Not eligible' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true, 'Not eligible', undefined));
  });
});
