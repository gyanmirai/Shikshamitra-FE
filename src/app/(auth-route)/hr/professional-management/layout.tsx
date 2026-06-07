'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ProfessionalManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard
    permissionKey={[hrPermissions.professionalManagement, hrPermissions.performanceManagement.view]}
  >
    {children}
  </StudentPermissionGuard>
);

export default ProfessionalManagementLayout;
