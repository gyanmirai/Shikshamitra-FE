import type { ReactNode } from 'react';

import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SubjectPassFailChart from './SubjectPassFailChart';
import ClassSyllabusProgressChart from './ClassSyllabusProgressChart';

const theme = createTheme(defaultSettings);
const renderChart = (chart: ReactNode) =>
  render(<ThemeProvider theme={theme}>{chart}</ThemeProvider>);

describe('Academic Dashboard charts', () => {
  it('explains the assessment metric and exposes an accessible chart region', () => {
    renderChart(
      <SubjectPassFailChart
        chartData={{
          subjectNames: ['No-result exam', 'Class 10-A Unit Test'],
          passCounts: [0, 24],
          failCounts: [0, 3],
        }}
      />
    );

    expect(screen.getByText('Passed vs failed')).toBeVisible();
    expect(screen.getByText('All classes & divisions')).toBeVisible();
    expect(screen.getByText('Students')).toBeVisible();
    expect(
      screen.getByRole('img', { name: 'Passed and failed student counts by exam' })
    ).toBeVisible();
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
  });

  it('explains the class progress metric and exposes an accessible chart region', () => {
    renderChart(
      <ClassSyllabusProgressChart
        chartData={{
          classNames: ['Class 8 - A', 'Class 9 - B'],
          completionPercentages: [45, 70],
        }}
      />
    );

    expect(screen.getByText('Class + division')).toBeVisible();
    expect(screen.getByText('Avg. chapters completed')).toBeVisible();
    expect(screen.getByText('Percentage')).toBeVisible();
    expect(
      screen.getByRole('img', { name: 'Class-wise syllabus completion percentages' })
    ).toBeVisible();
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
  });

  it('shows an honest empty state when every assessment has zero results', () => {
    renderChart(
      <SubjectPassFailChart
        chartData={{ subjectNames: ['Draft exam'], passCounts: [0], failCounts: [0] }}
      />
    );

    expect(screen.getByText('No exam results available')).toBeVisible();
    expect(
      screen.queryByRole('img', { name: 'Passed and failed student counts by exam' })
    ).not.toBeInTheDocument();
  });
});
