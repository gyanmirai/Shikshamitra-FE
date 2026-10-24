import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import FeeRefundReasonApprovalForm from './FeeRefuncRejectApproveForm';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: any) => children,
}));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));

describe('refund approval and rejection', () => {
  it('approves without collecting expense routing or payment details', async () => {
    const onClose = vi.fn();
    render(<FeeRefundReasonApprovalForm mode="Approve" onClose={onClose} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Expense category|bank account/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true, undefined));
  });

  it('allows rejection with a reason without requiring a payment method', async () => {
    const onClose = vi.fn();
    render(<FeeRefundReasonApprovalForm mode="Reject" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await screen.findByText('Reason is required');
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason *' }), {
      target: { value: 'Not eligible' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true, 'Not eligible'));
  });
});
