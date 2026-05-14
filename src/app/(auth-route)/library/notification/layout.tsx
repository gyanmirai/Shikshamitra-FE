'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LibraryNotificationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.notification}>
    {children}
  </StudentPermissionGuard>
);

export default LibraryNotificationLayout;
