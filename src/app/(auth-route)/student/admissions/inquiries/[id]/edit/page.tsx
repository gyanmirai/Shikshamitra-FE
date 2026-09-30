import StudentPermissionGuard from 'src/components/student-permission-guard';
import { ADMISSION_INQUIRY_PERMISSIONS } from 'src/screens/student/admissions/inquiry-access';
import AdmissionInquiryEditPage from 'src/screens/student/admissions/admission-inquiry-edit-page';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={ADMISSION_INQUIRY_PERMISSIONS.manage}>
      <AdmissionInquiryEditPage />
    </StudentPermissionGuard>
  );
}
