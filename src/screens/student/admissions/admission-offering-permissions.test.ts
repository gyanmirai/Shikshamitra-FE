import { it, expect, describe } from 'vitest';

import { getAdmissionOfferingPermissions } from './admission-offering-permissions';

describe('getAdmissionOfferingPermissions', () => {
  it('uses Add/Update for setup and lifecycle commands', () => {
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
      deactivate: true,
      delete: false,
    });
  });

  it('limits Delete permission to deleting an offering', () => {
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
      deactivate: false,
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
