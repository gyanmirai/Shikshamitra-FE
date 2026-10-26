import type { HRDashboardPreview } from 'src/redux/hr/hrDashboardApi';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { HrDashboardPreviewShell } from './HrDashboardPreviewShell';

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden />,
}));

const theme = createTheme(defaultSettings);

const preview = (overrides: Partial<HRDashboardPreview> = {}): HRDashboardPreview => ({
  dashboardKey: 'Main',
  status: 'Ready',
  payloadJson: '{}',
  payloadVersion: 1,
  lastSuccessfulRefreshAt: '2026-08-23T09:30:00+05:30',
  nextScheduledRefreshAt: '2026-08-24T07:00:00+05:30',
  ...overrides,
});

const renderShell = (dashboardPreview = preview(), onRefresh = vi.fn()) =>
  render(
    <ThemeProvider theme={theme}>
      <HrDashboardPreviewShell preview={dashboardPreview} onRefresh={onRefresh}>
        <div>Dashboard content</div>
      </HrDashboardPreviewShell>
    </ThemeProvider>
  );

describe('HrDashboardPreviewShell', () => {
  it('renders the standard heading, breadcrumb hierarchy, freshness, and refresh control', () => {
    const onRefresh = vi.fn();
    renderShell(preview(), onRefresh);

    const shell = screen.getByTestId('hr-dashboard-shell');
    const heading = screen.getByRole('heading', { level: 1, name: 'HR Dashboard' });
    const breadcrumbs = screen.getByRole('navigation');

    expect(heading).toBeVisible();
    expect(shell.querySelector('[data-layout="inline"]')).toBeInTheDocument();
    expect(screen.queryByText('HR/Staff')).not.toBeInTheDocument();
    expect(within(breadcrumbs).getByText('HR Dashboard')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Page description' })).toBeVisible();
    expect(screen.getByLabelText('Dashboard freshness')).toHaveTextContent('Last refreshed:');
    expect(screen.getByLabelText('Dashboard freshness')).toHaveTextContent('Saved snapshot');
    expect(within(shell).queryByRole('link', { name: 'Onboard Staff' })).not.toBeInTheDocument();
    expect(within(shell).queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
    expect(within(shell).queryByRole('separator')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh HR dashboard' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('keeps stale, refreshing, empty, and failed snapshot feedback inside the known shell', () => {
    const { rerender } = renderShell(preview({ isStale: true }));
    expect(screen.getByText(/older than 24 hours/i)).toBeVisible();

    rerender(
      <ThemeProvider theme={theme}>
        <HrDashboardPreviewShell preview={preview({ status: 'Refreshing' })} onRefresh={vi.fn()}>
          <div>Dashboard content</div>
        </HrDashboardPreviewShell>
      </ThemeProvider>
    );
    expect(screen.getByRole('progressbar', { name: 'Refreshing HR dashboard' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refreshing HR dashboard' })).toBeDisabled();

    rerender(
      <ThemeProvider theme={theme}>
        <HrDashboardPreviewShell preview={preview({ status: 'Empty' })} onRefresh={vi.fn()}>
          <div>Dashboard content</div>
        </HrDashboardPreviewShell>
      </ThemeProvider>
    );
    expect(screen.getByText(/first saved HR dashboard snapshot/i)).toBeVisible();

    rerender(
      <ThemeProvider theme={theme}>
        <HrDashboardPreviewShell
          preview={preview({ status: 'Failed', lastError: 'Snapshot refresh timed out.' })}
          onRefresh={vi.fn()}
        >
          <div>Dashboard content</div>
        </HrDashboardPreviewShell>
      </ThemeProvider>
    );
    expect(screen.getByText('Snapshot refresh timed out.')).toBeVisible();
    expect(screen.getByText(/last dashboard refresh failed/i)).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
  });
});
