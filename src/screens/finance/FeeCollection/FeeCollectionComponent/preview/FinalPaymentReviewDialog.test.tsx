import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
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

describe('Payment verification actions', () => {
  it.each(['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI'])(
    '%s explains that Accept & Confirm remains pending finance verification', (method) => {
      render(wrap(buildProps(method)));
      expect(screen.getByText(/Both actions create a provisional receipt in Verify pending receipts/)).toBeVisible();
      expect(screen.getByRole('button', { name: 'Accept & Confirm' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Move to Reconciliation' })).toBeEnabled();
    }
  );

  it.each(['Accept & Confirm', 'Move to Reconciliation'])(
    'shows exactly one loader on %s and locks its sibling and dismissal', (action) => {
      const props = buildProps();
      const view = render(wrap(props));
      fireEvent.click(screen.getByRole('button', { name: action }));
      expect(action === 'Accept & Confirm' ? props.onConfirmCollect : props.onSavePending).toHaveBeenCalledOnce();
      view.rerender(wrap({ ...props, loading: true }));
      const active = screen.getByRole('button', { name: action });
      expect(screen.getAllByRole('progressbar')).toHaveLength(1);
      expect(within(active).getByRole('progressbar')).toBeInTheDocument();
      screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
      expect(screen.getByRole('dialog')).toHaveAttribute('data-close-disabled', 'true');
      fireEvent.click(active);
      expect(action === 'Accept & Confirm' ? props.onConfirmCollect : props.onSavePending).toHaveBeenCalledOnce();
    }
  );

  it('keeps immediate final receipt action for cash', () => {
    render(wrap(buildProps('Cash')));
    expect(screen.getByRole('button', { name: 'Final Submit & Generate Receipt' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Move to Reconciliation' })).not.toBeInTheDocument();
  });
});
