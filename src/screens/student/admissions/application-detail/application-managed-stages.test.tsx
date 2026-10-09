import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ApplicationManagedStages } from './application-managed-stages';

vi.mock('../payment/application-payment-stage', () => ({
  ApplicationPaymentStage: () => <div>Confirm fee structure workspace</div>,
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
