'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RecordsReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.records.reports}>
    {children}
  </StudentPermissionGuard>
);

export default RecordsReportsLayout;
