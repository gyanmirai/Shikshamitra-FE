import React from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { formatNumber } from 'src/utils/formate_number';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FeeRow } from './FeeLedgerShared';

vi.mock('./FeeWaiverToggle', () => ({ default: () => null }));

const props = {
  name: 'December 2026',
  total: 15000,
  paid: 3750,
  due: 0,
  isSelected: false,
  onToggle: vi.fn(),
  refundAmount: 15000,
  refundDescription: 'Earlier completed refund',
  pendingRefundAmount: 3750,
  pendingRefundDescription: 'RF-002 · School transfer',
};
const renderRow = (overrides: Partial<typeof props> = {}) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeRow {...props} {...overrides} />
    </ThemeProvider>
  );

it('explains completed and awaiting-payout amounts in the legacy fee-row tooltip', async () => {
  const user = userEvent.setup();
  renderRow();
  await user.tab();
  await user.tab();
  expect(screen.getByLabelText('Refund details')).toHaveFocus();
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(`Refunded to date: ${formatNumber(15000, 'INR')}`);
  expect(tooltip).toHaveTextContent(
    'Completed payouts for this installment across all refund requests.'
  );
  expect(tooltip).toHaveTextContent(`Refund awaiting payout: ${formatNumber(3750, 'INR')}`);
  expect(tooltip).toHaveTextContent('RF-002 · School transfer');
});

it('shows a pending-only refund without requiring a reason and hides zero pending context', async () => {
  const user = userEvent.setup();
  const view = renderRow({ refundAmount: 0, refundDescription: '', pendingRefundDescription: '' });
  await user.hover(screen.getByLabelText('Refund details'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    `Refund awaiting payout: ${formatNumber(3750, 'INR')}`
  );
  view.unmount();
  renderRow({ refundAmount: 0, refundDescription: '', pendingRefundAmount: 0 });
  expect(screen.queryByLabelText('Refund details')).not.toBeInTheDocument();
});
