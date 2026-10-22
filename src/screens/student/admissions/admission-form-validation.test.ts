import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getDynamicAdmissionValidationErrors } from './admission-form-validation';

const form = {
  id: 'form',
  name: 'Registration',
  code: 'REGISTRATION',
  version: 1,
  status: 1,
  layoutType: 0,
  sections: [
    {
      id: 'section',
      code: 'STUDENT',
      name: 'Student',
      displayOrder: 0,
      fields: [
        {
          id: 'name',
          code: 'studentName',
          label: 'Student name',
          fieldType: 0,
          bindingType: 1,
          required: true,
          readOnly: false,
          displayOrder: 0,
          validationJson: '{"minLength":2}',
        },
        {
          id: 'previous',
          code: 'hasPreviousSchool',
          label: 'Previous school',
          fieldType: 9,
          bindingType: 1,
          required: false,
          readOnly: false,
          displayOrder: 1,
        },
        {
          id: 'school',
          code: 'previousSchoolName',
          label: 'Previous school name',
          fieldType: 0,
          bindingType: 1,
          required: true,
          readOnly: false,
          displayOrder: 2,
          visibilityRuleJson: '{"field":"hasPreviousSchool","operator":"Equals","value":true}',
        },
        {
          id: 'grade',
          code: 'previousSchoolGrade',
          label: 'Previous school grade',
          fieldType: 0,
          bindingType: 1,
          required: false,
          readOnly: false,
          displayOrder: 3,
          requiredRuleJson: '{"field":"hasPreviousSchool","operator":"Equals","value":true}',
        },
      ],
    },
  ],
} as AdmissionForm;

describe('dynamic admission form validation', () => {
  it('keeps configured metadata email validation and optional empty values consistent', () => {
    const emailForm = {
      sections: [
        {
          fields: [
            {
              code: 'EMAIL',
              label: 'Email',
              fieldType: 0,
              required: false,
              validationJson: '{"format":"email"}',
            },
          ],
        },
      ],
    };
    expect(getDynamicAdmissionValidationErrors(emailForm, { EMAIL: '' })).toEqual({});
    expect(getDynamicAdmissionValidationErrors(emailForm, { EMAIL: 'parent@example.com' })).toEqual(
      {}
    );
    expect(
      getDynamicAdmissionValidationErrors(emailForm, { EMAIL: 'invalid-address' })
    ).toHaveProperty('EMAIL');
  });
  it('validates field rules and ignores hidden required fields', () => {
    expect(
      getDynamicAdmissionValidationErrors(form, { studentName: 'A', hasPreviousSchool: 'false' })
    ).toMatchObject({ studentName: expect.stringContaining('at least 2') });
    expect(
      getDynamicAdmissionValidationErrors(form, {
        studentName: 'Aarav',
        hasPreviousSchool: 'false',
      })
    ).toEqual({});
    expect(
      getDynamicAdmissionValidationErrors(form, { studentName: 'Aarav', hasPreviousSchool: 'true' })
    ).toHaveProperty('previousSchoolName');
    expect(
      getDynamicAdmissionValidationErrors(form, { studentName: 'Aarav', hasPreviousSchool: 'true' })
    ).toHaveProperty('previousSchoolGrade');
  });

  it('validates preset regex and structured location values', () => {
    const presetForm = {
      ...form,
      sections: [
        {
          ...form.sections[0],
          fields: [
            {
              ...form.sections[0].fields[0],
              code: 'PAN',
              label: 'PAN',
              required: false,
              validationJson: '{"format":"pan","regex":"^[A-Z]{5}[0-9]{4}[A-Z]$"}',
            },
            {
              ...form.sections[0].fields[0],
              code: 'COUNTRY',
              label: 'Country',
              required: false,
              validationJson: '{"format":"country"}',
            },
          ],
        },
      ],
    } as AdmissionForm;

    expect(
      getDynamicAdmissionValidationErrors(presetForm, { PAN: 'invalid', COUNTRY: 'India' })
    ).toEqual({
      PAN: expect.stringContaining('invalid format'),
      COUNTRY: expect.stringContaining('valid location'),
    });
    expect(
      getDynamicAdmissionValidationErrors(presetForm, {
        PAN: 'ABCDE1234F',
        COUNTRY: '{"name":"India","isoCode":"IN"}',
      })
    ).toEqual({});
  });
});
