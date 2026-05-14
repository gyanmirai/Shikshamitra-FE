'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelMenuPlanningLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.catering.menuPlanning}>
    {children}
  </StudentPermissionGuard>
);

export default HostelMenuPlanningLayout;
