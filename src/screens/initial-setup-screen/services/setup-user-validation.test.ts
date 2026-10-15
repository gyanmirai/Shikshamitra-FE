import { it, expect, describe } from 'vitest';

import { isSetupConflict } from './setup-error';
import { setupUserError } from './setup-user-error';
import { setupUserSchema, setupPasswordFeedback } from './setup-user-validation';

export const policy = {
  requiredLength: 8,
  requiredUniqueChars: 1,
  requireLowercase: true,
  requireUppercase: true,
  requireDigit: true,
  requireNonAlphanumeric: true,
};
const values = {
  userName: 'teacher.one',
  email: 'teacher@example.test',
  password: 'Staff-Password-29!',
  roleNames: [],
};

describe('setup user validation', () => {
  it.each(['ab', 'teacher one'])('rejects username %s', (userName) => {
    expect(() => setupUserSchema(policy).validateSync({ ...values, userName })).toThrow(
      /at least 3 characters.*no spaces/
    );
  });
  it('validates emails and trims credentials without changing passwords', async () => {
    await expect(
      setupUserSchema(policy).validate({ ...values, email: 'testuser' })
    ).rejects.toThrow('Please enter a valid email address');
    const result = await setupUserSchema(policy).validate({
      ...values,
      email: ' teacher@example.test ',
      userName: ' teacher.one ',
    });
    expect(result.email).toBe(values.email);
    expect(result.userName).toBe(values.userName);
    expect(result.password).toBe(values.password);
  });
  it('lists every missing password rule and updates for the tenant policy', () => {
    expect(setupPasswordFeedback('12345', policy)).toBe(
      'Use at least 8 characters; Include a lowercase letter; Include an uppercase letter; Include a special character.'
    );
    expect(setupPasswordFeedback('pass123', policy)).not.toContain('lowercase');
    expect(setupPasswordFeedback(values.password, policy)).toBe('Password meets all requirements.');
    expect(
      setupPasswordFeedback('abcdefghi', {
        ...policy,
        requiredLength: 12,
        requireUppercase: false,
        requireDigit: false,
        requireNonAlphanumeric: false,
      })
    ).toBe('Use at least 12 characters.');
  });
  it.each([400, 409])('maps duplicate email at status %s without a setup conflict', (status) => {
    const failure = {
      status,
      data: {
        errorCode: 'Volo.Abp.Identity:DuplicateEmail',
        detail: 'One or more business rules were violated.',
      },
    };
    const result = setupUserError(failure, values);
    expect(result.title).toBe('Email Already In Use');
    expect(result.fields.email).toContain(values.email);
    expect(result.message).toContain('Please use a different email');
    expect(isSetupConflict(failure)).toBe(false);
  });
  it('maps nested ABP identity errors and normalized field errors', () => {
    expect(
      setupUserError(
        { status: 400, data: { error: { code: 'Volo.Abp.Identity:DuplicateUserName' } } },
        values
      ).fields.userName
    ).toContain('different user name');
    expect(
      setupUserError(
        {
          status: 400,
          data: { errors: { 'input.Email': ['Email rejected'], Password: ['Password rejected'] } },
        },
        values
      ).fields
    ).toEqual({ email: 'Email rejected', password: 'Password rejected' });
    expect(
      setupUserError(
        {
          status: 400,
          data: {
            error: { validationErrors: [{ members: ['UserName'], message: 'Invalid user name' }] },
          },
        },
        values
      ).fields.userName
    ).toBe('Invalid user name');
    expect(
      setupUserError(
        { status: 400, data: { errorCode: 'Volo.Abp.Identity:PasswordRequiresNonAlphanumeric' } },
        values
      ).fields.password
    ).toBe('Password must include a special character.');
  });
  it('preserves real concurrency recovery and supplies a network retry message', () => {
    expect(isSetupConflict({ status: 409, data: { title: 'Conflict' } })).toBe(true);
    expect(setupUserError({ status: 409, data: { title: 'Conflict' } }, values).message).toContain(
      'Reload the saved setup'
    );
    expect(
      setupUserError({ status: 'FETCH_ERROR', error: 'Failed to fetch' }, values).message
    ).toContain('Your entries are still here');
  });
});
