import { studentPermissions } from 'src/constants/student-menu';
import HouseManagement from 'src/screens/student/house-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function Page() {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.records.houseManagement}>
      <HouseManagement workspace="catalogue" />
    </StudentPermissionGuard>
  );
}
