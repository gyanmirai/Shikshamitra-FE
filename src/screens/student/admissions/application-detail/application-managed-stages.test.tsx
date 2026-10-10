import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ApplicationManagedStages } from './application-managed-stages';

vi.mock('../payment/application-payment-stage', () => ({
  ApplicationPaymentStage: ({
    stage: selected,
    readOnly,
    canAdvance,
  }: {
    stage: AdmissionApplicationStage;
    readOnly?: boolean;
    canAdvance: boolean;
  }) => (
    <div>
      Confirm fee structure workspace<span>{selected.id}</span>
      <span>{readOnly ? 'Read-only' : 'Editable'}</span>
      <span>{canAdvance ? 'Can continue' : 'Cannot continue'}</span>
    </div>
  ),
}));
vi.mock('../form-stage/application-form-stage', () => ({
  ApplicationFormStage: () => <div>Form workspace</div>,
}));
vi.mock('../assessments/application-assessments', () => ({ ApplicationAssessments: () => null }));
vi.mock('../document-verification/application-documents', () => ({
  ApplicationDocuments: () => null,
}));
vi.mock('../seat/application-seat-stage', () => ({ ApplicationSeatStage: () => null }));

const application = { id: 'application' } as AdmissionApplication;
const stage = {
  id: 'payment',
  stageType: 4,
  paymentStageEnabled: false,
  status: 1,
} as AdmissionApplicationStage;

it('opens the mandatory fee confirmation workspace even with no legacy payment policy flag', () => {
  const workflow = {
    currentStageInstanceId: stage.id,
    stages: [stage],
  } as AdmissionApplicationWorkflow;
  render(
    <ApplicationManagedStages
      application={application}
      workflow={workflow}
      canAdvance
      advancing={false}
      onComplete={vi.fn()}
    />
  );
  expect(screen.getByText('Confirm fee structure workspace')).toBeInTheDocument();
});

it.each([3, 6, 8])(
  'does not expose retired Eligibility/Review/Offer stage %s operational panels',
  (stageType) => {
    const retired = {
      ...stage,
      stageType,
      paymentStageEnabled: false,
      eligibilityEnabled: true,
      reviewEnabled: true,
      offerStageEnabled: true,
    };
    const workflow = {
      currentStageInstanceId: retired.id,
      stages: [retired],
    } as AdmissionApplicationWorkflow;
    const { container } = render(
      <ApplicationManagedStages
        application={application}
        workflow={workflow}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  }
);

it('renders a selected future fee stage for editing without allowing workflow advancement', () => {
  const current = { ...stage, id: 'form', stageType: 1, formStageEnabled: true };
  const future = { ...stage, id: 'future-payment', status: 0 };
  render(
    <ApplicationManagedStages
      application={application}
      workflow={
        {
          currentStageInstanceId: current.id,
          stages: [current, future],
        } as AdmissionApplicationWorkflow
      }
      selectedStage={future}
      canAdvance
      advancing={false}
      onComplete={vi.fn()}
    />
  );
  expect(screen.getByText('future-payment')).toBeVisible();
  expect(screen.getByText('Editable')).toBeVisible();
  expect(screen.getByText('Cannot continue')).toBeVisible();
  expect(screen.queryByText('Form workspace')).not.toBeInTheDocument();
});

it('keeps completed fee stages read-only when selected', () => {
  const previous = { ...stage, status: 2 };
  render(
    <ApplicationManagedStages
      application={application}
      workflow={
        { currentStageInstanceId: 'other', stages: [previous] } as AdmissionApplicationWorkflow
      }
      selectedStage={previous}
      canAdvance
      advancing={false}
      onComplete={vi.fn()}
    />
  );
  expect(screen.getByText('Read-only')).toBeVisible();
  expect(screen.getByText('Cannot continue')).toBeVisible();
});
