import { it, expect, describe } from 'vitest';

import { getAdmissionOfferingPermissions } from './admission-offering-permissions';

describe('getAdmissionOfferingPermissions', () => {
  it('uses the backend Add permission for every additive offering command', () => {
    expect(
      getAdmissionOfferingPermissions([
        { name: 'Students.Admissions.Offerings.Add', isGranted: true },
      ])
    ).toEqual({
      create: true,
      bulkCreate: true,
      edit: true,
      clone: true,
      activate: true,
      deactivate: false,
      delete: false,
    });
  });

  it('uses the backend Delete permission for destructive offering commands', () => {
    expect(
      getAdmissionOfferingPermissions([
        { name: 'Students.Admissions.Offerings.Delete', isGranted: true },
      ])
    ).toEqual({
      create: false,
      bulkCreate: false,
      edit: false,
      clone: false,
      activate: false,
      deactivate: true,
      delete: true,
    });
  });

  it('does not authorize commands from nonexistent permission aliases', () => {
    expect(
      getAdmissionOfferingPermissions([
        { name: 'Students.Admissions.Offerings.Create', isGranted: true },
        { name: 'Students.Admissions.Offerings.BulkCreate', isGranted: true },
      ])
    ).toEqual({
      create: false,
      bulkCreate: false,
      edit: false,
      clone: false,
      activate: false,
      deactivate: false,
      delete: false,
    });
  });
});
