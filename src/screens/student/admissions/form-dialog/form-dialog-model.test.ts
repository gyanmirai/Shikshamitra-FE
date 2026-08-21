import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { nextFieldOrder, hasSystemBinding } from './form-dialog-model';

describe('admission form field codes', () => {
  it('generates a unique field sequence across every step', () => {
    const sections = [
      { fields: [{ code: 'FIELD_1' }, { code: 'FIELD_3' }] },
      { fields: [{ code: 'CUSTOM_CODE' }] },
    ] as CreateUpdateAdmissionForm['sections'];

    expect(nextFieldOrder(sections)).toBe(1);
  });

  it('detects duplicate canonical student bindings across sections', () => {
    const sections = [
      { fields: [{ bindingType: 0, bindingKey: 'Applicant.DateOfBirth' }] },
      { fields: [{ bindingType: 1, bindingKey: 'Applicant.DateOfBirth' }] },
    ] as CreateUpdateAdmissionForm['sections'];

    expect(hasSystemBinding(sections, 'Applicant.DateOfBirth')).toBe(true);
    expect(hasSystemBinding(sections, 'Applicant.Gender')).toBe(false);
  });
});
