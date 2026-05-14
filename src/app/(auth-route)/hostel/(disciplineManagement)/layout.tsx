'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelDisciplineGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.disciplinary.root}>
    {children}
  </StudentPermissionGuard>
);

export default HostelDisciplineGroupLayout;
