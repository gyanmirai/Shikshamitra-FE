import { it, expect, describe } from 'vitest';

import { getAdmissionWorkflowAccess } from '../workflow-access';

describe('getAdmissionWorkflowAccess', () => {
  it('uses the canonical workflow permissions returned by the backend', () => {
    const access = getAdmissionWorkflowAccess([
      { name: 'Students.Admissions.Workflows.View', isGranted: true },
      { name: 'Students.Admissions.Workflows.Add', isGranted: true },
      { name: 'Students.Admissions.Workflows.Delete', isGranted: false },
    ]);

    expect(access.canView).toBe(true);
    expect(access.canManage).toBe(true);
    expect(access.canDelete).toBe(false);
  });

  it('does not invent separate grants for legacy workflow action names', () => {
    const access = getAdmissionWorkflowAccess([
      { name: 'Students.Admissions.Workflows.Edit', isGranted: true },
      { name: 'Students.Admissions.Workflows.Validate', isGranted: true },
      { name: 'Students.Admissions.Workflows.Publish', isGranted: true },
    ]);

    expect(access.canManage).toBe(false);
  });
});
