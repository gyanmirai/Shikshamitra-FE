import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import CollectionLedgerTable from './CollectionLedgerTable';
import { FeeCollectionWaiverContext } from './feeCollectionContext';
import AllocationPreviewTable from './preview/AllocationPreviewTable';

import type { FeeLedgerListProps } from './FeeLedgerList';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('@mui/icons-material', () => {
  const Icon = () => null;
  return {
    ArrowDownward: Icon,
    ArrowUpward: Icon,
    Clear: Icon,
    Close: Icon,
    ExpandLess: Icon,
    ExpandMore: Icon,
    RemoveRedEye: Icon,
    Search: Icon,
  };
});
// Keep real table rows and row actions; only layout measurement is outside this regression.
vi.mock('src/components/customizabaleTable/hooks/useStickyColumns', () => ({
  useStickyColumns: () => ({ getStickyStyle: () => ({}) }),
}));
// Never execute a financial write from these presentation capability tests.
vi.mock('./FeeWaiverToggle', () => ({
  default: ({ sourceType, sourceId }: { sourceType: string; sourceId: string }) => (
    <button type="button" data-source-id={sourceId}>
      Waive {sourceType}
    </button>
  ),
}));

const theme = createTheme(defaultSettings);
const store = configureStore({ reducer: { confirmPopup } });
const LedgerTestProviders = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </Provider>
);
const ledgerProps = (): FeeLedgerListProps => ({
  data: {
    monthWise: [
      {
        month: FeeMonth.June,
        year: 2026,
        totalDue: 500,
        items: [
          {
            dueFeeId: 'due-one',
            feeHeadId: 'tuition',
            feeHeadName: 'Tuition',
            total: 500,
            paid: 0,
            due: 500,
            lateFeeAmount: 50,
            status: FeeCollectionStatusType.Pending,
          },
        ],
      },
    ],
    feeHeadWise: [],
  },
  activeTab: 'by-month',
  selectedItems: [],
  charges: [],
  chargesData: [
    {
      chargeId: 'charge-one',
      sourceId: 'charge-one',
      sourceType: 'Charge',
      chargeName: 'Lab charge',
      amount: 100,
      dueDate: '2026-06-01',
      status: FeeCollectionStatusType.Pending,
    },
  ],
  onSelectionChange: vi.fn(),
  onChargesChange: vi.fn(),
});

describe('collection ledger waiver capabilities', () => {
  it('keeps the review in collection order across different installment months', () => {
    const makeRow = (key: string, name: string, period: string) => ({
      type: 'fee' as const,
      key,
      dueFeeId: key,
      feeHeadId: name,
      feeHeadName: name,
      period,
      originalAmount: 100,
      paidAmount: 50,
      principalPaidAmount: 50,
      lateFeePaidAmount: 0,
      remainingAmount: 50,
      status: FeeCollectionStatusType.Partial,
    });
    render(
      <LedgerTestProviders>
        <AllocationPreviewTable
          preserveOrder
          allocatedRows={[
            makeRow('transport-first', 'Transport first', 'Aug 2026'),
            makeRow('transport-second', 'Transport second', 'Nov 2026'),
            makeRow('tuition-first', 'Tuition first', 'Aug 2026'),
          ]}
        />
      </LedgerTestProviders>
    );
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Transport first');
    expect(rows[2]).toHaveTextContent('Transport second');
    expect(rows[3]).toHaveTextContent('Tuition first');
  });
  it('keeps two custom installments in one month separate in the installment view', () => {
    const props = ledgerProps();
    const first = props.data.monthWise[0].items[0];
    props.data.monthWise[0].items = [
      {
        ...first,
        installmentId: 'schedule-first',
        installmentLabel: 'First installment',
        dueDate: '2026-06-05',
      },
      {
        ...first,
        dueFeeId: 'due-two',
        installmentId: 'schedule-second',
        installmentLabel: 'Second installment',
        dueDate: '2026-06-20',
      },
    ];
    render(
      <LedgerTestProviders>
        <CollectionLedgerTable {...props} layout="ledger" activeTab="by-month" groupByInstallment />
      </LedgerTestProviders>
    );
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles.indexOf('First installment')).toBeLessThan(titles.indexOf('Second installment'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Second installment' }));
    expect(props.onSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({ dueFeeId: 'due-two' }),
    ]);
  });

  it('uses selector-safe identifiers for legacy installment labels containing spaces and punctuation', () => {
    const props = ledgerProps();
    Object.assign(props.data.monthWise[0].items[0], {
      installmentLabel: 'Quarter 1 — Jun to Aug',
      dueDate: '2026-06-05',
    });
    render(
      <LedgerTestProviders>
        <CollectionLedgerTable {...props} layout="ledger" activeTab="by-month" groupByInstallment />
      </LedgerTestProviders>
    );
    const group = screen.getByRole('button', { name: /^Quarter 1 — Jun to Aug/ });
    expect(group.id).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(document.querySelector(`#${group.id}`)).toBe(group);
  });
  it('provides keyboard-accessible header and section help with the standard Close action', async () => {
    const user = userEvent.setup();
    render(
      <LedgerTestProviders>
        <CollectionLedgerTable {...ledgerProps()} layout="ledger" />
      </LedgerTestProviders>
    );
    const view = screen.getByRole('row', { name: 'Open Tuition, June 2026' });
    await user.click(view);
    expect(screen.getByRole('dialog', { name: 'Tuition' })).toBeVisible();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tuition information' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Review the selected fee or charge'
    );
    await user.tab(); // Header close action.
    await user.tab(); // Scrollable dialog body.
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fee Details information' })).toHaveFocus();
    expect(
      await screen.findByText(
        'The due period, installment, and current payment status of this entry.'
      )
    ).toBeVisible();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Amount Breakdown information' })).toHaveFocus();
    expect(await screen.findByText(/All amounts are in INR\./)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(view).toHaveFocus();
  }, 20_000);
  it('groups fee context and amounts, preserves saved explanations, and closes without changing selection', () => {
    const props = ledgerProps();
    Object.assign(props.data.monthWise[0].items[0], {
      installmentLabel: 'Half-Yearly 1',
      reconciliationAmount: 25,
      concessionAmount: 15,
      lateFeeExplanation: 'Late fee under the assigned collection policy.',
      lateFeeWaivedAmount: 10,
      refundAmount: 20,
      refundDescription: 'Approved refund',
      scheduledTotal: 600,
      prorationExplanation: 'Prorated from the joining date.',
      prorationPolicyName: 'Joining date policy',
      prorationPolicyVersionNumber: 2,
    });
    render(
      <LedgerTestProviders>
        <CollectionLedgerTable {...props} layout="ledger" />
      </LedgerTestProviders>
    );

    fireEvent.click(screen.getByRole('row', { name: 'Open Tuition, June 2026' }));
    const context = within(
      screen.getByRole('heading', { name: 'Fee Details' }).closest('section')!
    );
    expect(context.getByText('June 2026')).toBeVisible();
    expect(context.getByText('Half-Yearly 1')).toBeVisible();
    expect(context.getByText('Pending')).toBeVisible();
    const amounts = within(
      screen.getByRole('heading', { name: 'Amount Breakdown' }).closest('section')!
    );
    expect(amounts.getByText('Outstanding amount')).toBeVisible();
    expect(amounts.getByText(/550/)).toBeVisible();
    [
      'Total',
      'Paid',
      'Outstanding principal',
      'Reconciliation amount',
      'Concession',
      'Late fee',
      'Late fee waived',
      'Refund',
      'Scheduled total',
      'Proration',
    ].forEach((label) => {
      expect(amounts.getByText(label)).toBeVisible();
    });
    expect(amounts.getByText('Approved refund')).toBeVisible();
    expect(amounts.getByText('Late fee under the assigned collection policy.')).toBeVisible();
    expect(amounts.getByText('Joining date policy, v2')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('heading', { name: 'Amount Breakdown' })).not.toBeInTheDocument();
    expect(props.onSelectionChange).not.toHaveBeenCalled();
    expect(props.onChargesChange).not.toHaveBeenCalled();
  });

  it('keeps charge explanations and waiver amounts in charge details', () => {
    const props = ledgerProps();
    Object.assign(props.chargesData![0], { explanation: 'Lab materials', waivedAmount: 20 });
    render(
      <LedgerTestProviders>
        <CollectionLedgerTable {...props} layout="ledger" />
      </LedgerTestProviders>
    );
    fireEvent.click(screen.getByRole('button', { name: /^Additional Charges/ }));
    fireEvent.click(screen.getByRole('row', { name: 'Open Lab charge, 2026-06-01' }));
    expect(screen.getByRole('heading', { name: 'Charge Details' })).toBeVisible();
    expect(screen.getByText('Lab materials')).toBeVisible();
    expect(screen.getByText('Charge waived')).toBeVisible();
    expect(screen.queryByText('Refund')).not.toBeInTheDocument();
    expect(screen.queryByText('Proration')).not.toBeInTheDocument();
  });

  it.each([
    ['Tuition, June 2026', 'LateFee', 'due-one'],
    ['Lab charge, 2026-06-01', 'Charge', 'charge-one'],
  ])('preserves Finance and suppresses Admissions waivers for %s', (label, type, sourceId) => {
    const ledger = <CollectionLedgerTable {...ledgerProps()} layout="ledger" />;
    const view = render(<LedgerTestProviders>{ledger}</LedgerTestProviders>);

    if (label.startsWith('Lab')) {
      const group = screen.getByRole('button', { name: /^Additional Charges/ });
      if (group.getAttribute('aria-expanded') === 'false') fireEvent.click(group);
    }
    fireEvent.click(screen.getByRole('row', { name: `Open ${label}` }));
    expect(screen.getByRole('button', { name: `Waive ${type}` })).toHaveAttribute(
      'data-source-id',
      sourceId
    );

    view.rerender(
      <LedgerTestProviders>
        <FeeCollectionWaiverContext.Provider value={false}>
          {ledger}
        </FeeCollectionWaiverContext.Provider>
      </LedgerTestProviders>
    );
    if (label.startsWith('Lab')) {
      const group = screen.getByRole('button', { name: /^Additional Charges/ });
      if (group.getAttribute('aria-expanded') === 'false') fireEvent.click(group);
    }
    fireEvent.click(screen.getByRole('row', { name: `Open ${label}` }));
    expect(screen.getByText('Outstanding principal')).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Waive / })).not.toBeInTheDocument();
  });
});
