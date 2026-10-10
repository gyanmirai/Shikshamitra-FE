import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { ApplicationDecisionReviewSummary } from './application-decision-review-summary';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const stage = (
  id: string,
  name: string,
  displayOrder: number,
  stageType: number,
  status: number
): AdmissionApplicationStage => ({
  id,
  name,
  displayOrder,
  stageType,
  status,
  code: id,
  definitionStageId: id,
  allowManualSkip: false,
});
const workflow: AdmissionApplicationWorkflow = {
  workflowDefinitionId: 'workflow',
  status: 0,
  startedAt: '2026-10-10T10:00:00Z',
  availableTransitions: [],
  history: [],
  stages: [
    stage('offer', 'Admission offer', 4, 8, 0),
    stage('decision', 'Admission decision', 3, 7, 1),
    stage('exam', 'Entrance assessment', 2, 2, 4),
    stage('form', 'Application form', 1, 1, 2),
  ],
};
const application = { standardName: 'Class 1' } as AdmissionApplication;

it('reviews the actual ordered stage outcomes without inventing assessment marks or completion', () => {
  const onSelectStage = vi.fn();
  render(
    <ApplicationDecisionReviewSummary
      application={application}
      workflow={workflow}
      disabled={false}
      onSelectStage={onSelectStage}
    />
  );
  const rows = screen.getAllByRole('button');
  expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual([
    'Review Application form',
    'Review Entrance assessment',
  ]);
  expect(within(rows[0]).getByText('Completed')).toBeVisible();
  expect(within(rows[1]).getByText('Failed')).toBeVisible();
  expect(screen.queryByText(/Passed/)).not.toBeInTheDocument();
  expect(screen.queryByText(/63/)).not.toBeInTheDocument();
  expect(screen.queryByText('Admission offer')).not.toBeInTheDocument();
  expect(screen.getByText('Applying for Class 1')).toBeVisible();
  fireEvent.click(rows[1]);
  expect(onSelectStage).toHaveBeenCalledWith('exam');
});

it('locks review navigation during workspace operations and handles missing workflow details', () => {
  const onSelectStage = vi.fn();
  const view = render(
    <ApplicationDecisionReviewSummary
      application={application}
      workflow={workflow}
      disabled
      onSelectStage={onSelectStage}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Review Application form' }));
  expect(onSelectStage).not.toHaveBeenCalled();
  view.rerender(<ApplicationDecisionReviewSummary application={application} disabled={false} />);
  expect(screen.getByText('No prior stage details are available.')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
