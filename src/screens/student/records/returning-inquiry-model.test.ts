import type { ReturnInquiryIntake } from 'src/redux/student/records/student-record-transitions-api';

import { it, expect } from 'vitest';

import {
  buildReturningInquiry,
  emptyReturningInquiry,
  returningInquiryDefaults,
  validateReturningInquiry,
} from './returning-inquiry-model';

const intake = (): ReturnInquiryIntake => ({
  allowedSources: [1, 8, 11],
  requireSourceDetailFor: [11],
  requireGuardianEmail: true,
  requireApplicantDateOfBirth: true,
  serverBoundFieldCodes: ['name', 'guardian'],
  boundValues: [{ fieldCode: 'name', valueJson: '"Riya Shah"' }],
  form: {
    id: 'form-1',
    name: 'Return inquiry',
    code: 'RETURN',
    version: 3,
    status: 1,
    layoutType: 0,
    sectionCount: 1,
    defaultLanguage: 'hi',
    sections: [
      {
        id: 'section-1',
        code: 'DETAILS',
        name: 'Details',
        displayOrder: 0,
        fields: [
          {
            id: 'name',
            code: 'name',
            label: 'Student name',
            fieldType: 0,
            bindingType: 0,
            bindingKey: 'Applicant.FirstName',
            required: true,
            readOnly: true,
            displayOrder: 0,
          },
          {
            id: 'guardian',
            code: 'guardian',
            label: 'Guardian mobile',
            fieldType: 4,
            bindingType: 0,
            bindingKey: 'Guardian.Mobile',
            required: true,
            readOnly: true,
            displayOrder: 1,
          },
          {
            id: 'reason',
            code: 'interest',
            label: 'Reason for applying',
            fieldType: 0,
            bindingType: 1,
            required: true,
            readOnly: false,
            displayOrder: 2,
          },
        ],
      },
    ],
  },
});

it('uses the published language and authorised identity values without choosing a source', () => {
  expect(returningInquiryDefaults(intake())).toMatchObject({
    source: '',
    preferredLanguageCode: 'hi',
    fields: { name: 'Riya Shah', guardian: '' },
  });
});

it('requires an allowed source and source detail, while validating custom form answers', () => {
  expect(validateReturningInquiry(emptyReturningInquiry(), intake())).toMatchObject({
    source: expect.any(String),
    fields: { interest: expect.stringContaining('required') },
  });
  const values = {
    ...returningInquiryDefaults(intake()),
    source: 11 as const,
    fields: { interest: 'Reviewed return after relocation' },
  };
  expect(validateReturningInquiry(values, intake())).toMatchObject({
    sourceDetail: expect.any(String),
  });
  expect(
    validateReturningInquiry({ ...values, sourceDetail: 'Autumn school fair' }, intake())
  ).toEqual({});
});

it('does not force masked server-owned required fields into the client payload', () => {
  const values = {
    ...returningInquiryDefaults(intake()),
    source: 8 as const,
    fields: {
      name: 'Changed identity',
      guardian: '1234567890',
      interest: 'Returning after relocation',
    },
  };
  expect(validateReturningInquiry(values, intake())).toEqual({});
  expect(buildReturningInquiry(values, intake())).toEqual({
    source: 8,
    sourceDetail: undefined,
    preferredLanguageCode: 'hi',
    formValues: [{ fieldCode: 'interest', valueJson: '"Returning after relocation"' }],
  });
});

it('retains hidden-field semantics from the existing Admission validator', () => {
  const definition = intake();
  definition.form!.sections[0].visibilityRuleJson =
    '{"field":"show","operator":"equals","value":"yes"}';
  expect(validateReturningInquiry({ ...emptyReturningInquiry(), source: 1 }, definition)).toEqual(
    {}
  );
});

it('preserves canonical boolean and multiple-choice JSON evidence', () => {
  const definition = intake();
  definition.form!.sections[0].fields.push(
    {
      id: 'choices',
      code: 'choices',
      label: 'Choices',
      fieldType: 7,
      bindingType: 1,
      required: false,
      readOnly: false,
      displayOrder: 4,
    },
    {
      id: 'consent',
      code: 'consent',
      label: 'Consent',
      fieldType: 9,
      bindingType: 1,
      required: false,
      readOnly: false,
      displayOrder: 5,
    }
  );
  const result = buildReturningInquiry(
    {
      ...emptyReturningInquiry(),
      source: 1,
      fields: { choices: '["music","art"]', consent: 'true' },
    },
    definition
  );
  expect(result.formValues).toEqual([
    { fieldCode: 'choices', valueJson: '["music","art"]' },
    { fieldCode: 'consent', valueJson: 'true' },
  ]);
});

it('rejects unavailable metadata and prohibited source values', () => {
  expect(validateReturningInquiry(emptyReturningInquiry(), null)).toHaveProperty('source');
  expect(() => buildReturningInquiry({ ...emptyReturningInquiry(), source: 0 }, intake())).toThrow(
    'allowed inquiry source'
  );
});
