import type { TabsProps } from '@mui/material';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { PaymentHistoryItem } from 'src/redux/feeCollection/feeCollection';

import { Tabs } from '@mui/material';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FinanceStudentDetailedFeeComponent from './FinanceStudentDetailedFeeComponent';

const { paymentHistory } = vi.hoisted(() => ({ paymentHistory: vi.fn() }));

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: (props: TabsProps) => <Tabs {...props} />,
}));
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/AuditTrail/components/FinanceFeeAuditDrawer', () => ({
  default: () => null,
}));
vi.mock('./ViewDetailsComponent/FeeConcession', () => ({ default: () => null }));
vi.mock('./ViewDetailsComponent/OutstandingFees', () => ({ default: () => null }));
vi.mock('./ViewDetailsComponent/OverviewFeeDetails', () => ({ default: () => null }));
vi.mock('./ViewDetailsComponent/PaymentHistory', () => ({
  default: ({ payments }: { payments?: PaymentHistoryItem[] }) => {
    paymentHistory(payments);
    return <div>{payments?.map((payment) => payment.receiptNumber).join(', ')}</div>;
  },
}));

const dialog: UseBooleanReturn = {
  value: false,
  onTrue: vi.fn(),
  onFalse: vi.fn(),
  onToggle: vi.fn(),
  setValue: vi.fn(),
};

describe('legacy finance fee detail payment history', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes supplied server payment records to the payment history tab unchanged', () => {
    const payments: PaymentHistoryItem[] = [
      {
        paymentId: 'payment-1',
        receiptNumber: 'REC-1',
        date: '2026-10-15T11:13:33Z',
        amount: 275.25,
        paymentMethods: ['Cash'],
      },
    ];
    render(
      <FinanceStudentDetailedFeeComponent
        studentId="student-1"
        student={null}
        payments={payments}
        collectFeesDialog={dialog}
        viewDialog={dialog}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Payment History' }));

    expect(paymentHistory).toHaveBeenLastCalledWith(payments);
    expect(screen.getByText('REC-1')).toBeInTheDocument();
  });

  it('does not manufacture payment records when none were supplied', () => {
    render(
      <FinanceStudentDetailedFeeComponent
        studentId="student-1"
        student={null}
        collectFeesDialog={dialog}
        viewDialog={dialog}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Payment History' }));

    expect(paymentHistory).toHaveBeenLastCalledWith(undefined);
  });
});
