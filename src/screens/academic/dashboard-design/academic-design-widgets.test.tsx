import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AcademicDesignChart } from './academic-design-chart';
import { AcademicDesignCounts } from './academic-design-counts';
import { AcademicDesignRecords } from './academic-design-records';
import { getDesignChartData } from './academic-design-chart-data';
import { AcademicDesignSyllabus } from './academic-design-syllabus';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden /> }));
vi.mock('src/components/chart', () => ({
  Chart: ({ type, series, height, options }: { type: string; series: unknown; height: number; options: { plotOptions: { bar: { horizontal: boolean } } } }) =>
    <div data-testid="chart" data-type={type} data-height={height} data-series={JSON.stringify(series)} data-horizontal={String(options.plotOptions.bar.horizontal)} />,
  useChart: (options: unknown) => options,
}));
const section = (key: AcademicInsightsSection['key']): AcademicInsightsSection => ({ key, status: 'ready', summary: '', metrics: [], series: [], items: [] });

describe('separate image dashboard widgets', () => {
  it('shows only five calendar events after removing recurring weekends and keeps actual weekend events', () => {
    const events = Array.from({ length: 7 }, (_, i) => ({
      id: `event-${i}`, label: i === 0 ? 'Weekend Science Fair' : `Event ${i}`,
      detail: i === 1 ? 'Holiday' : 'Event', date: '2026-11-01T00:00:00Z',
    }));
    render(<AcademicDesignRecords section={{ ...section('calendar'), items: [
      { id: 'sun', label: 'Sunday Weekend', detail: 'Holiday' },
      { id: 'sat', label: 'Saturday Weekend', detail: 'Holiday' },
      { id: 'alternate', label: 'Alternate Saturday (2nd/th Saturday)', detail: 'Holiday' },
      ...events,
    ] }} />);
    const list = screen.getByRole('list', { name: 'Calendar events' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(within(list).getByText('Weekend Science Fair')).toBeVisible();
    expect(within(list).getByText('Event 1')).toBeVisible();
    expect(within(list).queryByText('Sunday Weekend')).not.toBeInTheDocument();
    expect(screen.queryByText('Saturday Weekend')).not.toBeInTheDocument();
    expect(screen.queryByText('Alternate Saturday (2nd/th Saturday)')).not.toBeInTheDocument();
    expect(screen.queryByText('Event 5')).not.toBeInTheDocument();
  });

  it('shows a clear empty message when the calendar contains only recurring weekends', () => {
    render(<AcademicDesignRecords section={{ ...section('calendar'), items: [
      { id: 'sun', label: 'Sunday Weekend', detail: 'Holiday' },
    ] }} />);
    expect(screen.getByText('No upcoming events to display.')).toBeVisible();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('uses actual status aggregates in the lesson table without inventing lesson details', () => {
    render(<AcademicDesignCounts section={{ ...section('lesson'), series: [{ name: 'status', points: [{ key: 'draft', label: 'Draft', value: 4 }] }] }} />);
    const table = screen.getByRole('table', { name: 'Lesson plan states' });
    expect(within(table).getByRole('cell', { name: '4' })).toBeVisible();
    expect(within(table).getByText('Draft')).toBeVisible();
    expect(screen.queryByText('Linear Equations')).not.toBeInTheDocument();
  });

  it('draws the compact horizontal task chart without converting missing values to zero', () => {
    render(<AcademicDesignChart section={{ ...section('tasks'), series: [
      { name: 'homework', points: [{ key: 'today', label: 'today', value: 2 }, { key: 'upcoming', label: 'upcoming', value: 1 }] },
      { name: 'assignment', points: [{ key: 'today', label: 'today', value: 3 }] },
    ] }} />);
    expect(screen.getByTestId('chart')).toHaveAttribute('data-horizontal', 'true');
    expect(screen.getByTestId('chart')).toHaveAttribute('data-height', '180');
    expect(JSON.parse(screen.getByTestId('chart').getAttribute('data-series')!)[1].data).toEqual([3, null]);
  });

  it('uses the authoritative syllabus headline and preserves real zero', () => {
    render(<AcademicDesignSyllabus section={{ ...section('curriculum'), metrics: [{ key: 'recorded-progress', label: 'Average recorded progress', value: 0, unit: '%' }],
      series: [{ name: 'recorded-progress', points: [{ key: 'math', label: 'Mathematics', value: 80 }] }] }} />);
    expect(screen.getByRole('group', { name: 'Syllabus progress summary' })).toHaveTextContent('0%');
    expect(screen.queryByText(/chapters completed/i)).not.toBeInTheDocument();
  });

  it('keeps all supplied evaluation categories and exposes their true percentages beside the donut', () => {
    render(<AcademicDesignChart section={{ ...section('evaluation'), series: [{ name: 'review', points: [
      { key: 'reviewed', label: 'Reviewed', value: 23 }, { key: 'pending', label: 'Pending', value: 7 },
    ] }] }} />);
    expect(screen.getByTestId('chart')).toHaveAttribute('data-type', 'donut');
    const legend = screen.getByRole('list', { name: 'Evaluation distribution' });
    expect(legend).toHaveTextContent('23 (76.7%)');
    expect(legend).toHaveTextContent('7 (23.3%)');
  });

  it('renders a zero evaluation state without a fabricated donut', () => {
    render(<AcademicDesignChart section={{ ...section('evaluation'), series: [{ name: 'review', points: [{ key: 'x', label: 'Reviewed', value: 0 }] }] }} />);
    expect(screen.getByText('All recorded evaluation counts are zero.')).toBeVisible();
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
  });

  it('keeps scatter samples with both real coordinates and no connecting lines', () => {
    const model = getDesignChartData({ ...section('student360'), series: [{ name: 'students', points: [
      { key: 'a', label: 'A', value: 84, x: 96, y: 84 }, { key: 'b', label: 'B', value: 75, x: 90, y: null },
    ] }] });
    expect(model.scatter).toBe(true);
    expect(model.series[0].data).toEqual([{ name: 'A', x: 96, y: 84 }]);
  });

  it('limits audit rows to five and preserves precise timestamps', () => {
    render(<AcademicDesignRecords section={{ ...section('audits'), items: Array.from({ length: 7 }, (_, i) => ({
      id: String(i), label: `Audit ${i}`, date: '2026-10-29T10:00:00Z',
    })) }} />);
    const rows = within(screen.getByRole('table', { name: 'Audit activity' })).getAllByRole('row');
    expect(rows).toHaveLength(6);
    expect(screen.queryByText('Audit 5')).not.toBeInTheDocument();
    expect(rows[1].querySelector('time')).toHaveAttribute('datetime', '2026-10-29T10:00:00Z');
  });

  it('keeps notification templates explicitly read-only without sending controls', () => {
    render(<AcademicDesignRecords section={{ ...section('notifications'), items: [{ id: 'curriculum', label: 'Curriculum' }] }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Templates are read-only');
    expect(screen.getByRole('table', { name: 'Notification template catalogue' })).toHaveTextContent('Read-only');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('retains real exam dates and source values in compact record rows', () => {
    render(<AcademicDesignCounts section={{ ...section('exams'), items: [{ id: 'next', label: 'Science Unit Test',
      date: '2026-11-03T00:00:00Z', status: 'Scheduled', value: 2 }] }} />);
    expect(screen.getByText('Science Unit Test')).toBeVisible();
    expect(document.querySelector('time')).toHaveAttribute('datetime', '2026-11-03T00:00:00Z');
    expect(screen.getByText('2')).toBeVisible();
  });
});
