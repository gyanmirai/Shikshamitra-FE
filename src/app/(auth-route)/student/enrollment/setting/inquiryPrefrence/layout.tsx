'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const InquiryPreferenceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.inquiryPreference}>
    {children}
  </StudentPermissionGuard>
);

export default InquiryPreferenceLayout;
