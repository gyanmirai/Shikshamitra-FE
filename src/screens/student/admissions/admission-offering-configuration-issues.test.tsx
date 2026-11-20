import type { AdmissionOfferingValidationError } from 'src/redux/student/admissions/admission-offerings-api';

import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  offeringConfigurationMessage,
  AdmissionOfferingConfigurationIssues,
} from './admission-offering-configuration-issues';

it.each([
  ['CycleUnavailable', 'Publish the admission cycle before activating this offering.'],
  ['WorkflowMissing', 'Choose a published admission workflow.'],
  ['WorkflowNotPublished', 'Choose an available published admission workflow.'],
  ['InquiryFormMissing', 'Choose a published Inquiry form.'],
  ['ApplicationFormMissing', 'Choose a published Registration form.'],
  ['InquiryFormNotPublished', 'Choose an available published Inquiry form.'],
  ['ApplicationFormNotPublished', 'Choose an available published Registration form.'],
])('keeps %s guidance concise', (code, message) => {
  expect(
    offeringConfigurationMessage({ code, message: 'Long backend configuration instructions.' })
  ).toBe(message);
});

it('preserves unknown validation messages and existing identity guidance', () => {
  expect(
    offeringConfigurationMessage({
      code: 'NewServerRule',
      message: 'Keep this exact actionable explanation.',
    })
  ).toBe('Keep this exact actionable explanation.');
  expect(
    offeringConfigurationMessage({
      code: 'ApplicationFormIdentityIncomplete',
      message: 'Applicant.Name and Applicant.Gender are incomplete.',
    })
  ).toContain('Student name, Gender');
});

it.each([
  [
    'InquiryFormNotPublished',
    'Inquiry form "Inquiry 2026" is archived. Restore it or choose another.',
  ],
  [
    'ApplicationFormNotPublished',
    'Registration form "Inquiry 2026" is archived. Restore it or choose another.',
  ],
])('identifies the archived form and next step for %s', (code, message) => {
  expect(
    offeringConfigurationMessage({
      code,
      formName: 'Inquiry 2026',
      message: 'Form is archived. Long backend recovery instructions.',
    })
  ).toBe(message);
});

it('uses permission-aware owner destinations when a linked workflow or form is missing', () => {
  const errors: AdmissionOfferingValidationError[] = [
    { code: 'CycleUnavailable', message: 'Cycle unavailable.' },
    { code: 'WorkflowMissing', message: 'Missing workflow.' },
    { code: 'InquiryFormMissing', message: 'Missing form.' },
  ];
  const view = render(
    <AdmissionOfferingConfigurationIssues
      errors={errors}
      cycleName="Admission 2026 & 2027"
      canReviewCycles
      canReviewForms
      canReviewWorkflows
    />
  );
  expect(screen.getByRole('link', { name: 'Review admission cycle' })).toHaveAttribute(
    'href',
    expect.stringContaining('search=Admission+2026+%26+2027')
  );
  expect(screen.getByRole('link', { name: 'Review admission workflows' })).toHaveAttribute(
    'href',
    '/student/admissions/settings/workflows'
  );
  expect(screen.getByRole('link', { name: 'Review admission forms' })).toHaveAttribute(
    'href',
    '/student/admissions/settings/forms'
  );
  view.rerender(
    <AdmissionOfferingConfigurationIssues errors={errors} cycleName="Admission 2026 & 2027" />
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getAllByRole('alert')).toHaveLength(3);
});
