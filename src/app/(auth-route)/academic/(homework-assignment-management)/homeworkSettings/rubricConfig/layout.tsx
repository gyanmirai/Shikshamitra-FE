import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RubricConfigLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.settings.rubricConfig}>
    {children}
  </StudentPermissionGuard>
);

export default RubricConfigLayout;
