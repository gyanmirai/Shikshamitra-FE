import { it, expect, describe } from 'vitest';

import { getEnrollmentApiErrorCode, getEnrollmentApiErrorMessage } from './enrollment-api-errors';

describe('enrollment API errors', () => {
  it('maps ABP business codes to actionable enrollment recovery', () => {
    const error = {
      status: 400,
      data: {
        error: {
          code: 'AdmissionCrm:ExamSlotCapacityFull',
          message: 'One or more business rules were violated.',
        },
      },
    };

    expect(getEnrollmentApiErrorCode(error)).toBe('AdmissionCrm:ExamSlotCapacityFull');
    expect(getEnrollmentApiErrorMessage(error, 'Fallback')).toContain('slot has just filled');
  });

  it.each([
    [401, 'session expired'],
    [403, 'permission'],
    [404, 'no longer available'],
    [409, 'another session'],
    [422, 'highlighted'],
    [500, 'temporarily unavailable'],
  ])('provides safe status-specific recovery for %s', (status, expected) => {
    expect(getEnrollmentApiErrorMessage({ status }, 'Fallback')).toContain(expected);
  });

  it('uses the first validation message without exposing server details on a 500', () => {
    expect(
      getEnrollmentApiErrorMessage(
        {
          status: 400,
          data: { error: { validationErrors: [{ message: 'Contact is invalid.' }] } },
        },
        'Fallback'
      )
    ).toBe('Contact is invalid.');
    expect(
      getEnrollmentApiErrorMessage(
        { status: 500, data: { detail: 'Database password leaked here' } },
        'Fallback'
      )
    ).not.toContain('password');
  });
});
