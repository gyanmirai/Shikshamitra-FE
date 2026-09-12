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

  it('temporarily grants Student Onboarding permissions in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(
      hasGrantedPermission(undefined, 'Students.Enrollment.AdmissionsCrm.ViewActivation')
    ).toBe(true);
    expect(hasGrantedPermission([], 'Students.Enrollment.AdmissionsCrm.ManageConfiguration')).toBe(
      true
    );
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
    expect(hasGrantedPermission([], 'Students.Enrollment.AdmissionsCrm.ViewActivation')).toBe(
      false
    );
  });

  it('keeps unrelated permissions protected in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(hasGrantedPermission([], 'Students.Records.StudentList')).toBe(false);
  });

  it('maps legacy Student workflow actions to the three canonical permissions', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const permissions = [
      { name: 'Students.Admissions.Applications.View', isGranted: true },
      { name: 'Students.Admissions.Applications.Add', isGranted: true },
      { name: 'Students.Admissions.Applicants.Add', isGranted: true },
    ];

    expect(hasGrantedPermission(permissions, 'Students.Admissions.Applications.View')).toBe(true);
    expect(hasGrantedPermission(permissions, 'Students.Admissions.Applications.Submit')).toBe(true);
    expect(hasGrantedPermission(permissions, 'Students.Admissions.Applicants.Notes.Create')).toBe(
      true
    );
    expect(hasGrantedPermission(permissions, 'Students.Admissions.Applications.Delete')).toBe(
      false
    );
  });
});
