import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.applications}>
      {children}
    </StudentPermissionGuard>
  );
}
