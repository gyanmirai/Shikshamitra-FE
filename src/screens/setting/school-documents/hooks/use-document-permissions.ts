import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

import { schoolDocumentActions } from '../types';

import type { DocumentPermissions } from '../types';

export function useDocumentPermissions(): DocumentPermissions {
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const canView =
    permissionsInitialized && hasGrantedPermission(permissions, schoolDocumentActions.view);
  return {
    ready: permissionsInitialized,
    canView,
    canAdd: canView && hasGrantedPermission(permissions, schoolDocumentActions.add),
    canDelete: canView && hasGrantedPermission(permissions, schoolDocumentActions.delete),
  };
}
