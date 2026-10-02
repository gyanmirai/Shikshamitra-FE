import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionFormCloneInitialValues } from './admission-form-clone-dialog';

describe('admission form clone values', () => {
  it('requests a new generated identity for an independent cloned draft', () => {
    const form = {
      name: 'Registration form',
      code: 'REGISTRATION_FORM',
      description: 'Full application',
    } as AdmissionForm;

    expect(getAdmissionFormCloneInitialValues(form)).toEqual({
      name: 'Registration form copy',
      code: '',
      description: 'Full application',
    });
  });

  it('does not derive a clone code from the source code', () => {
    const form = { name: 'Long form', code: 'A'.repeat(64) } as AdmissionForm;
    const generatedCode = getAdmissionFormCloneInitialValues(form).code;
    expect(generatedCode).toBe('');
    expect(generatedCode).not.toBe(form.code);
  });
});
