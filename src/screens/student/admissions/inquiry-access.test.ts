import type { GrantedPermission } from 'src/utils/permissions';

import { it, expect, describe } from 'vitest';

import { getAdmissionInquiryAccess, ADMISSION_INQUIRY_PERMISSIONS } from './inquiry-access';

const granted = (...names: string[]): GrantedPermission[] =>
  names.map((name) => ({ name, isGranted: true }));

describe('getAdmissionInquiryAccess', () => {
  it('allows inquiry creation and assignment through the canonical Add permission', () => {
    const access = getAdmissionInquiryAccess(granted(ADMISSION_INQUIRY_PERMISSIONS.manage));

    expect(access.canManage).toBe(true);
    expect(access.canAssign).toBe(true);
  });

  it('does not treat View permission as permission to create an inquiry', () => {
    const access = getAdmissionInquiryAccess(granted(ADMISSION_INQUIRY_PERMISSIONS.view));

    expect(access.canView).toBe(true);
    expect(access.canManage).toBe(false);
    expect(access.canAssign).toBe(false);
  });

  it('ignores the non-canonical Manage alias because permission checks are exact', () => {
    const access = getAdmissionInquiryAccess(granted('Students.Admissions.Inquiries.Manage'));

    expect(access.canManage).toBe(false);
  });
});
