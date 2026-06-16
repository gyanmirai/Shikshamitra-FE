import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EntranceExamLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.entranceExam}>
    {children}
  </StudentPermissionGuard>
);

export default EntranceExamLayout;
