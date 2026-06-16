import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const InquiryPreferenceLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.inquiryPreference}>
    {children}
  </StudentPermissionGuard>
);

export default InquiryPreferenceLayout;
