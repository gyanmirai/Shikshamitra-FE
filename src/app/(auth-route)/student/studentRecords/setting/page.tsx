import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function LegacyStudentRecordsHouseSettingsPage() {
  redirect(studentPaths.records.houseManagement);
}
