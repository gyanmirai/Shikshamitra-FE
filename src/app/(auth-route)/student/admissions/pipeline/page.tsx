import AdmissionInquiryPipelineScreen from 'src/screens/student/admissions/admission-inquiry-pipeline';
import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.inquiries}>
      <AdmissionInquiryPipelineScreen />
    </StudentPermissionGuard>
  );
}
