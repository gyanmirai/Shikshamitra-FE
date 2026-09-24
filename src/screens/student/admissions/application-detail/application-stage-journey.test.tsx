import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { ApplicationStageJourney } from './application-stage-journey';

const stage = (
  id: string,
  displayOrder: number,
  status: number,
  name: string
): AdmissionApplicationStage => ({
  id,
  definitionStageId: `definition-${id}`,
  code: id.toUpperCase(),
  name,
  stageType: 11,
  displayOrder,
  status,
  allowManualSkip: false,
});

const renderJourney = (stages: AdmissionApplicationStage[]) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationStageJourney stages={stages} currentStageId="current" />
    </ThemeProvider>
  );

describe('ApplicationStageJourney', () => {
  it('renders every configured stage in display order with shared status labels', () => {
    renderJourney([
      stage('future', 30, 0, 'Admission decision'),
      stage('done', 10, 2, 'Application form submitted'),
      stage(
        'current',
        20,
        1,
        'Document verification with an intentionally long configured stage name'
      ),
      stage('skipped', 40, 3, 'Optional interaction'),
      stage('failed', 50, 4, 'Eligibility exception'),
    ]);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(within(items[0]).getByText('Application form submitted')).toBeInTheDocument();
    expect(
      within(items[1]).getByText(/intentionally long configured stage name/)
    ).toBeInTheDocument();
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Current step')).toBeInTheDocument();
    expect(screen.getByText('Not started')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows a stable empty state when no configured stages are returned', () => {
    renderJourney([]);

    expect(
      screen.getByText('No admission stages are available for this application.')
    ).toBeInTheDocument();
  });
});
