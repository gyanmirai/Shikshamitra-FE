import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AcademicInsightsVisualization } from './academic-insights-visualization';

vi.mock('src/components/chart', () => ({
  Chart: ({ type, series }: { type: string; series: unknown }) => (
    <div data-testid="chart" data-type={type} data-series={JSON.stringify(series)} />
  ),
  useChart: (options: unknown) => options,
}));

function section(
  key: AcademicInsightsSection['key'],
  overrides: Partial<AcademicInsightsSection> = {}
): AcademicInsightsSection {
  return { key, status: 'ready', summary: '', metrics: [], series: [], items: [], ...overrides };
}

describe('AcademicInsightsVisualization', () => {
  it('labels donut slices with actual counts and distribution', () => {
    render(<AcademicInsightsVisualization section={section('evaluation', {
      series: [{ name: 'review', points: [
        { key: 'reviewed', label: 'Recorded review', value: 3 },
        { key: 'no-recorded-review', label: 'No recorded review', value: 1 },
      ] }],
    })} />);
    expect(screen.getByText('3 (75%)')).toBeVisible();
    expect(screen.getByText('1 (25%)')).toBeVisible();
  });
  it('hides stale series when a section is unavailable', () => {
    render(
      <AcademicInsightsVisualization
        section={section('lesson', {
          status: 'unavailable',
          summary: 'Lesson access is unavailable.',
          series: [{ name: 'Old values', points: [{ key: 'draft', label: 'Draft', value: 20 }] }],
        })}
      />
    );
    expect(screen.getByText('Lesson access is unavailable.')).toBeVisible();
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
    expect(screen.queryByText('Old values')).not.toBeInTheDocument();
  });

  it('keeps zero-count evaluation results readable without a blank donut', () => {
    render(
      <AcademicInsightsVisualization
        section={section('evaluation', {
          series: [{ name: 'Review', points: [{ key: 'reviewed', label: 'Reviewed', value: 0 }] }],
        })}
      />
    );
    expect(screen.getByText('All recorded evaluation counts are zero.')).toBeVisible();
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
  });

  it('plots only student records with both real coordinates', () => {
    render(
      <AcademicInsightsVisualization
        section={section('student360', {
          series: [
            {
              name: 'Students',
              points: [
                { key: 'a', label: 'Student A', value: 1, x: 91, y: 78 },
                { key: 'b', label: 'Student B', value: 1, x: 95, y: null },
              ],
            },
          ],
        })}
      />
    );
    expect(screen.getByTestId('chart')).toHaveAttribute('data-type', 'scatter');
    expect(JSON.parse(screen.getByTestId('chart').getAttribute('data-series')!)).toEqual([
      { name: 'Students', data: [{ name: 'Student A', x: 91, y: 78 }] },
    ]);
    expect(
      screen.getByText('Attendance (%): 95, Published score (%): Unavailable')
    ).toBeInTheDocument();
  });

  it('uses occupancy values for heatmap cells and marks missing samples', () => {
    render(
      <AcademicInsightsVisualization
        section={section('timetable', {
          series: [
            {
              name: 'Periods',
              points: [
                { key: '1:2', label: 'Monday period 2', x: 1, y: 2, value: 7 },
                { key: '2:3', label: 'Tuesday period 3', x: 2, y: 3, value: 0 },
              ],
            },
          ],
        })}
      />
    );
    expect(screen.getByRole('cell', { name: '7' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '0' })).toBeVisible();
    expect(screen.getAllByRole('cell', { name: 'N/A' })).toHaveLength(2);
  });

  it('omits a curriculum target when only recorded delivery exists', () => {
    render(
      <AcademicInsightsVisualization
        section={section('curriculum', {
          series: [
            {
              name: 'recorded-progress',
              points: [{ key: 'math', label: 'Mathematics', value: 34 }],
            },
            { name: 'planned-target', points: [] },
          ],
        })}
      />
    );
    expect(screen.getAllByText('34%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recorded progress').length).toBeGreaterThan(0);
    expect(screen.queryByText('recorded-progress')).not.toBeInTheDocument();
    expect(screen.queryByText(/planned target/)).not.toBeInTheDocument();
  });

  it('keeps the notification catalogue read-only', () => {
    render(
      <AcademicInsightsVisualization
        section={section('notifications', {
          series: [
            { name: 'Categories', points: [{ key: 'curriculum', label: 'Curriculum', value: 3 }] },
          ],
        })}
      />
    );
    expect(screen.getByText('Curriculum')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
