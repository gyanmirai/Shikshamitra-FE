import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AcademicInsightsVisualization } from './academic-insights-visualization';

vi.mock('src/components/chart', () => ({
  Chart: ({ series, options }: { series: unknown; options: { chart: { stacked: boolean } } }) => (
    <div
      data-testid="chart"
      data-series={JSON.stringify(series)}
      data-stacked={String(options.chart.stacked)}
    />
  ),
  useChart: (options: unknown) => options,
}));

const section = (
  key: AcademicInsightsSection['key'],
  data: Partial<AcademicInsightsSection>
): AcademicInsightsSection => ({
  key,
  status: 'ready',
  summary: '',
  metrics: [],
  series: [],
  items: [],
  ...data,
});

describe('operational academic visual semantics', () => {
  it('stacks real homework and assignment schedules without filling missing buckets with zero', () => {
    render(
      <AcademicInsightsVisualization
        section={section('tasks', {
          series: [
            {
              name: 'homework',
              points: [
                { key: 'today', label: 'today', value: 2 },
                { key: 'upcoming', label: 'upcoming', value: 1 },
              ],
            },
            { name: 'assignment', points: [{ key: 'today', label: 'today', value: 3 }] },
          ],
        })}
      />
    );
    expect(screen.getByTestId('chart')).toHaveAttribute('data-stacked', 'true');
    expect(JSON.parse(screen.getByTestId('chart').getAttribute('data-series')!)).toEqual([
      { name: 'Homework', data: [2, 1] },
      { name: 'Assignments', data: [3, null] },
    ]);
  });

  it('deduplicates settings exposed as both series and item records', () => {
    render(
      <AcademicInsightsVisualization
        section={section('settings', {
          series: [
            {
              name: 'existence',
              points: [{ key: 'subjects', label: 'subjects', value: 1, status: 'configured' }],
            },
          ],
          items: [
            { id: 'subjects', label: 'subjects', status: 'configured' },
            { id: 'weekly-lectures', label: 'weekly-lectures', status: 'context-required' },
          ],
        })}
      />
    );
    expect(screen.getAllByText('Subjects Creation')).toHaveLength(1);
    expect(screen.getByText('Records available')).toBeVisible();
    expect(screen.getByText('Weekly Lectures')).toBeVisible();
    expect(screen.getByText('Class needed')).toBeVisible();
  });

  it('shows exam stage counts and upcoming items without claiming a completion percentage', () => {
    render(
      <AcademicInsightsVisualization
        section={section('exams', {
          series: [
            { name: 'stages', points: [{ key: 'published', label: 'published', value: 2 }] },
          ],
          items: [{ id: 'next', label: 'Mathematics Midterm', status: 'scheduled' }],
        })}
      />
    );
    expect(screen.getByText('Mathematics Midterm')).toBeVisible();
    expect(screen.getByText('Count · scale 0 to 2')).toBeVisible();
    expect(screen.queryByText(/100%/)).not.toBeInTheDocument();
  });
});
