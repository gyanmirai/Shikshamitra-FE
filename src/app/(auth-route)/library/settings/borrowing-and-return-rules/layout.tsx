'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const BorrowingRulesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.settings.borrowingRules}>
    {children}
  </StudentPermissionGuard>
);

export default BorrowingRulesLayout;
