import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const StudentAdmissionsLayout = ({ children }: { children: React.ReactNode }) => {
  // TODO(admissions): Restore this guard for every environment after development roles are seeded.
  if (process.env.NODE_ENV !== 'production') return children;

  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.root}>
      {children}
    </StudentPermissionGuard>
  );
};

export default StudentAdmissionsLayout;
