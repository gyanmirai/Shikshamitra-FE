'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import AdmissionsSettingsWorkspace from 'src/screens/student/enrollment/setting/admissions-settings-workspace';

const AdmissionsSettingsPage = () => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings}>
    <AdmissionsSettingsWorkspace />
  </StudentPermissionGuard>
);

export default AdmissionsSettingsPage;
