import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

import RecordsSettings from './records-settings';

import type { RecordsSettingsTask } from './records-settings-model';

export default function RecordsPolicySettingsRoute({ task }: { task: RecordsSettingsTask }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.records.setting}>
      <RecordsSettings task={task} />
    </StudentPermissionGuard>
  );
}
