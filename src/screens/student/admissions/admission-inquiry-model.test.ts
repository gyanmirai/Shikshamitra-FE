import type {
  AdmissionForm,
  AdmissionFormField,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  buildAdmissionInquiryPayload,
  type AdmissionInquiryFormValues,
} from './admission-inquiry-model';

const field = (
  code: string,
  bindingKey: string | undefined,
  fieldType = 0,
  required = false
): AdmissionFormField => ({
  id: code,
  code,
  label: code,
  fieldType: fieldType as AdmissionFormField['fieldType'],
  bindingType: bindingKey ? 0 : 1,
  bindingKey,
  required,
  readOnly: false,
  displayOrder: 0,
});

const fields = [
  field('FIRST_NAME', 'Applicant.FirstName', 0, true),
  field('DOB', 'Applicant.DateOfBirth', 5, true),
  field('GENDER', 'Applicant.Gender', 6, true),
  field('GUARDIAN_NAME', 'Guardian.FirstName', 0, true),
  field('GUARDIAN_MOBILE', 'Guardian.Mobile', 4, true),
  field('LEARNING_NOTES', 'LearningNotes', 1),
];

const values: AdmissionInquiryFormValues = {
  cycleId: 'cycle-1',
  offeringId: 'offering-1',
  source: 0,
  sourceDetail: '',
  fields: {
    FIRST_NAME: 'Aanya',
    DOB: '2016-04-12T00:00:00+05:30',
    GENDER: 'Female',
    GUARDIAN_NAME: 'Meera',
    GUARDIAN_MOBILE: '9876543210',
    LEARNING_NOTES: 'Benefits from visual learning prompts',
  },
};

describe('admission inquiry model', () => {
  it('carries canonical and custom form values into the inquiry request', () => {
    const payload = buildAdmissionInquiryPayload(values, fields);

    expect(payload.applicantFirstName).toBe('Aanya');
    expect(payload.applicantDateOfBirth).toBe('2016-04-12T00:00:00+05:30');
    expect(payload.guardianPhone).toBe('9876543210');
    expect(payload.formValues).toEqual(
      expect.arrayContaining([
        { fieldCode: 'GENDER', valueJson: '"Female"' },
        {
          fieldCode: 'LEARNING_NOTES',
          valueJson: '"Benefits from visual learning prompts"',
        },
      ])
    );
  });

  it('reports missing offering and required runtime fields', () => {
    const errors = validateAdmissionInquiry(
      { ...values, offeringId: '', fields: { ...values.fields, GENDER: '' } },
      fields
    );

    expect(errors.offeringId).toBe('Offering is required');
    expect(errors.fields).toEqual({ GENDER: 'GENDER is required' });
  });

  it('sends a trimmed duplicate override only when a separate family is requested', () => {
    const payload = buildAdmissionInquiryPayload(values, fields, null, true, '  Different guardian  ');

    expect(payload.createSeparateFamily).toBe(true);
    expect(payload.duplicateOverrideReason).toBe('Different guardian');
  });

  it('adds the guardian name required by the domain when a legacy form omits it', () => {
    const legacyForm = {
      sections: [{ fields: [field('GUARDIAN_MOBILE', 'Guardian.Mobile', 4, true)] }],
    } as AdmissionForm;

    expect(getAdmissionInquiryFields(legacyForm)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'guardianFirstName',
          bindingKey: 'Guardian.FirstName',
          required: true,
        }),
      ])
    );
  });
});
