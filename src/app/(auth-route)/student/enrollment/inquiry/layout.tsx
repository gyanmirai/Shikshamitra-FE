'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const InquiryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.inquiry}>
    {children}
  </StudentPermissionGuard>
);

export default InquiryLayout;
