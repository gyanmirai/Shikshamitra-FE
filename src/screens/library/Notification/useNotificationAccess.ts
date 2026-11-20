import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useNotificationAccess() {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.Notification.View');
  return {
    canView,
    canAct: canView && hasGrantedPermission(permissions, 'Library.Notification.Add'),
  };
}
