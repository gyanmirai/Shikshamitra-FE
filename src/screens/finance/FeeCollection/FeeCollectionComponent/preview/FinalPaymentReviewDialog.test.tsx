import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import FinalPaymentReviewDialog from './FinalPaymentReviewDialog';

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children, disableClose }: any) => open ? (
    <div role="dialog" aria-label="Payment Verification" data-close-disabled={disableClose}>{children}</div>
  ) : null,
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
const buildProps = (method = 'Credit Card') => ({
  open: true, onClose: vi.fn(), onConfirmCollect: vi.fn(), onSavePending: vi.fn(),
  loading: false, student: null,
  formValues: {
    selectedItems: [], charges: [], remarks: '',
    payment: { paymentMethod: method, amount: '1000', details: { transactionId: 'CARD-123' } },
  } as any,
});
const wrap = (props: ReturnType<typeof buildProps>) => (
  <ThemeProvider theme={theme}><FinalPaymentReviewDialog {...props} /></ThemeProvider>
);

describe('Payment receipt issuance', () => {
  it.each(['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Cheque', 'Demand Draft'])(
    '%s issues provisional evidence and cannot finalize at the counter', (method) => {
      const props = buildProps(method);
      render(wrap(props));
      expect(screen.getByText(/A provisional receipt is generated immediately and appears in Receipts/)).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Record & Issue Provisional Receipt' }));
      expect(props.onSavePending).toHaveBeenCalledOnce();
      expect(props.onConfirmCollect).not.toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: 'Accept & Confirm' })).not.toBeInTheDocument();
    }
  );

  it('prevents duplicate submission and dismissal while saving', () => {
    const props = { ...buildProps(), loading: true };
    render(wrap(props));
    const action = screen.getByRole('button', { name: 'Record & Issue Provisional Receipt' });
    expect(action).toBeDisabled();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-close-disabled', 'true');
    fireEvent.click(action);
    expect(props.onSavePending).not.toHaveBeenCalled();
  });

  it('issues an official cash receipt immediately', () => {
    const props = buildProps('Cash');
    render(wrap(props));
    fireEvent.click(screen.getByRole('button', { name: 'Collect & Issue Official Receipt' }));
    expect(props.onConfirmCollect).toHaveBeenCalledOnce();
    expect(props.onSavePending).not.toHaveBeenCalled();
  });
});
