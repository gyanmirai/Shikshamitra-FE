import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundRemarksForm from './RefundRemarksForm';

const { query, retry } = vi.hoisted(() => ({ query: vi.fn(), retry: vi.fn() }));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetFeeRefundByIdQuery: query,
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));
const theme = createTheme(defaultSettings);

const student = {
  id: 1,
  name: 'Sample Student',
  board: 'CBSE',
  medium: 'English',
  class: 'UKG',
  division: 'A',
  grNo: '10212',
  rollNo: '2',
  totalPaidFees: 62500,
  totalPendingFees: 0,
  status: 7,
  _refundRequestId: 'sample',
};
const detail = {
  studentName: 'Sample Student',
  studentGrNo: '10212',
  status: 7,
  totalPaidAmount: 62500,
  voucherNumber: 'REF-SAMPLE',
  originalReceiptNumber: 'FIN-SAMPLE',
  approvedAmount: 50000,
  allowedPayoutMethods: ['Cash', 'Bank Transfer (NEFT/RTGS/IMPS)', 'Demand Draft (DD)'],
  processedAmount: 50000,
  reversedAmount: 0,
  lines: [{ amount: 50000 }],
  availableActions: [],
  workflowVersion: 1,
  submittedAt: '2026-10-23T08:00:00Z',
  approverNotes: 'Approved by administrator',
  settlements: [
    {
      id: 'payout',
      attemptNumber: 1,
      method: 'Cash',
      amount: 50000,
      settlementDate: '2026-10-23T09:00:00Z',
      externalReference: 'CASH-SAMPLE',
    },
  ],
};
function setup(availableActions?: string[]) {
  const onClose = vi.fn();
  const onApprove = vi.fn();
  const onReject = vi.fn();
  render(
    <ThemeProvider theme={theme}>
      <RefundRemarksForm
        student={{ ...student, _availableActions: availableActions }}
        open={{ value: true } as any}
        onClose={onClose}
        onApprove={onApprove}
        onReject={onReject}
      />
    </ThemeProvider>
  );
  return { onClose, onApprove, onReject };
}
beforeEach(() => {
  vi.clearAllMocks();
  query.mockReturnValue({
    currentData: detail,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: retry,
  });
});
describe('Refund detail drawer', () => {
  it('shows only this approved request installment and hides Reject despite an old action hint', () => {
    query.mockReturnValue({
      currentData: {
        ...detail,
        status: 2,
        approvedAmount: 3750,
        processedAmount: 0,
        totalAmount: 3750,
        calculatedAmount: 3750,
        lines: [{ amount: 3750, approvedAmount: 3750 }],
        settlements: [],
        availableActions: ['reject', 'recordPayout'],
        feeHeads: [
          {
            feeHeadId: 'tuition',
            feeHeadName: 'General Tuition Fee',
            totalPaid: 25000,
            totalRefunded: 20000,
            items: [
              {
                installmentId: 'tuition-july',
                month: 'July',
                total: 10000,
                paid: 12500,
                refundAmount: 0,
                status: 2,
              },
            ],
          },
          {
            feeHeadId: 'school',
            feeHeadName: 'General School Fees',
            totalPaid: 37500,
            totalRefunded: 30000,
            items: [
              {
                installmentId: 'school-july',
                month: 'July',
                total: 15000,
                paid: 18750,
                refundAmount: 0,
                status: 2,
              },
              {
                installmentId: 'school-december',
                month: 'December',
                total: 15000,
                paid: 18750,
                refundAmount: 3750,
                status: 2,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    setup();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(screen.queryByText('General Tuition Fee')).not.toBeInTheDocument();
    expect(screen.queryByText('July')).not.toBeInTheDocument();
    expect(screen.getByText('December')).toBeVisible();
    expect(screen.queryByText(/50,000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total Refunded/)).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'General School Fees refunds table' })).toBeVisible();
  });
  it('shows the named drawer, saved details, timeline, notes and settlements', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'View Refund Request' })).toBeVisible();
    [
      'Student Information',
      'Refund Information',
      'Refund Timeline',
      'Approver Notes',
      'Settlement History',
      'REF-SAMPLE',
      'FIN-SAMPLE',
      'Approved by administrator',
    ].forEach((value) => expect(screen.getByText(value)).toBeVisible());
    const zero = screen.getByText('Reversed').parentElement!;
    expect(zero.textContent).toContain('0');
    expect(zero.textContent).not.toContain('N/A');
    const methods = screen.getByText('Policy payment methods').parentElement!;
    expect(methods).toHaveTextContent('Cash, Bank Transfer (NEFT/RTGS/IMPS), Demand Draft (DD)');
    expect(
      screen
        .getByText('Refund Information')
        .closest('section')
        ?.querySelector('.MuiDivider-vertical')
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });
  it('closes through both footer Close and the header X', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close View Refund Request' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it('preserves eligible approval actions and keeps Close available', () => {
    query.mockReturnValue({
      currentData: { ...detail, status: 0, availableActions: ['approve', 'reject'] },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    const { onApprove, onReject } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });
  it('shows fetch errors with Retry and keeps record actions disabled', () => {
    query.mockReturnValue({
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: retry,
    });
    setup(['approve', 'reject']);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load refund details');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.queryByText('Refund Information')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });
  it('keeps Close available while loading without displaying partial details', () => {
    query.mockReturnValue({ isLoading: true, isFetching: true, isError: false });
    setup();
    expect(screen.getByLabelText('Loading refund details')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Refund Information')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });
});
