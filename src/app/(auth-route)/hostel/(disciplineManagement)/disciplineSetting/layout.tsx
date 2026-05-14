'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelDisciplineSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.disciplinary.setting}>
    {children}
  </StudentPermissionGuard>
);

export default HostelDisciplineSettingLayout;
