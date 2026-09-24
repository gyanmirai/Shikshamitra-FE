import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fireEvent, render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { ApplicationCurrentTask } from './application-current-task';

const currentStage: AdmissionApplicationStage = {
  id: 'stage-2',
  definitionStageId: 'definition-2',
  code: 'DOCUMENTS',
  name: 'Documents verified',
  stageType: 11,
  displayOrder: 2,
  status: 1,
  allowManualSkip: true,
  enteredAt: '2026-09-21T09:53:00Z',
};

describe('ApplicationCurrentTask', () => {
  it('keeps the black form-review action and outlined workflow actions wired', () => {
    const onReviewForm = vi.fn();
    const onAdvance = vi.fn();
    const onSkip = vi.fn();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ApplicationCurrentTask
          stage={currentStage}
          applicationStatus={4}
          active
          awaitingDecision={false}
          canComplete
          canRetryFormHandoff={false}
          canSkip
          advancing={false}
          retryingFormHandoff={false}
          onAdvance={onAdvance}
          onRetryFormHandoff={vi.fn()}
          onSkip={onSkip}
          onReviewForm={onReviewForm}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Current step')).toBeInTheDocument();

    const reviewButton = screen.getByText('Review application form').closest('button');
    expect(reviewButton).not.toBeNull();
    fireEvent.click(reviewButton!);
    expect(onReviewForm).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Complete Documents verified' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip this step' }));
    expect(onAdvance).toHaveBeenCalledOnce();
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
