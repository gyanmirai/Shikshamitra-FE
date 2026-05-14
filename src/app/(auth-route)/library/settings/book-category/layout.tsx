'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const BookCategoriesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.settings.bookCategories}>
    {children}
  </StudentPermissionGuard>
);

export default BookCategoriesLayout;
