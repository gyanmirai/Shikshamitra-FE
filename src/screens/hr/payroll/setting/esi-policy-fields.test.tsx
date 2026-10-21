import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { EsiPolicyFields } from './esi-policy-fields';

const mocks = vi.hoisted(() => ({ error: false, retry: vi.fn() }));
vi.mock('src/redux/hr/esi-policy-api', async (load) => ({
  ...(await load<typeof import('src/redux/hr/esi-policy-api')>()),
  useGetEsiPolicyOptionsQuery: () => ({
    isError: mocks.error,
    refetch: mocks.retry,
    isLoading: false,
    data: [
      {
        id: 'one',
        name: 'Standard ESIC',
        isArchived: false,
        versions: [
          {
            version: 1,
            effectiveFrom: '2026-01-01',
            employeePercentage: 0.75,
            employerPercentage: 3.25,
          },
        ],
      },
      { id: 'archived', name: 'Archived policy', isArchived: true, versions: [] },
    ],
  }),
}));
const theme = createTheme(defaultSettings);
function Editor({ month = '2026-10' }: { month?: string }) {
  const [assignment, setAssignment] = useState({
    mode: 'IN_PLATFORM' as const,
    policyId: 'one',
    reason: '',
  });
  return (
    <ThemeProvider theme={theme}>
      <EsiPolicyFields
        {...assignment}
        month={month}
        onChange={(value) => setAssignment(value as typeof assignment)}
      />
    </ThemeProvider>
  );
}
afterEach(() => {
  cleanup();
  mocks.error = false;
  vi.clearAllMocks();
});
describe('ESIC policy selection', () => {
  it('shows separate employee and school shares and excludes archived new choices', async () => {
    render(<Editor />);
    expect(screen.getByText('Version 1 · Employee 0.75% · School 3.25%')).toBeVisible();
    await userEvent.click(screen.getByRole('combobox', { name: /ESIC policy/ }));
    expect(screen.getByRole('option', { name: 'Standard ESIC' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Archived policy' })).toBeNull();
  });
  it('requires an external reason and explains payroll and payslip omission', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    await user.click(screen.getByRole('combobox', { name: 'ESIC management' }));
    await user.click(screen.getByRole('option', { name: 'Handled outside ShikshaMitra' }));
    expect(screen.getByRole('textbox', { name: /External management reason/ })).toBeRequired();
    expect(
      screen.getByText('ESIC contributions will be omitted from payroll and payslips.')
    ).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /ESIC policy/ })).toBeNull();
  });
  it('shows missing effective versions and allows a failed catalogue to be retried', async () => {
    const view = render(<Editor month="2025-12" />);
    expect(screen.getByText('No effective version for this month.')).toBeVisible();
    mocks.error = true;
    view.rerender(<Editor />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.retry).toHaveBeenCalledOnce();
  });
});
