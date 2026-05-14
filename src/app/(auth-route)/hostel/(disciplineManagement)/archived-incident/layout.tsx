'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelArchivedIncidentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.disciplinary.archived}>
    {children}
  </StudentPermissionGuard>
);

export default HostelArchivedIncidentLayout;
