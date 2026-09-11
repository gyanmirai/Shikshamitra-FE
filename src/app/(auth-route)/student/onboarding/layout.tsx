import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const StudentOnboardingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.onboarding.root}>
    {children}
  </StudentPermissionGuard>
);

export default StudentOnboardingLayout;
