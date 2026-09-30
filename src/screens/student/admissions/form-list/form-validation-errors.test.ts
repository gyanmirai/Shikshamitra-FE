import { it, expect, describe } from 'vitest';

import {
  formatAdmissionFormValidationError,
  formatAdmissionFormValidationErrors,
} from './form-validation-errors';

describe('admission form validation messages', () => {
  it('turns backend field errors into guidance for the user', () => {
    expect(formatAdmissionFormValidationError('UnsupportedRuntimeField:PHOTO')).toBe(
      'PHOTO is not available for applicant use yet.'
    );
    expect(formatAdmissionFormValidationError('Admissions.FormInvalidOptions:COUNTRY')).toBe(
      'COUNTRY needs valid choices.'
    );
  });

  it('explains how to make a one-step draft eligible for approval', () => {
    expect(formatAdmissionFormValidationError('Admissions.FormStepperRequiresTwoSteps')).toBe(
      'Add a second step or change the form layout to Single page before requesting approval.'
    );
  });

  it('summarizes long validation results', () => {
    expect(
      formatAdmissionFormValidationErrors([
        'Admissions.FormNoSections',
        'Admissions.FormNoFields',
        'Admissions.FormDependencyCycle',
        'UnsupportedRuntimeField:PHOTO',
      ])
    ).toContain('1 more issue(s) need review.');
  });
});
