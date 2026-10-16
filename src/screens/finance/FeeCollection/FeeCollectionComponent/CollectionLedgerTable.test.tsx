import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import CollectionLedgerTable from './CollectionLedgerTable';
import { FeeCollectionWaiverContext } from './feeCollectionContext';

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
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? children : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
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
  it.each([
    ['Tuition, June 2026', 'LateFee', 'due-one'],
    ['Lab charge, 2026-06-01', 'Charge', 'charge-one'],
  ])('preserves Finance and suppresses Admissions waivers for %s', (label, type, sourceId) => {
    const ledger = <CollectionLedgerTable {...ledgerProps()} layout="ledger" />;
    const view = render(<ThemeProvider theme={theme}>{ledger}</ThemeProvider>);

    fireEvent.click(screen.getByRole('button', { name: `View ${label}` }));
    expect(screen.getByRole('button', { name: `Waive ${type}` })).toHaveAttribute(
      'data-source-id',
      sourceId
    );

    view.rerender(
      <ThemeProvider theme={theme}>
        <FeeCollectionWaiverContext.Provider value={false}>
          {ledger}
        </FeeCollectionWaiverContext.Provider>
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: `View ${label}` }));
    expect(screen.getByText('Outstanding principal')).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Waive / })).not.toBeInTheDocument();
  });
});
