import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { EnrollmentOverviewWorkspace } from 'src/screens/student/enrollment/admissions-crm/overview-workspace';

const EnrollmentOverviewPage = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.overview}>
    <EnrollmentOverviewWorkspace />
  </StudentPermissionGuard>
);

export default EnrollmentOverviewPage;
