import type { TabsProps } from '@mui/material';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { PaymentHistoryItem } from 'src/redux/feeCollection/feeCollection';

import { Tabs } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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

const renderDetail = (ui: React.ReactElement, grants: string[] = []) =>
  render(
    <Provider
      store={configureStore({
        reducer: {
          auth: () => ({
            permissionsInitialized: true,
            loading: false,
            permissions: grants.map((name) => ({ name, isGranted: true })),
          }),
        },
      })}
    >
      {ui}
    </Provider>
  );

describe('legacy finance fee detail payment history', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes supplied server payment records to the payment history tab unchanged', () => {
    const payments: PaymentHistoryItem[] = [
      {
        paymentId: 'payment-1',
        receiptNumber: 'REC-1',
        date: '2026-10-15T11:13:33Z',
        amount: 275.25,
        paymentMethods: [0],
        status: 1,
      },
    ];
    renderDetail(
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
    renderDetail(
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

  it('keeps collection and audit actions unavailable without their exact grants', () => {
    renderDetail(
      <FinanceStudentDetailedFeeComponent
        studentId="student-1"
        student={null}
        collectFeesDialog={dialog}
        viewDialog={dialog}
      />,
      ['Finance.Fees.FeeCollections.View', 'Finance.AuditTrail.View']
    );
    expect(screen.queryByRole('button', { name: 'Collect Fees' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Audit Trail' })).not.toBeInTheDocument();
  });

  it('enables collection and audit only with their matching capabilities', () => {
    renderDetail(
      <FinanceStudentDetailedFeeComponent
        studentId="student-1"
        student={null}
        collectFeesDialog={dialog}
        viewDialog={dialog}
      />,
      ['Finance.Fees.FeeCollections.Add', 'Finance.Auditing.View']
    );
    expect(screen.getByRole('button', { name: 'Audit Trail' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Collect Fees' }));
    expect(dialog.onTrue).toHaveBeenCalledOnce();
    expect(dialog.onFalse).toHaveBeenCalledOnce();
  });
});
