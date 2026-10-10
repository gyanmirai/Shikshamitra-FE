import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

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
  it('renders every configured stage in display order without status captions or counts', () => {
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
    ['Completed', 'Current step', 'Not started', 'Skipped', 'Failed'].forEach((caption) =>
      expect(screen.queryByText(caption)).not.toBeInTheDocument()
    );
  });

  it('allows selecting a future stage and locks all step controls while busy', () => {
    const onChange = vi.fn();
    const stages = [stage('current', 1, 1, 'Form'), stage('future', 2, 0, 'Assessment')];
    const { rerender } = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationStageJourney
          stages={stages}
          currentStageId="current"
          selectedStageId="current"
          onChange={onChange}
        />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Assessment' }));
    expect(onChange).toHaveBeenLastCalledWith('future');
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationStageJourney
          stages={stages}
          currentStageId="current"
          selectedStageId="future"
          busy
          onChange={onChange}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Assessment' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it('shows a stable empty state when no configured stages are returned', () => {
    renderJourney([]);

    expect(
      screen.getByText('No admission stages are available for this application.')
    ).toBeInTheDocument();
  });
});
