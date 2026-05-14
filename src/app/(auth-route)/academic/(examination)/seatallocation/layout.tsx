'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const SeatAllocationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.seatAllocation}>
    {children}
  </StudentPermissionGuard>
);

export default SeatAllocationLayout;
