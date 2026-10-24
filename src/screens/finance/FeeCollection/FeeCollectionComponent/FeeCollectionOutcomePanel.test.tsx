import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import FeeCollectionOutcomePanel from './FeeCollectionOutcomePanel';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));

const theme = createTheme(defaultSettings);
const output: CollectFeeOutput = {
  id: 'collection-one',
  studentId: 'student-one',
  studentName: 'Student One',
  academicYearId: 'year-one',
  totalAmount: 500,
  receivedAmount: 500,
  status: 1,
  receiptNumber: 'R-1',
  collectedBy: 'Cashier',
  collectedAt: '2026-10-16T12:00:00Z',
  createdAt: '2026-10-16T12:00:00Z',
  paidFeeHeads: [],
  paidDueFees: [],
};

const renderPanel = (props: React.ComponentProps<typeof FeeCollectionOutcomePanel>) =>
  render(
    <ThemeProvider theme={theme}>
      <FeeCollectionOutcomePanel {...props} />
    </ThemeProvider>
  );

describe('collection outcome capabilities', () => {
  it.each([
    {
      receiptGrouping: 'Combined',
      feeReceiptId: 'combined',
      chargeReceiptId: undefined,
      count: 'one entry',
    },
    {
      receiptGrouping: 'Separate',
      feeReceiptId: 'fees',
      chargeReceiptId: 'charges',
      count: 'two entries',
    },
  ] as const)(
    'explains the reconciliation entry count for $receiptGrouping receipts',
    (receipt) => {
      renderPanel({
        collectResponse: {
          ...output,
          ...receipt,
          status: FeeCollectionStatusType.InReconciliation,
        },
      });
      expect(screen.getByText('Pending verification')).toBeVisible();
      expect(screen.getByText(new RegExp(`Reconciliation shows ${receipt.count}`))).toBeVisible();
    }
  );

  it('keeps the default Finance audit action scoped to the student and correlation', () => {
    renderPanel({ collectResponse: { ...output, correlationId: 'collection/one' } });

    expect(screen.getByRole('link', { name: 'View in audit trail' })).toHaveAttribute(
      'href',
      '/finance/audit-trail?studentId=student-one&correlationId=collection%2Fone'
    );
    expect(screen.getByText('R-1')).toBeVisible();
    expect(screen.getByText('Collection reference')).toBeVisible();
    expect(screen.queryByText('Receipt number')).not.toBeInTheDocument();
    expect(screen.queryByText(/Receipt access is unavailable/)).not.toBeInTheDocument();
  });

  it('honors an explicit audit opt-out even when the collection has a Student ID', () => {
    renderPanel({ collectResponse: output, showAuditTrail: false });

    expect(screen.queryByRole('link', { name: 'View in audit trail' })).not.toBeInTheDocument();
  });

  it('does not manufacture a student audit link for an applicant-backed collection', () => {
    renderPanel({ collectResponse: { ...output, studentId: null } });

    expect(screen.queryByRole('link', { name: 'View in audit trail' })).not.toBeInTheDocument();
    expect(screen.getByText('Payment recorded')).toBeVisible();
  });

  it('shows the established receipt-access notice and a usable close action without an audit summary', () => {
    const onClose = vi.fn();
    renderPanel({
      collectResponse: {
        ...output,
        studentId: null,
        status: FeeCollectionStatusType.InReconciliation,
      },
      showAuditTrail: false,
      receiptAccessUnavailable: true,
      onClose,
    });

    expect(screen.getByText('Payment recorded')).toBeVisible();
    expect(screen.getByText('Pending verification')).toBeVisible();
    expect(
      screen.getByText('Payment recorded. Receipt access is unavailable for your account.')
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'View in audit trail' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not describe overdue collections as awaiting verification', () => {
    renderPanel({ collectResponse: { ...output, status: FeeCollectionStatusType.Overdue } });

    expect(screen.queryByText('Pending verification')).not.toBeInTheDocument();
    expect(screen.queryByText(/Reconciliation shows/)).not.toBeInTheDocument();
  });
});
