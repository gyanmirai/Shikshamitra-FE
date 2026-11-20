import { it, vi, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { formatNumber } from 'src/utils/formate_number';

import { renderFinancialPanel } from './dashboard-finance.fixture';
import {
  financeCurrency,
  financeAmountLabels,
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

it.each(['admin', 'principal'] as const)(
  '%s shows separate authoritative amounts rather than local Paid principal',
  (role) => {
    renderFinancialPanel(role);
    const currency = within(screen.getByRole('region', { name: 'INR financial position' }));
    Object.entries(financeAmountLabels).forEach(([key, label]) => {
      expect(currency.getByText(label)).toBeVisible();
      expect(
        currency.getByText(
          formatNumber(financeCurrency[key as keyof typeof financeAmountLabels], 'INR', {
            fractionDigits: 2,
          })
        )
      ).toBeVisible();
    });
    expect(screen.getByText(/Local status declarations/i)).toBeVisible();
    expect(
      screen.queryByText(
        /Monthly Fine Revenue|Collection Rate|Collection Progress|Collection Trend|Collection Efficiency Goal/i
      )
    ).toBeNull();
    expect(screen.queryByTestId('financial-chart')).toBeNull();
    expect(screen.queryByText(formatNumber('999.00', 'INR', { fractionDigits: 2 }))).toBeNull();
  }
);

it.each(['admin', 'principal'] as const)(
  '%s keeps an absent Finance summary unavailable',
  (role) => {
    const { financePosition: omitted, ...legacy } = dashboardFinancePayload;
    renderFinancialPanel(role, legacy);
    expect(screen.getByText(/Finance position unavailable/i)).toBeVisible();
    expect(screen.getByText(/Local status declarations/i)).toBeVisible();
    expect(screen.queryByText(/0%|Monthly Fine Revenue|Total Collected/i)).toBeNull();
  }
);
