import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import AdmissionAssessmentsScreen from 'src/screens/student/admissions/admission-assessments';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.assessments}>
      <AdmissionAssessmentsScreen />
    </StudentPermissionGuard>
  );
}
