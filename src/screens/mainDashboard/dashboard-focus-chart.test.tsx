import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import { DashboardFocusView } from './dashboard-focus-view';

import type { DashboardFocus } from './dashboard-focus-types';

const { chartSpy } = vi.hoisted(() => ({ chartSpy: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/chart', () => ({
  Chart: (props: unknown) => { chartSpy(props); return <div data-testid="focus-chart" />; },
  useChart: (options: unknown) => options,
}));

const focus: DashboardFocus = {
  kind: 'collections', widgetId: 'collections', title: 'Fee Collections',
  description: 'Posted collections for the selected period.', status: 'ready', unit: 'INR',
  metrics: [], items: [], accessMode: 'staff', requiredPermissions: [],
  series: [
    { id: 'received', label: 'Received', points: [
      { key: 'oct', label: 'October', value: 0 }, { key: 'nov', label: 'November', value: null },
    ] },
    { id: 'due', label: 'Due', points: [
      { key: 'dec', label: 'December', value: 1200 }, { key: 'oct', label: 'October', value: 80 },
    ] },
  ],
};

describe('Dashboard focus charts', () => {
  it('aligns sparse and reordered series by stable keys while preserving null and zero', () => {
    render(<DashboardFocusView focus={focus} />);
    expect(chartSpy).toHaveBeenLastCalledWith(expect.objectContaining({ height: 240,
      series: [
        { name: 'Received', data: [0, null, null] },
        { name: 'Due', data: [80, null, 1200] },
      ],
      options: expect.objectContaining({ xaxis: expect.objectContaining({
        categories: ['October', 'November', 'December'],
      }) }),
    }));
  });

  it('makes supporting values available by keyboard without chart tooltips', async () => {
    render(<DashboardFocusView focus={focus} />);
    const disclosure = screen.getByRole('button', { name: 'View chart data' });
    disclosure.focus();
    await userEvent.keyboard('{Enter}');
    const data = screen.getByRole('region', { name: 'View chart data' });
    expect(document.querySelectorAll(`[id="${disclosure.getAttribute('aria-controls')}"]`)).toHaveLength(1);
    expect(within(data).getByText('October')).toBeVisible();
    expect(within(data).getByText('Received: ₹ 0')).toBeVisible();
    expect(within(data).getByText('Due: ₹ 1,200')).toBeVisible();
    expect(within(data).getAllByText(/Unavailable/)).toHaveLength(3);
  });

  it('shows actual zero series as data', () => {
    render(<DashboardFocusView focus={{ ...focus, unit: 'count', series: [
      { id: 'a', label: 'Applicants', points: [{ key: 'new', label: 'New', value: 0 }] },
    ] }} />);
    expect(screen.getByTestId('focus-chart')).toBeVisible();
    expect(screen.queryByText('No measured values are available.')).not.toBeInTheDocument();
  });

  it('explains missing measurements without rendering an empty chart', () => {
    render(<DashboardFocusView focus={{ ...focus, series: [
      { id: 'a', label: 'Received', points: [{ key: 'oct', label: 'October', value: null }] },
    ] }} />);
    expect(screen.queryByTestId('focus-chart')).not.toBeInTheDocument();
    expect(screen.getByText('No measured values are available.')).toBeVisible();
    expect(screen.queryByText(/healthy|100%/i)).not.toBeInTheDocument();
  });

  it('displays result percentage only when its unit is explicitly percent', async () => {
    render(<DashboardFocusView focus={{ ...focus, kind: 'results', unit: 'count', series: [
      { id: 'a', label: 'Results', points: [{ key: 'x', label: 'Published', value: 12 }] },
    ] }} />);
    await userEvent.click(screen.getByRole('button', { name: 'View chart data' }));
    expect(screen.getByText('Results: 12')).toBeVisible();
    expect(screen.queryByText(/12%|100%|healthy/i)).not.toBeInTheDocument();
  });

  it('provides tooltip units and escapes server-provided labels', () => {
    render(<DashboardFocusView focus={{ ...focus, series: [{ id: 'a', label: '<Receipt>', points: [
      { key: 'oct', label: '<October>', value: 1200 },
    ] }] }} />);
    const options = chartSpy.mock.lastCall?.[0].options;
    const tooltip = options.tooltip.custom({ dataPointIndex: 0 });
    expect(tooltip).toContain('₹ 1,200');
    expect(tooltip).toContain('&lt;October&gt;');
    expect(tooltip).toContain('&lt;Receipt&gt;');
    expect(tooltip).not.toContain('<Receipt>');
  });
});
