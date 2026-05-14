'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LibraryMembersLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.members}>
    {children}
  </StudentPermissionGuard>
);

export default LibraryMembersLayout;
