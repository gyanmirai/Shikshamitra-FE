import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { useFormik } from 'formik';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { DEFAULT_SEAT_POLICY } from 'src/redux/student/admissions/admission-seat-policy';
import { DEFAULT_OFFER_POLICY } from 'src/redux/student/admissions/admission-offer-policy';
import { DEFAULT_REVIEW_POLICY } from 'src/redux/student/admissions/admission-review-policy';
import { DEFAULT_PAYMENT_POLICY } from 'src/redux/student/admissions/admission-payment-policy';
import { DEFAULT_DOCUMENT_POLICY } from 'src/redux/student/admissions/admission-document-policy';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';
import { DEFAULT_ELIGIBILITY_POLICY } from 'src/redux/student/admissions/admission-eligibility-policy';

import { WorkflowFormSettings } from './components/workflow-form-settings';
import { WorkflowSeatSettings } from './components/workflow-seat-settings';
import { WorkflowOfferSettings } from './components/workflow-offer-settings';
import { WorkflowReviewSettings } from './components/workflow-review-settings';
import { WorkflowPaymentSettings } from './components/workflow-payment-settings';
import { WorkflowDocumentSettings } from './components/workflow-document-settings';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { WorkflowAssessmentSettings } from './components/workflow-assessment-settings';
import { WorkflowEligibilitySettings } from './components/workflow-eligibility-settings';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

type StageCase = {
  name: string;
  stageType: AdmissionWorkflowStage['stageType'];
  key: string;
  policy: object;
  basicLabel: string;
  managedLabel: string;
};

const cases: StageCase[] = [
  {
    name: 'Form',
    stageType: 1,
    key: 'form',
    policy: DEFAULT_FORM_STAGE_POLICY,
    basicLabel: 'Submission only',
    managedLabel: 'Submission with rules',
  },
  {
    name: 'Assessment',
    stageType: 2,
    key: 'assessment',
    policy: DEFAULT_ASSESSMENT_POLICY,
    basicLabel: 'Complete manually',
    managedLabel: 'Record an assessment result',
  },
  {
    name: 'Eligibility',
    stageType: 3,
    key: 'eligibility',
    policy: DEFAULT_ELIGIBILITY_POLICY,
    basicLabel: 'Complete manually',
    managedLabel: 'Check eligibility rules',
  },
  {
    name: 'Documents',
    stageType: 5,
    key: 'documentVerification',
    policy: DEFAULT_DOCUMENT_POLICY,
    basicLabel: 'Complete manually',
    managedLabel: 'Collect and verify documents',
  },
  {
    name: 'Review',
    stageType: 6,
    key: 'review',
    policy: DEFAULT_REVIEW_POLICY,
    basicLabel: 'Complete manually',
    managedLabel: 'Collect a staff review and recommendation',
  },
  {
    name: 'Payment',
    stageType: 4,
    key: 'payment',
    policy: DEFAULT_PAYMENT_POLICY,
    basicLabel: 'Complete manually',
    managedLabel: 'Collect and verify payment',
  },
  {
    name: 'Offer',
    stageType: 8,
    key: 'offer',
    policy: DEFAULT_OFFER_POLICY,
    basicLabel: 'Use existing offer actions',
    managedLabel: 'Manage offer validity and responses',
  },
  {
    name: 'Seat',
    stageType: 9,
    key: 'seat',
    policy: DEFAULT_SEAT_POLICY,
    basicLabel: 'Basic seat step (existing process)',
    managedLabel: 'Managed capacity, reservation, and waitlist',
  },
];

const form: AdmissionForm = {
  id: 'published-form',
  name: 'Application form',
  code: 'APPLICATION',
  version: 1,
  status: 1,
  layoutType: 0,
  sectionCount: 1,
  sections: [
    { id: 'section-1', code: 'APPLICANT', name: 'Applicant details', displayOrder: 0, fields: [] },
  ],
};

const stageFor = (scenario: StageCase, configurationJson: string): AdmissionWorkflowStage => ({
  id: 'saved-stage',
  stageType: scenario.stageType,
  code: 'SAVED_OPERATIONAL_CODE',
  name: scenario.name,
  displayOrder: 2,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: true,
  description: 'Keep the saved instructions',
  configurationJson,
});

function StagePolicyFields({
  scenario,
  formik,
  readOnly,
  available,
}: {
  scenario: StageCase;
  formik: FormikProps<AdmissionWorkflowStage>;
  readOnly: boolean;
  available: boolean;
}) {
  const common = { formik, readOnly, available };
  switch (scenario.stageType) {
    case 1:
      return (
        <WorkflowFormSettings
          {...common}
          forms={[form]}
          formDefinitionId={form.id}
          onGoToBasics={vi.fn()}
        />
      );
    case 2:
      return <WorkflowAssessmentSettings {...common} />;
    case 3:
      return <WorkflowEligibilitySettings {...common} forms={[form]} stages={[]} />;
    case 5:
      return <WorkflowDocumentSettings {...common} forms={[form]} stages={[]} />;
    case 6:
      return <WorkflowReviewSettings {...common} stages={[]} />;
    case 4:
      return <WorkflowPaymentSettings {...common} />;
    case 8:
      return <WorkflowOfferSettings {...common} />;
    case 9:
      return <WorkflowSeatSettings {...common} />;
    default:
      throw new Error(`Missing test renderer for ${scenario.name}`);
  }
}

function Harness({
  scenario,
  initialValues,
  readOnly,
  available,
}: {
  scenario: StageCase;
  initialValues: AdmissionWorkflowStage;
  readOnly: boolean;
  available: boolean;
}) {
  const formik = useFormik({ initialValues, onSubmit: vi.fn() });
  return (
    <>
      <StagePolicyFields
        scenario={scenario}
        formik={formik}
        readOnly={readOnly}
        available={available}
      />
      <output data-testid="stage-state">{JSON.stringify(formik.values)}</output>
    </>
  );
}

function setup(
  scenario: StageCase,
  options: { readOnly?: boolean; available?: boolean; version?: number } = {}
) {
  mswServer.use(
    http.get('*/student/enrollment/admissions/document-verification/document-types', () =>
      HttpResponse.json([])
    ),
    http.get('*/student/enrollment/admissions/reviews/reviewer-roles', () => HttpResponse.json([])),
    http.get('*/student/enrollment/admissions/reviews/reviewers', () => HttpResponse.json([]))
  );
  const initialPolicy = {
    ...scenario.policy,
    enabled: false,
    savedNote: 'Keep this policy extension',
    ...(options.version ? { version: options.version } : {}),
  };
  const configuration = {
    extension: { source: 'Existing integration' },
    formDefinitionId: form.id,
    [scenario.key]: initialPolicy,
  };
  const initialValues = stageFor(scenario, JSON.stringify(configuration));
  renderDocumentUi(
    <Harness
      scenario={scenario}
      initialValues={initialValues}
      readOnly={options.readOnly ?? false}
      available={options.available ?? true}
    />
  );
  const values = (): AdmissionWorkflowStage =>
    JSON.parse(screen.getByTestId('stage-state').textContent!);
  const savedConfiguration = () => JSON.parse(values().configurationJson!);
  return {
    initialValues,
    initialPolicy,
    configuration,
    values,
    savedConfiguration,
    user: userEvent.setup(),
  };
}

describe('stage process cards preserve policy contracts', { timeout: 15000 }, () => {
  it.each(cases)(
    '$name toggles process without changing saved fields, defaults or sibling configuration',
    async (scenario) => {
      const { user, initialValues, initialPolicy, configuration, values, savedConfiguration } =
        setup(scenario);
      expect(screen.getByRole('radio', { name: scenario.basicLabel })).toBeChecked();
      await user.click(screen.getByRole('radio', { name: scenario.basicLabel }));
      expect(values()).toEqual(initialValues);
      await user.click(screen.getByRole('radio', { name: scenario.managedLabel }));
      const expectedPolicy = {
        ...initialPolicy,
        enabled: true,
        ...(scenario.key === 'assessment' ? { schedulingEnabled: false } : {}),
      };
      await waitFor(() =>
        expect(savedConfiguration()).toEqual({ ...configuration, [scenario.key]: expectedPolicy })
      );
      expect(values()).toEqual({ ...initialValues, configurationJson: values().configurationJson });
      if (scenario.key === 'assessment') {
        expect(screen.getAllByRole('radio')).toHaveLength(3);
        await user.click(screen.getByRole('radio', { name: 'Schedule an entrance exam' }));
        await waitFor(() =>
          expect(savedConfiguration()).toEqual({
            ...configuration,
            assessment: { ...expectedPolicy, schedulingEnabled: true },
          })
        );
      }
      await user.click(screen.getByRole('radio', { name: scenario.basicLabel }));
      await waitFor(() =>
        expect(savedConfiguration()).toEqual({
          ...configuration,
          [scenario.key]: { ...expectedPolicy, enabled: false },
        })
      );
      expect(values()).toEqual({ ...initialValues, configurationJson: values().configurationJson });
    }
  );

  it.each(cases)('$name does not allow mode changes in read-only views', (scenario) => {
    const { values, initialValues } = setup(scenario, { readOnly: true });
    screen.getAllByRole('radio').forEach((choice) => {
      expect(choice).toBeDisabled();
      fireEvent.click(choice);
    });
    expect(values()).toEqual(initialValues);
  });

  it.each(cases)('$name does not enable unavailable environment capabilities', (scenario) => {
    const { values, initialValues } = setup(scenario, { available: false });
    screen.getAllByRole('radio').forEach((choice) => {
      expect(choice).toBeDisabled();
      fireEvent.click(choice);
    });
    expect(values()).toEqual(initialValues);
  });

  it.each(cases)(
    '$name preserves future policy versions instead of overwriting them',
    (scenario) => {
      const { values, initialValues } = setup(scenario, { version: 2 });
      screen.getAllByRole('radio').forEach((choice) => {
        expect(choice).toBeDisabled();
        fireEvent.click(choice);
      });
      expect(values()).toEqual(initialValues);
    }
  );
});
