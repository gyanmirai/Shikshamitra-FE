'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelDisciplineLogLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.disciplinary.log}>
    {children}
  </StudentPermissionGuard>
);

export default HostelDisciplineLogLayout;
