import { it, vi, expect, describe, afterEach } from 'vitest';

import { hasGrantedPermission } from './permissions';

describe('hasGrantedPermission', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('temporarily grants every Admissions permission in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(hasGrantedPermission([], 'Students.Admissions.View')).toBe(true);
    expect(hasGrantedPermission(undefined, 'Students.Admissions.Offerings.Create')).toBe(true);
    expect(
      hasGrantedPermission(undefined, [
        'Students.Admissions.Inquiries.View',
        'Students.Admissions.Forms.View',
      ])
    ).toBe(true);
  });

  it('does not bypass Admissions permissions outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(hasGrantedPermission([], 'Students.Admissions.View')).toBe(false);
    expect(
      hasGrantedPermission(
        [{ name: 'ShikshaMitra.Module.Students', isGranted: true }],
        'Students.Admissions.View'
      )
    ).toBe(false);
  });

  it('keeps unrelated permissions protected in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(hasGrantedPermission([], 'Students.Records.StudentList')).toBe(false);
  });
});
