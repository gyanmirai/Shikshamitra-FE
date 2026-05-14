'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const IncidentReportLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.incidentReport}>
    {children}
  </StudentPermissionGuard>
);

export default IncidentReportLayout;
