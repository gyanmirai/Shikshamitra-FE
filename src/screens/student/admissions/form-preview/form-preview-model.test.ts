import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionFormPreviewInitialValues } from './form-preview-model';

describe('admission form preview initial values', () => {
  it('uses configured defaults and leaves other fields empty', () => {
    const form = {
      sections: [
        {
          fields: [{ code: 'COUNTRY', defaultValue: 'IN' }, { code: 'MIDDLE_NAME' }],
        },
      ],
    } as AdmissionForm;

    expect(getAdmissionFormPreviewInitialValues(form)).toEqual({
      COUNTRY: 'IN',
      MIDDLE_NAME: '',
    });
  });

  it('returns an empty object while the form is loading', () => {
    expect(getAdmissionFormPreviewInitialValues()).toEqual({});
  });
});
