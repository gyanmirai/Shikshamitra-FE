'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const VendorConfigLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.settings.vendor}>
    {children}
  </StudentPermissionGuard>
);

export default VendorConfigLayout;
