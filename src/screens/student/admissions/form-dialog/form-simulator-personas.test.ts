import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { buildAdmissionFormPersonaValues } from './form-simulator-personas';

const form = {
  sections: [
    {
      fields: [
        { code: 'DOB', bindingKey: 'Applicant.DateOfBirth', fieldType: 5 },
        { code: 'GUARDIAN_MOBILE', bindingKey: 'Guardian.Mobile', fieldType: 4 },
        { code: 'TRANSFER', fieldType: 9 },
        { code: 'CATEGORY', fieldType: 6, optionsJson: '[{"value":"GENERAL"}]' },
      ],
    },
  ],
} as AdmissionForm;

describe('admission form simulator personas', () => {
  it('creates a complete representative applicant', () => {
    const values = buildAdmissionFormPersonaValues(form, 'valid');
    expect(values.GUARDIAN_MOBILE).toBe('+919876543210');
    expect(values.CATEGORY).toBe('GENERAL');
  });

  it('exposes missing guardian validation', () => {
    expect(buildAdmissionFormPersonaValues(form, 'missing-guardian').GUARDIAN_MOBILE).toBe('');
  });

  it('uses a recent date for an underage applicant', () => {
    const date = new Date(buildAdmissionFormPersonaValues(form, 'underage').DOB);
    expect(new Date().getFullYear() - date.getFullYear()).toBe(3);
  });

  it('activates transfer-specific controls', () => {
    expect(buildAdmissionFormPersonaValues(form, 'transfer').TRANSFER).toBe('true');
  });
});
