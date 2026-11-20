import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useReservationAccess() {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canRead = hasGrantedPermission(permissions, 'Library.AllBooks.View');
  return {
    academicYearId: currentYear?.id || '',
    canRead,
    canWrite: canRead && hasGrantedPermission(permissions, 'Library.IssueReturn.Reserve'),
  };
}
