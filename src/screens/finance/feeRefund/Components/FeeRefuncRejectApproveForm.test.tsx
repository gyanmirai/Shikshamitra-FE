import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import FeeRefundReasonApprovalForm from './FeeRefuncRejectApproveForm';

const routing = vi.hoisted(() => ({
  currentData: {
    expenseCategories: [{ id: 'expense', label: 'Refund expense' }],
    bankAccounts: [{ id: 'bank', label: 'School account' }],
  },
  refetch: vi.fn(),
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => routing,
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: any) => children,
}));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));

describe('refund approval and rejection', () => {
  it('does not request a bank for cash approval', async () => {
    const onClose = vi.fn();
    render(
      <FeeRefundReasonApprovalForm
        mode="Approve"
        cashRefund
        academicYearId="year"
        defaultExpenseCategoryId="expense"
        onClose={onClose}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /Expense category/ })).toHaveTextContent(
        'Refund expense'
      )
    );
    expect(screen.queryByRole('combobox', { name: /Source school bank account/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Approve and pay cash' })).toBeEnabled();
  });

  it('collects only an expense category for cash approval', async () => {
    const onClose = vi.fn();
    render(
      <FeeRefundReasonApprovalForm
        mode="Approve"
        cashRefund
        academicYearId="year"
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Approve and pay cash' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Expense category/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'Refund expense' }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve and pay cash' }));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(null, true, undefined, {
        expenseCategoryId: 'expense',
      })
    );
  });

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
