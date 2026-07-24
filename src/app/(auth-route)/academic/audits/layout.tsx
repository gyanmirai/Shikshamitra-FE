'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AcademicAuditTrailLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.audits}>
    {children}
  </StudentPermissionGuard>
);

export default AcademicAuditTrailLayout;
