'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LibrarySettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default LibrarySettingsLayout;
