import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useAssessmentPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Assessments.${action}`);
  return {
    view: granted('View'),
    manageSessions: granted('ManageSessions'),
    book: granted('Book'),
    attendance: granted('RecordAttendance'),
    results: granted('RecordResults'),
    review: granted('Review'),
    waive: granted('Waive'),
  };
}
