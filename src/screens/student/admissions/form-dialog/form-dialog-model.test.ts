import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import {
  nextFieldOrder,
  hasSystemBinding,
  CREATABLE_FIELD_TYPES,
  getConfigurableFieldTypes,
  getBlankAdmissionFormInitialValues,
} from './form-dialog-model';

describe('admission form field codes', () => {
  it('starts a blank form with an empty section ready for student fields', () => {
    const form = getBlankAdmissionFormInitialValues(0);

    expect(form.purpose).toBe(0);
    expect(form.layoutType).toBe(0);
    expect(form.sections).toHaveLength(1);
    expect(form.sections[0].fields).toEqual([]);
  });

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

  it('does not offer the runtime-unavailable file type for new fields', () => {
    expect(CREATABLE_FIELD_TYPES.some(([, value]) => value === 10)).toBe(false);
    expect(getConfigurableFieldTypes(0).some(([, value]) => value === 10)).toBe(false);
  });

  it('keeps an existing file placeholder visible without allowing it to be changed', () => {
    expect(getConfigurableFieldTypes(10)).toContainEqual(['File placeholder (unavailable)', 10]);
  });
});
