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

  it('keeps numbered stages accessible and selects their configured IDs when collapsed', () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationStageJourney
          collapsed
          stages={[
            stage('future', 30, 0, 'Payment'),
            stage('done', 10, 2, 'Registration Form'),
            stage('current', 20, 1, 'Document Verification'),
          ]}
          currentStageId="current"
          onChange={onChange}
        />
      </ThemeProvider>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveAccessibleName('Registration Form');
    expect(within(buttons[0]).getByText('1')).toBeInTheDocument();
    expect(buttons[1]).toHaveAccessibleName('Document Verification');
    expect(within(buttons[1]).getByText('2')).toBeInTheDocument();
    expect(buttons[1]).toHaveAttribute('aria-current', 'step');
    expect(buttons[2]).toHaveAccessibleName('Payment');
    expect(within(buttons[2]).getByText('3')).toBeInTheDocument();

    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledExactlyOnceWith('future');
  });

  it('retains the selected stage and interaction lock across collapsed and expanded views', () => {
    const onChange = vi.fn();
    const stages = [stage('done', 1, 2, 'Form'), stage('current', 2, 1, 'Payment')];
    const view = (collapsed: boolean, busy = false) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationStageJourney
          stages={stages}
          currentStageId="current"
          selectedStageId="done"
          collapsed={collapsed}
          busy={busy}
          onChange={onChange}
        />
      </ThemeProvider>
    );
    const { rerender } = render(view(true));
    expect(screen.getByRole('button', { name: 'Form' })).toHaveAttribute('aria-current', 'step');

    rerender(view(false));
    expect(screen.getByRole('button', { name: 'Form' })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Form')).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();

    rerender(view(true, true));
    screen.getAllByRole('button').forEach((button) => {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('retains the empty-state explanation in collapsed mode', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationStageJourney collapsed stages={[]} />
      </ThemeProvider>
    );

    expect(
      screen.getByText('No admission stages are available for this application.')
    ).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
