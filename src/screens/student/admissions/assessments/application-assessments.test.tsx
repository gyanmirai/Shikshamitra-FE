import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ApplicationAssessments } from './application-assessments';

vi.mock('./application-assessment-panel', () => ({
  ApplicationAssessmentPanel: ({
    stage,
    canAdvance,
  }: {
    stage: AdmissionApplicationStage;
    canAdvance: boolean;
  }) => (
    <div>
      Editable {stage.name}
      <span>{canAdvance ? 'Can continue' : 'Cannot continue'}</span>
    </div>
  ),
}));
vi.mock('./assessment-history-details', () => ({
  AssessmentHistoryDetails: ({ stageInstanceId }: { stageInstanceId: string }) => (
    <div>Read-only {stageInstanceId}</div>
  ),
}));
const previous = {
  id: 'previous',
  name: 'Previous assessment',
  assessmentEnabled: true,
  status: 2,
} as AdmissionApplicationStage;
const current = {
  id: 'current',
  name: 'Current assessment',
  assessmentEnabled: true,
  status: 1,
} as AdmissionApplicationStage;
const props = {
  applicationId: 'app-1',
  admissionOfferingId: 'offering-1',
  stages: [previous, current],
  currentStage: current,
  canAdvance: true,
  advancing: false,
  onComplete: vi.fn(),
  compact: true,
};

it('renders only the selected completed assessment as read-only', () => {
  render(<ApplicationAssessments {...props} selectedStageId="previous" />);
  expect(screen.getByText('Read-only previous')).toBeVisible();
  expect(screen.queryByText('Editable Current assessment')).not.toBeInTheDocument();
});

it('renders only the current assessment when selected', () => {
  render(<ApplicationAssessments {...props} selectedStageId="current" />);
  expect(screen.getByText('Editable Current assessment')).toBeVisible();
  expect(screen.queryByText('Read-only previous')).not.toBeInTheDocument();
});

it('reviews the final completed assessment read-only even when it remains the workflow current pointer', () => {
  render(
    <ApplicationAssessments
      {...props}
      stages={[previous, { ...current, status: 2 }]}
      currentStage={{ ...current, status: 2 }}
      selectedStageId="current"
    />
  );
  expect(screen.getByText('Read-only current')).toBeVisible();
  expect(screen.queryByText('Editable Current assessment')).not.toBeInTheDocument();
});

it('lets staff edit a future assessment without advancing or showing historical work', () => {
  const { rerender, container } = render(
    <ApplicationAssessments {...props} selectedStageId="missing" />
  );
  expect(container).toBeEmptyDOMElement();
  rerender(
    <ApplicationAssessments
      {...props}
      stages={[{ ...previous, status: 0 }, current]}
      selectedStageId="previous"
    />
  );
  expect(screen.getByText('Editable Previous assessment')).toBeVisible();
  expect(screen.getByText('Cannot continue')).toBeVisible();
  expect(screen.queryByText('Read-only previous')).not.toBeInTheDocument();
});
