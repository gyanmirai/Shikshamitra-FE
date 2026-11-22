import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import StudentICardTemplates from 'src/screens/student/records/student-icard-templates';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.records.studentICard}>
      <StudentICardTemplates />
    </StudentPermissionGuard>
  );
}
