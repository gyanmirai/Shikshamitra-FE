'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ConcessionTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.concessionType}>
    {children}
  </StudentPermissionGuard>
);

export default ConcessionTypeLayout;
