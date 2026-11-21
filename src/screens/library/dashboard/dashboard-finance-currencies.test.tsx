import { it, vi, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { formatNumber } from 'src/utils/formate_number';

import { renderFinancialPanel } from './dashboard-finance.fixture';
import {
  financePosition,
  financeCurrency,
  dashboardFinancePayload,
} from './dashboard-finance-data.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/chart', () => ({
  Chart: () => <div data-testid="financial-chart" />,
  useChart: (value: unknown) => value,
}));

it('keeps separate currency buckets without a combined amount or rate', () => {
  renderFinancialPanel('admin', {
    ...dashboardFinancePayload,
    financePosition: {
      ...financePosition,
      currencyTotals: [
        financeCurrency,
        {
          ...financeCurrency,
          currency: 'USD',
          acceptedAmountText: '32.59',
          settledAmountText: '12.34',
          financialOutstandingAmountText: '78.41',
          collectibleAmountText: '58.16',
        },
      ],
    },
  });
  expect(
    within(screen.getByRole('region', { name: 'INR financial position' })).getByText(
      formatNumber('40.25', 'INR', { fractionDigits: 2 })
    )
  ).toBeVisible();
  expect(
    within(screen.getByRole('region', { name: 'USD financial position' })).getByText(
      formatNumber('12.34', 'USD', { fractionDigits: 2 })
    )
  ).toBeVisible();
  expect(screen.queryByText(/Grand total|Collection rate/i)).toBeNull();
});

it('preserves large aggregate paise without converting the text to a browser number', () => {
  renderFinancialPanel('admin', {
    ...dashboardFinancePayload,
    financePosition: {
      ...financePosition,
      verifiedCount: 1_000_000_000,
      currencyTotals: [
        {
          ...financeCurrency,
          originalAmountText: '9007199254740992.01',
          financialOutstandingAmountText: '9007199254740941.76',
          collectibleAmountText: '9007199254740921.51',
        },
      ],
    },
  });
  const region = screen.getByRole('region', { name: 'INR financial position' });
  const exact = formatNumber('9007199254740992.01', 'INR', { fractionDigits: 2 });
  expect(
    within(region)
      .getByText(exact)
      .textContent?.replace(/[^\d.]/g, '')
  ).toBe('9007199254740992.01');
});

it('shows a supplied verified zero as zero rather than unavailable', () => {
  renderFinancialPanel('principal', {
    ...dashboardFinancePayload,
    financePosition: {
      ...financePosition,
      currencyTotals: [
        {
          ...financeCurrency,
          originalAmountText: '70.50',
          financialOutstandingAmountText: '20.25',
          collectibleAmountText: '0.00',
        },
      ],
    },
  });
  expect(
    within(screen.getByRole('region', { name: 'INR financial position' })).getByText(
      formatNumber('0.00', 'INR', { fractionDigits: 2 })
    )
  ).toBeVisible();
  expect(screen.queryByText(/Finance position unavailable/i)).toBeNull();
});

it('does not invent a currency for unposted and review-only declarations', () => {
  renderFinancialPanel('admin', {
    ...dashboardFinancePayload,
    charges: { ...dashboardFinancePayload.charges, paidCount: 1, pendingCount: 1, waivedCount: 1 },
    financePosition: {
      verifiedCount: 0,
      needsReviewCount: 2,
      unpostedCount: 1,
      currencyTotals: [],
    },
  });
  expect(screen.getByText(/No verified currency totals/i)).toBeVisible();
  expect(screen.getByText(/Needs review/i)).toBeVisible();
  expect(screen.queryByRole('region', { name: /INR financial position/ })).toBeNull();
  expect(screen.queryByText(/₹|Monthly Fine Revenue|Total Collected/i)).toBeNull();
});
