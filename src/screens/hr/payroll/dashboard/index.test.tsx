import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import PayrollDashboard from './index';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/redux/hr/hrDashboardApi', () => ({
  parseHRDashboardPayload: () => undefined,
  useGetHRDashboardPreviewQuery: () => ({ isLoading: true, refetch: vi.fn() }),
  useRefreshHRDashboardPreviewMutation: () => [vi.fn(), {}],
}));

describe('Payroll dashboard page shell', () => {
  it('keeps one standard header and its actions mounted during the initial request', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PayrollDashboard />
      </ThemeProvider>
    );
    expect(screen.getAllByRole('heading', { name: 'Payroll Dashboard' })).toHaveLength(1);
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'HR/Staff' })).toHaveAttribute('href', '/hr/dashboard');
    expect(screen.getByRole('link', { name: 'Run payroll' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh HR dashboard' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Page description' })).toBeVisible();
  });
});
