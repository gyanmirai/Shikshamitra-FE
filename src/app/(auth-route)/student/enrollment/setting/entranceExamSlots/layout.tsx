'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EntranceExamSlotsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.entranceExamSlots}>
    {children}
  </StudentPermissionGuard>
);

export default EntranceExamSlotsLayout;
