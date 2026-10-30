import { it, expect, describe } from 'vitest';

import { getAccountIdentity } from './account-identity';

describe('account display details', () => {
  it('uses the staff name and photo with session email and all assigned roles', () => {
    const identity = getAccountIdentity(
      {
        preferred_username: 'staff-login',
        email: 'staff@school.test',
        role: ['teacher', 'coordinator'],
      },
      { fullName: 'Staff Full Name', shortName: 'SF' }
    );
    expect(identity.displayName).toBe('Staff Full Name');
    expect(identity.email).toBe('staff@school.test');
    expect(identity.roleLabel).toBe('teacher, coordinator');
    expect(identity.initials).toBe('SF');
  });

  it('uses the supplied username for an administrator without an employee record', () => {
    expect(getAccountIdentity({ preferred_username: 'admin-ddvs', role: 'admin' })).toMatchObject({
      displayName: 'admin-ddvs',
      initials: 'AD',
      roleLabel: 'admin',
      photoURL: '',
    });
  });

  it('prefers the session full name and supports standard name claims', () => {
    expect(
      getAccountIdentity({ name: 'Account Full Name', preferred_username: 'login' }).displayName
    ).toBe('Account Full Name');
    expect(getAccountIdentity({ given_name: 'First', family_name: 'Last' }).displayName).toBe(
      'First Last'
    );
    expect(getAccountIdentity({ unique_name: 'legacy-login' }).displayName).toBe('legacy-login');
  });

  it('handles missing session details and ignores blank role entries', () => {
    expect(getAccountIdentity()).toMatchObject({
      displayName: 'My account',
      email: '',
      roleLabel: '',
      initials: 'MA',
      photoURL: '',
    });
    expect(
      getAccountIdentity({ email: 'account@school.test', role: ['', 'teacher', ' '] })
    ).toMatchObject({ displayName: 'account@school.test', roleLabel: 'teacher' });
  });
});
