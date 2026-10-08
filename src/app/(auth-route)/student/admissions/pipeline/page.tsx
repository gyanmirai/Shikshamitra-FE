import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import AdmissionInquiryPipelineScreen from 'src/screens/student/admissions/admission-inquiry-pipeline';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.applications}>
      <AdmissionInquiryPipelineScreen />
    </StudentPermissionGuard>
  );
}
