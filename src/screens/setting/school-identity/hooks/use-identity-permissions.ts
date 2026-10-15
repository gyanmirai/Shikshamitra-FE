import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

import { schoolIdentityActions } from '../types';

export function useIdentityPermissions() {
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  return {
    ready: permissionsInitialized,
    canView: hasGrantedPermission(permissions, schoolIdentityActions.view),
    canManageDefaults: hasGrantedPermission(permissions, schoolIdentityActions.manageDefaults),
    canManageOverrides: hasGrantedPermission(permissions, schoolIdentityActions.manageOverrides),
    canAccessSignature: hasGrantedPermission(permissions, schoolIdentityActions.accessSignature),
  };
}
