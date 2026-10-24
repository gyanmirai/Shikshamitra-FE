import React from 'react';
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
    <RefundRemarksForm
      student={{ ...student, _availableActions: availableActions }}
      open={{ value: true } as any}
      onClose={onClose}
      onApprove={onApprove}
      onReject={onReject}
    />
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
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
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
