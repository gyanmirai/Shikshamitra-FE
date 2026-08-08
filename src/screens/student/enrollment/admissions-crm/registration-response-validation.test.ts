import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmFormFieldType,
  type AdmissionCrmRegistrationSectionDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  getEffectiveRegistrationValue,
  validateRegistrationResponses,
  calculateRegistrationCompletion,
} from './registration-response-validation';

const sections: AdmissionCrmRegistrationSectionDto[] = [
  {
    key: 'student',
    title: 'Student details',
    displayOrder: 1,
    parentVisible: true,
    fields: [
      {
        key: 'firstName',
        label: 'First name',
        fieldType: AdmissionCrmFormFieldType.Text,
        systemField: 'FirstName',
        required: true,
        parentEditable: true,
        displayOrder: 1,
        options: [],
      },
      {
        key: 'dateOfBirth',
        label: 'Date of birth',
        fieldType: AdmissionCrmFormFieldType.Date,
        systemField: 'DateOfBirth',
        required: true,
        parentEditable: true,
        displayOrder: 2,
        options: [],
      },
    ],
  },
];

describe('registration response validation', () => {
  it('matches API prefill keys to template system fields without case sensitivity', () => {
    const firstName = sections[0].fields[0];
    expect(getEffectiveRegistrationValue(firstName, {}, { firstName: 'Asha' })).toBe('Asha');
    expect(calculateRegistrationCompletion(sections, {}, { firstName: 'Asha' })).toBe(50);
  });

  it('reports field-specific required errors before submit', () => {
    expect(validateRegistrationResponses(sections, {}, {})).toEqual({
      firstName: 'First name is required.',
      dateOfBirth: 'Date of birth is required.',
    });
  });

  it('validates dates and accepts a complete prefilled form', () => {
    expect(
      validateRegistrationResponses(sections, { dateOfBirth: '2026-02-31' }, { firstName: 'Asha' })
    ).toEqual({ dateOfBirth: 'Enter a valid date.' });
    expect(
      validateRegistrationResponses(sections, {}, { firstName: 'Asha', dateOfBirth: '2016-08-07' })
    ).toEqual({});
  });
});
