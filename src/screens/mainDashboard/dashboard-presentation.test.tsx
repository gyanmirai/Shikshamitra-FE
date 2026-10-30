import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import { DashboardShell } from './dashboard-shell';
import { DashboardWidgetCard } from './dashboard-widget-card';

import type { DashboardDataContract } from './dashboard-types';

vi.mock('@iconify/react', () => ({ Icon: 'svg', disableCache: vi.fn() }));

const data: DashboardDataContract = {
  dashboardTemplate: 'leadership',
  dateRange: { label: 'This month' },
  scopeLabel: 'Assigned schools',
  generatedAtUtc: '2026-10-29T08:30:00Z',
  kpiCards: [],
  actionItems: [],
  riskAlerts: [],
  moduleSnapshots: [],
  calendarItems: [],
  announcements: [],
};

describe('Dashboard presentation', () => {
  it('keeps the compact shared header first and preserves scope and period', () => {
    render(
      <DashboardShell data={data}>
        <div>Dashboard content</div>
      </DashboardShell>
    );
    const root = screen.getByTestId('dashboard-root');
    expect(
      within(root.firstElementChild as HTMLElement).getByRole('heading', {
        level: 1,
        name: 'Leadership Dashboard',
      })
    ).toBeVisible();
    expect(screen.getByText('Assigned schools')).toBeVisible();
    expect(screen.getByText('This month')).toBeVisible();
    expect(screen.getByText(/^Updated /)).toBeVisible();
  });

  it('uses role-specific identity and supports refresh from the keyboard', async () => {
    const onRefresh = vi.fn();
    render(
      <DashboardShell data={data} presentationRole="admissions" onRefresh={onRefresh}>
        Content
      </DashboardShell>
    );
    expect(screen.getByRole('heading', { name: 'Admissions Dashboard' })).toBeVisible();
    screen.getByRole('button', { name: 'Refresh' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('keeps refreshing state visible and does not invent a timestamp', () => {
    render(
      <DashboardShell
        data={{ ...data, generatedAtUtc: undefined, dataState: 'partial' }}
        onRefresh={vi.fn()}
        isRefreshing
      >
        Content
      </DashboardShell>
    );
    expect(screen.getByRole('heading', { name: 'Leadership Dashboard' })).toBeVisible();
    expect(screen.queryByText(/^Updated /)).not.toBeInTheDocument();
    expect(screen.getByText('Some data is unavailable')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('distinguishes real zero and unavailable metrics without generic status badges', () => {
    render(
      <>
        <DashboardWidgetCard
          widget={{ id: 'zero', title: 'Pending', value: 0, status: 'success' }}
        />
        <DashboardWidgetCard widget={{ id: 'missing', title: 'Attendance' }} />
      </>
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.queryByText(/success|info/i)).not.toBeInTheDocument();
  });

  it('provides a native link for a safe drilldown and no link for an unsafe URL', () => {
    render(
      <>
        <DashboardWidgetCard
          widget={{
            id: 'valid',
            title: 'Academic Dashboard',
            drilldownUrl: '/academic/dashboard?view=overview',
          }}
        />
        <DashboardWidgetCard
          widget={{ id: 'unsafe', title: 'Unsafe', drilldownUrl: '//outside.example' }}
        />
      </>
    );
    expect(screen.getByRole('link', { name: 'View details: Academic Dashboard' })).toHaveAttribute(
      'href',
      '/academic/dashboard?view=overview'
    );
    expect(within(screen.getByTestId('dashboard-widget-unsafe')).queryByRole('link')).toBeNull();
  });
});
