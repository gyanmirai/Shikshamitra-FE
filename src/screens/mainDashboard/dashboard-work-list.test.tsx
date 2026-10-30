import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { DashboardWorkList } from './dashboard-work-list';

vi.mock('@iconify/react', () => ({ Icon: 'svg', disableCache: vi.fn() }));

const item = {
  id: 'approval',
  title: 'Leave Approvals',
  count: 0,
  owner: 'HR',
  drilldownUrl: '/hr/leaveManagement/approvals',
  priority: 'high' as const,
};

describe('DashboardWorkList', () => {
  it('renders compact native list links while preserving a real zero', () => {
    render(<DashboardWorkList widgets={[item]} title="Priority Work" testId="work" />);
    expect(screen.getByRole('region', { name: 'Priority Work' })).toBeVisible();
    expect(screen.getByRole('list')).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeVisible();
    expect(screen.getByRole('link', { name: 'View details: Leave Approvals' })).toHaveAttribute(
      'href',
      item.drilldownUrl
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('HR')).toBeVisible();
  });

  it('preserves stale rows and offers a working retry after partial failure', async () => {
    const retry = vi.fn();
    render(
      <DashboardWorkList
        widgets={[item]}
        title="Priority Work"
        testId="work"
        error="Unable to refresh approvals."
        onRetry={retry}
      />
    );
    expect(screen.getByText(item.title)).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to refresh approvals.');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('keeps priority readable when the row also has a due date', () => {
    render(
      <DashboardWorkList
        widgets={[{ ...item, dueLabel: 'Today' }]}
        title="Priority Work"
        testId="work"
      />
    );
    expect(screen.getByText('Today')).toBeVisible();
    expect(screen.getByText('High priority')).toBeVisible();
  });

  it('reports actual empty results and does not claim all caught up on errors', () => {
    const { rerender } = render(
      <DashboardWorkList
        widgets={[]}
        title="Agenda"
        testId="agenda"
        emptyMessage="No scheduled items in this period."
      />
    );
    expect(screen.getByText('No scheduled items in this period.')).toBeVisible();
    rerender(
      <DashboardWorkList widgets={[]} title="Agenda" testId="agenda" error="Agenda unavailable." />
    );
    expect(screen.getByText('Agenda unavailable.')).toBeVisible();
    expect(screen.queryByTestId('agenda-empty')).toBeNull();
  });

  it('retains rows during refresh, uses skeletons only for initial loading, and avoids unsafe links', () => {
    const { rerender } = render(
      <DashboardWorkList widgets={[]} title="Agenda" testId="agenda" isLoading />
    );
    expect(screen.getByTestId('agenda-loading')).toBeVisible();
    expect(screen.queryByTestId('agenda-empty')).toBeNull();
    rerender(
      <DashboardWorkList
        widgets={[{ ...item, drilldownUrl: '/\\external.example' }]}
        title="Agenda"
        testId="agenda"
        isLoading
      />
    );
    expect(screen.getByText(item.title)).toBeVisible();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Refreshing Agenda')).toBeVisible();
  });
});
