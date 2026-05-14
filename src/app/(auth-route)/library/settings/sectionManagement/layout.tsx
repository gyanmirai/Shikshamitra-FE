'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LibrarySectionLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.settings.sectionManagement}>
    {children}
  </StudentPermissionGuard>
);

export default LibrarySectionLayout;
