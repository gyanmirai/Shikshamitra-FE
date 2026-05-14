'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const IncomeTrackingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.incomeTracking}>
    {children}
  </StudentPermissionGuard>
);

export default IncomeTrackingLayout;
