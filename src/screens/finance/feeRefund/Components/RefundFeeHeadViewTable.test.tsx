import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import RefundFeeHeadViewTable from './RefundFeeHeadViewTable';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));
const theme = createTheme(defaultSettings);
const data = [
  {
    feeHeadId: 'school',
    feeHeadName: 'General School Fees',
    totalPaid: 37500,
    totalRefunded: 30000,
    items: [
      { month: 'July', total: 15000, paid: 18750, refundAmount: 0, status: 2 },
      { month: 'December', total: 15000, paid: 18750, refundAmount: 3750, status: 2 },
    ],
  },
  {
    feeHeadId: 'tuition',
    feeHeadName: 'General Tuition Fee',
    totalPaid: 25000,
    totalRefunded: 20000,
    items: [{ month: 'July', total: 10000, paid: 12500, refundAmount: 0, status: 2 }],
  },
];
const show = (rows = data) =>
  render(
    <ThemeProvider theme={theme}>
      <RefundFeeHeadViewTable data={rows} />
    </ThemeProvider>
  );

describe('request-only refund details', () => {
  it('shows only refund installments, their amounts and the request total', () => {
    show();
    const table = screen.getByRole('table', { name: 'General School Fees refunds table' });
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent?.trim())).toEqual(
      ['Installment', 'Paid amount', 'Refund amount']
    );
    expect(table).toHaveTextContent('December');
    expect(table).toHaveTextContent('3,750');
    expect(table).toHaveTextContent('18,750');
    expect(screen.queryByText('July')).not.toBeInTheDocument();
    expect(screen.queryByText('General Tuition Fee')).not.toBeInTheDocument();
    expect(screen.queryByText(/Total Refunded/)).not.toBeInTheDocument();
    expect(screen.queryByText(/50,000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    expect(screen.getByText('Fee heads: 1')).toBeVisible();
  });

  it('preserves the shared accordion expand and collapse behavior', () => {
    show();
    const region = screen.getByRole('region', { name: 'General School Fees installments' });
    const toggle = screen.getByRole('button', { name: 'General School Fees refund details' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(region).not.toBeVisible();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(region).toBeVisible();
  });

  it('shows an empty state when no installments carry a refund amount', () => {
    show([data[1]]);
    expect(screen.getByText('No refund installments available.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('General Tuition Fee')).not.toBeInTheDocument();
  });
});
