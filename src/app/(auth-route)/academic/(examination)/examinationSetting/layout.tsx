'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ExaminationSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default ExaminationSettingLayout;
