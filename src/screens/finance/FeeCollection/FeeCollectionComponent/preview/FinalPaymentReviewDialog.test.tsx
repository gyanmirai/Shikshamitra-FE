import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import FinalPaymentReviewDialog from './FinalPaymentReviewDialog';

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children, disableClose }: any) =>
    open ? (
      <div role="dialog" aria-label="Payment Verification" data-close-disabled={disableClose}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
const buildProps = (method = 'Credit Card') => ({
  open: true,
  onClose: vi.fn(),
  onConfirmCollect: vi.fn(),
  onSavePending: vi.fn(),
  loading: false,
  student: null,
  feeHeadMap: { project: 'Project Fee', tuition: 'Tuition Fee' },
  chargesData: [],
  formValues: {
    selectedItems: [],
    charges: [],
    remarks: '',
    payment: { paymentMethod: method, amount: '1000', details: { transactionId: 'CARD-123' } },
  } as any,
});
const wrap = (props: React.ComponentProps<typeof FinalPaymentReviewDialog>) => (
  <ThemeProvider theme={theme}>
    <FinalPaymentReviewDialog {...props} />
  </ThemeProvider>
);

describe('Payment receipt issuance', () => {
  it.each(['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Cheque', 'Demand Draft'])(
    '%s issues provisional evidence and cannot finalize at the counter',
    (method) => {
      const props = buildProps(method);
      render(wrap(props));
      expect(
        screen.getByText(/A provisional receipt is generated immediately and appears in Receipts/)
      ).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Record & issue provisional receipt' }));
      expect(props.onSavePending).toHaveBeenCalledOnce();
      expect(props.onConfirmCollect).not.toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: 'Accept & Confirm' })).not.toBeInTheDocument();
    }
  );

  it('prevents duplicate submission and dismissal while saving', () => {
    const props = { ...buildProps(), loading: true };
    render(wrap(props));
    const action = screen.getByRole('button', { name: 'Record & issue provisional receipt' });
    expect(action).toBeDisabled();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-close-disabled', 'true');
    fireEvent.click(action);
    expect(props.onSavePending).not.toHaveBeenCalled();
  });

  it('issues an official cash receipt immediately', () => {
    const props = buildProps('Cash');
    render(wrap(props));
    fireEvent.click(screen.getByRole('button', { name: 'Collect & issue receipt' }));
    expect(props.onConfirmCollect).toHaveBeenCalledOnce();
    expect(props.onSavePending).not.toHaveBeenCalled();
  });

  it('reviews the allocated fee amounts rather than the outstanding dues', () => {
    const props = buildProps('Cash');
    props.formValues.selectedItems = [
      { feeHeadId: 'project', period: '2026-10', dueAmount: 250 },
      { feeHeadId: 'tuition', period: '2026-10', dueAmount: 1000 },
    ];
    render(wrap(props));
    const fees = screen.getByRole('list', { name: 'Payment breakdown' });
    const rows = within(fees).getAllByRole('listitem');
    expect(within(rows[0]).getByText('Project Fee')).toBeVisible();
    expect(within(rows[0]).getByText(/^₹\s*250$/)).toBeVisible();
    expect(within(rows[1]).getByText('Tuition Fee')).toBeVisible();
    expect(within(rows[1]).getByText(/^₹\s*750$/)).toBeVisible();
    expect(screen.getByText('Total · Cash')).toBeVisible();
    expect(screen.queryByText('Fee Heads')).not.toBeInTheDocument();
  });

  it('includes selected charges in their allocation order', () => {
    const props = {
      ...buildProps('Cash'),
      chargesData: [
        {
          chargeId: 'activity',
          sourceType: 'Charge' as const,
          sourceId: 'activity',
          chargeName: 'Activity charge',
          amount: 300,
        },
        {
          chargeId: 'transport',
          sourceType: 'Charge' as const,
          sourceId: 'transport',
          chargeName: 'Transport charge',
          amount: 800,
        },
      ],
    };
    props.formValues.charges = ['transport', 'activity'];
    render(wrap(props));
    const rows = within(screen.getByRole('list', { name: 'Payment breakdown' })).getAllByRole(
      'listitem'
    );
    expect(within(rows[0]).getByText('Transport charge')).toBeVisible();
    expect(within(rows[0]).getByText(/^₹\s*800$/)).toBeVisible();
    expect(within(rows[1]).getByText('Activity charge')).toBeVisible();
    expect(within(rows[1]).getByText(/^₹\s*200$/)).toBeVisible();
  });

  it('locks the cash action and close control during collection', () => {
    const props = { ...buildProps('Cash'), loading: true };
    render(wrap(props));
    const action = screen.getByRole('button', { name: 'Collect & issue receipt' });
    expect(action).toBeDisabled();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-close-disabled', 'true');
    fireEvent.click(action);
    expect(props.onConfirmCollect).not.toHaveBeenCalled();
  });

  it('shows cheque references in their own section with readable bank and date values', () => {
    const props = buildProps('Cheque');
    props.formValues.payment.details = {
      chequeNumber: '101876',
      bankName: 'Bank of Baroda',
      chequeDate: '2026-10-29',
      payeeName: 'School office',
      bankAccount: 'school-account',
    };
    render(
      wrap({ ...props, bankAccounts: [{ id: 'school-account', name: 'Bank of Baroda · 8318' }] })
    );
    expect(screen.getByRole('heading', { name: 'Payment Summary' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Reference Details' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Verification Status' })).toBeVisible();
    expect(screen.getByText('101876')).toBeVisible();
    expect(screen.getByText('29/10/2026')).toBeVisible();
    expect(screen.getByText('Bank of Baroda · 8318')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reference Details information' })).toBeVisible();
    const action = screen.getByRole('button', { name: 'Record & issue provisional receipt' });
    expect(action).toHaveClass('MuiButton-colorInherit', 'MuiButton-sizeSmall');
    expect(action).not.toHaveClass('MuiButton-fullWidth');
  });

  it('shows non-cash fee allocations and omits an empty reference section', () => {
    const props = buildProps('UPI');
    props.formValues.selectedItems = [{ feeHeadId: 'tuition', period: '2026-10', dueAmount: 2500 }];
    props.formValues.payment.details = {};
    render(wrap(props));
    expect(screen.getByText('Tuition Fee')).toBeVisible();
    expect(screen.getByText('Total · UPI')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Reference Details' })).not.toBeInTheDocument();
  });
});
