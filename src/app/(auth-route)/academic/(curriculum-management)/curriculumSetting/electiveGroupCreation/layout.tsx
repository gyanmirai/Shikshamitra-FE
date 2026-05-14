'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ElectiveGroupCreationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard
    permissionKey={academicPermissions.curriculum.settings.electiveGroupCreation}
  >
    {children}
  </StudentPermissionGuard>
);

export default ElectiveGroupCreationLayout;
