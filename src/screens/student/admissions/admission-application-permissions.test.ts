import { expect, describe, it } from 'vitest';

import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';

describe('admission application permissions', () => {
  it('uses the backend canonical Add permission for application workflow actions', () => {
    expect(ADMISSION_APPLICATION_PERMISSIONS.manage).toBe('Students.Admissions.Applications.Add');
  });
});
