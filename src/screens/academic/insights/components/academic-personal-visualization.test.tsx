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

const personalSection = (
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

describe('personal academic insights', () => {
  it('uses real attendance percentage when no published score can form a scatter pair', () => {
    render(
      <AcademicInsightsVisualization
        section={personalSection('student360', {
          metrics: [
            { key: 'attendance', label: 'Attendance', value: 87.5, unit: '%' },
            {
              key: 'exam-score',
              label: 'Average published exam score in preview',
              value: null,
              unit: '%',
            },
          ],
          series: [{ name: 'attendance-score', points: [] }],
        })}
      />
    );
    expect(screen.getByRole('progressbar', { name: 'Attendance' })).toHaveAttribute(
      'aria-valuetext',
      '87.5%'
    );
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
  });

  it('renders supplied attendance status counts as columns without invented score coordinates', () => {
    render(
      <AcademicInsightsVisualization
        section={personalSection('student360', {
          series: [
            {
              name: 'attendance-status',
              points: [
                { key: 'present', label: 'Present', value: 12 },
                { key: 'absent', label: 'Absent', value: 0 },
              ],
            },
          ],
        })}
      />
    );
    expect(screen.getByTestId('chart')).toHaveAttribute('data-type', 'bar');
    expect(JSON.parse(screen.getByTestId('chart').getAttribute('data-series')!)).toEqual([
      { name: 'Attendance by status', data: [12, 0] },
    ]);
  });

  it('retains subject, day, period, occupancy and status from personal timetable points', () => {
    render(
      <AcademicInsightsVisualization
        section={personalSection('timetable', {
          series: [
            {
              name: 'periods',
              points: [
                {
                  key: 'period-id',
                  label: 'Mathematics',
                  value: 1,
                  x: 1,
                  y: 3,
                  status: 'scheduled',
                },
              ],
            },
          ],
        })}
      />
    );
    expect(screen.getByRole('columnheader', { name: 'Mon' })).toBeVisible();
    expect(screen.getByRole('rowheader', { name: '3' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '1' })).toBeVisible();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(
      screen.getByText('Weekday (0=Sunday): 1, Period: 3, Occupied slots: 1 · scheduled')
    ).toBeInTheDocument();
  });

  it('preserves upcoming exam items even when there are no result-stage observations', () => {
    render(
      <AcademicInsightsVisualization
        section={personalSection('exams', {
          series: [{ name: 'stages', points: [] }],
          items: [{ id: 'exam-id', label: 'English Midterm', status: 'scheduled' }],
        })}
      />
    );
    expect(screen.getByText('English Midterm')).toBeVisible();
    expect(screen.getByText('scheduled')).toBeVisible();
    expect(screen.queryByText(/scale 0 to/)).not.toBeInTheDocument();
  });

  it('supports a timetable item preview without inventing a period grid', () => {
    render(
      <AcademicInsightsVisualization
        section={personalSection('timetable', {
          items: [
            { id: 'lesson', label: 'Science', detail: 'Monday, period 2', status: 'scheduled' },
          ],
        })}
      />
    );
    expect(screen.getByText('Science')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
