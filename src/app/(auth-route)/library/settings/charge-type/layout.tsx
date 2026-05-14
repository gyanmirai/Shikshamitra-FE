'use client';

import { libraryPermissions } from 'src/constants/library-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ChargeCategoriesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={libraryPermissions.settings.chargeCategories}>
    {children}
  </StudentPermissionGuard>
);

export default ChargeCategoriesLayout;
