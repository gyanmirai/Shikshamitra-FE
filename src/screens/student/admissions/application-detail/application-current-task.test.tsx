import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicationCurrentTask } from './application-current-task';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

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

it.each([
  {
    requireSectionVerification: true,
    autoAdvanceOnSubmit: true,
    expected: 'This step continues after the required sections are verified.',
  },
  {
    requireSectionVerification: false,
    autoAdvanceOnSubmit: true,
    expected: 'The form automatically advances this journey after a successful submission.',
  },
  {
    requireSectionVerification: false,
    autoAdvanceOnSubmit: false,
    expected: 'After successful submission, use Continue to finish this step.',
  },
])('explains authoritative Form continuation rules: %j', ({ expected, ...formPolicy }) => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationCurrentTask
        stage={{ ...currentStage, stageType: 1, formStageEnabled: true }}
        applicationStatus={1}
        formPolicy={formPolicy}
        active
        awaitingDecision={false}
        canComplete={false}
        canRetryFormHandoff={false}
        canSkip={false}
        advancing={false}
        retryingFormHandoff={false}
        onAdvance={vi.fn()}
        onRetryFormHandoff={vi.fn()}
        onSkip={vi.fn()}
        onReviewForm={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(screen.getByText(expected)).toBeInTheDocument();
  if (formPolicy.requireSectionVerification) {
    expect(
      screen.getByText(/Complete any required verification before continuing/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/automatically advances/)).not.toBeInTheDocument();
  }
});
