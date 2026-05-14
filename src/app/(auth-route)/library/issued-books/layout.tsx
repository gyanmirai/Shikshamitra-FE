'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const IssuedBooksLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.issueReturn}>
    {children}
  </StudentPermissionGuard>
);

export default IssuedBooksLayout;
