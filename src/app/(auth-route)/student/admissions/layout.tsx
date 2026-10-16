import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const StudentAdmissionsLayout = ({ children }: { children: React.ReactNode }) => (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.root}>
      {children}
    </StudentPermissionGuard>
  );

export default StudentAdmissionsLayout;
