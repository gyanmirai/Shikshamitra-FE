'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AllBooksLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.allBooks}>
    {children}
  </StudentPermissionGuard>
);

export default AllBooksLayout;
