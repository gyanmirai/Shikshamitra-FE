import type { ReactElement } from 'react';
import type {
  AcademicInsightsStatus,
  AcademicInsightsSectionKey,
} from 'src/redux/academicAPI/academicInsightsTypes';

import { it, vi, expect, describe } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { screen, render as renderUi } from '@testing-library/react';

import { AcademicInsightsVisualization } from './academic-insights-visualization';

const theme = createTheme({ cssVariables: true });
const render = (ui: ReactElement) => renderUi(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

vi.mock('src/components/chart', () => ({
  Chart: () => <div data-testid="chart" />,
  useChart: (options: unknown) => options,
}));

const emptyCases: [AcademicInsightsSectionKey, string][] = [
  ['classrooms', 'No class teacher mapping preview is available.'],
  ['student360', 'No comparable student samples are available.'],
  ['calendar', 'No upcoming calendar entries are available.'],
  ['curriculum', 'No recorded chapter progress is available.'],
  ['lesson', 'No lesson plans are available.'],
  ['timetable', 'No scheduled periods are available.'],
  ['tasks', 'No published learning task schedules are available.'],
  ['evaluation', 'No received submissions are available.'],
  ['exams', 'No exam stages or upcoming exams are available.'],
  ['reports', 'No completed export jobs are available.'],
  ['notifications', 'No notification templates are available.'],
  ['audits', 'No academic audit events are available.'],
  ['settings', 'No configuration records are available.'],
];

describe('academic insight empty responses', () => {
  it.each(emptyCases)(
    'explains the actual empty %s response rather than repeating source metadata',
    (key, message) => {
      render(
        <AcademicInsightsVisualization
          section={{
            key,
            status: 'empty',
            summary: 'Source methodology and preview limits.',
            metrics: [],
            series: [],
            items: [],
          }}
        />
      );
      expect(screen.getByText(message)).toBeVisible();
      expect(screen.queryByText('Source methodology and preview limits.')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
    }
  );

  it('provides curriculum guidance without inventing a zero percentage for missing observations', () => {
    render(
      <AcademicInsightsVisualization
        section={{
          key: 'curriculum',
          status: 'ready',
          summary: 'Recorded chapter progress only.',
          metrics: [
            {
              key: 'recorded-progress',
              label: 'Average recorded progress',
              value: null,
              unit: '%',
            },
          ],
          series: [{ name: 'recorded-progress', points: [] }],
          items: [],
        }}
      />
    );
    expect(screen.getByText('No recorded chapter progress is available.')).toBeVisible();
    expect(
      screen.getByText('Review subject and chapter setup in the permitted syllabus workflow.')
    ).toBeVisible();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it.each(['unavailable', 'error'] as AcademicInsightsStatus[])(
    'preserves the reason for %s instead of calling it empty',
    (status) => {
      render(
        <AcademicInsightsVisualization
          section={{
            key: 'curriculum',
            status,
            summary: 'The selected scope cannot be read.',
            metrics: [],
            series: [],
            items: [],
          }}
        />
      );
      expect(screen.getByText('The selected scope cannot be read.')).toBeVisible();
      expect(
        screen.queryByText('No recorded chapter progress is available.')
      ).not.toBeInTheDocument();
    }
  );
});
