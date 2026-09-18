import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionFormCloneInitialValues } from './admission-form-clone-dialog';

describe('admission form clone values', () => {
  it('creates an explicit editable draft identity', () => {
    const form = {
      name: 'Registration form',
      code: 'REGISTRATION_FORM',
      description: 'Full application',
    } as AdmissionForm;

    expect(getAdmissionFormCloneInitialValues(form)).toEqual({
      name: 'Registration form copy',
      code: 'REGISTRATION_FORM_COPY',
      description: 'Full application',
    });
  });

  it('keeps generated codes within the backend limit', () => {
    const form = { name: 'Long form', code: 'A'.repeat(64) } as AdmissionForm;
    const generatedCode = getAdmissionFormCloneInitialValues(form).code;
    expect(generatedCode).toHaveLength(64);
    expect(generatedCode).toMatch(/_COPY$/);
    expect(generatedCode).not.toBe(form.code);
  });
});
