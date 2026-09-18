import { it, expect, describe } from 'vitest';

import { getAdmissionFormAccess } from '../form-access';

describe('getAdmissionFormAccess', () => {
  it('uses the canonical Add capability for form management and publishing', () => {
    const access = getAdmissionFormAccess([
      { name: 'Students.Admissions.Forms.View', isGranted: true },
      { name: 'Students.Admissions.Forms.Add', isGranted: true },
      { name: 'Students.Admissions.Forms.Delete', isGranted: false },
    ]);

    expect(access).toMatchObject({
      canView: true,
      canManage: true,
      canPublish: true,
      canDelete: false,
    });
  });

  it('does not invent separate grants for backend permission aliases', () => {
    const access = getAdmissionFormAccess([
      { name: 'Students.Admissions.Forms.Manage', isGranted: true },
      { name: 'Students.Admissions.Forms.Publish', isGranted: true },
    ]);

    expect(access.canManage).toBe(false);
    expect(access.canPublish).toBe(false);
  });
});
