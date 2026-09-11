import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import AdmissionReviewsScreen from 'src/screens/student/admissions/admission-reviews';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.reviews}>
      <AdmissionReviewsScreen />
    </StudentPermissionGuard>
  );
}
