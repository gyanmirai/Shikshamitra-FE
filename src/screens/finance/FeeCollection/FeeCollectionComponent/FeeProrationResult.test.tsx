import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import FeeProrationResult from './FeeProrationResult';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const result = {
  policyName: 'School monthly proration',
  policyVersion: 3,
  joiningDate: '2026-08-01T00:00:00Z',
  chargeStartDate: '2026-08-01T00:00:00Z',
  chargeEndDate: '2026-12-31T00:00:00Z',
  scheduledAmount: 10000,
  admissionReduction: 2000,
  withdrawalCredit: 3000,
  payableAmount: 5000,
  excessPaidAmount: 1000,
  explanations: [
    'Full months charged from August through December using the saved Finance policy.',
  ],
};
const show = (value?: typeof result | null) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeProrationResult result={value} />
    </ThemeProvider>
  );

describe('Finance-owned read-only proration result', () => {
  it('adds no section for a regular full-year or unconfigured result', () => {
    const { container } = show(null);
    expect(screen.queryByText('Fee Proration')).not.toBeInTheDocument();
    expect(container.querySelector('input, select, button')).toBeNull();
  });

  it('shows saved policy, date, reductions and excess without editable policy controls', () => {
    show(result);
    expect(screen.getByText('School monthly proration · v3')).toBeVisible();
    [
      'Actual joining date',
      'Charge period',
      'Joining date reduction',
      'Withdrawal credit',
      'Payable fees',
      'Excess paid',
    ].forEach((label) => expect(screen.getByText(label)).toBeVisible());
    expect(
      screen.getByText('Subject to Finance refund review. No cash refund is created here.')
    ).toBeVisible();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fee Proration.*information/i })).toBeEnabled();
  });

  it('hides withdrawal and refund rows at admission when no corresponding result exists', () => {
    show({ ...result, withdrawalCredit: 0, excessPaidAmount: 0 });
    expect(screen.queryByText('Withdrawal credit')).not.toBeInTheDocument();
    expect(screen.queryByText('Excess paid')).not.toBeInTheDocument();
    expect(screen.getByText('Joining date reduction')).toBeVisible();
  });
});
