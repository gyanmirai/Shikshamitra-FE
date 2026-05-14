'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RecordsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.records.root}>
    {children}
  </StudentPermissionGuard>
);

export default RecordsLayout;
