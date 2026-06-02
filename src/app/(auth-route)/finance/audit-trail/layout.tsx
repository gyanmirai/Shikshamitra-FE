'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AuditTrailLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.auditTrail}>
    {children}
  </StudentPermissionGuard>
);

export default AuditTrailLayout;
