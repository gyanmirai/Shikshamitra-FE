'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ContentLibraryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.contentLibrary}>
    {children}
  </StudentPermissionGuard>
);

export default ContentLibraryLayout;
