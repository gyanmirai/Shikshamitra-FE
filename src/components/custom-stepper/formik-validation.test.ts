import { it, expect, describe } from 'vitest';

import {
  getFirstFormikErrorPath,
  shouldValidateCurrentStep,
  shouldValidateForwardStepClick,
} from './formik-validation';

describe('custom stepper Formik validation', () => {
  it('returns the first nested field path in Formik order', () => {
    expect(
      getFirstFormikErrorPath({
        personalInfo: {
          firstName: 'First name is required',
          email: 'Email is required',
        },
      })
    ).toBe('personalInfo.firstName');
  });

  it('formats array field paths for repeatable form sections', () => {
    expect(
      getFirstFormikErrorPath({
        workExperiences: [undefined, { startDate: 'Start date is required' }],
      })
    ).toBe('workExperiences[1].startDate');
  });

  it('returns null when no validation error exists', () => {
    expect(getFirstFormikErrorPath({})).toBeNull();
  });

  it('keeps forward label validation opt-in for shared steppers', () => {
    expect(shouldValidateForwardStepClick(0, 1, false)).toBe(false);
    expect(shouldValidateForwardStepClick(0, 1, true)).toBe(true);
    expect(shouldValidateForwardStepClick(1, 0, true)).toBe(false);
  });

  it('allows a read-only final review to finish without revalidating hidden steps', () => {
    expect(shouldValidateCurrentStep(false, false)).toBe(true);
    expect(shouldValidateCurrentStep(true, true)).toBe(true);
    expect(shouldValidateCurrentStep(true, false)).toBe(false);
  });
});
