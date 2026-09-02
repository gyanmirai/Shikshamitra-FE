import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';

import type { GuidedWorkflowPermissions } from './types';

export function useGuidedSeatingPermissions(): GuidedWorkflowPermissions {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const base = academicPermissions.examination.seatAllocation;
  return {
    canAdd: hasGrantedPermission(permissions, `${base}.Add`),
    canAutoAllocate: hasGrantedPermission(permissions, `${base}.AutoAllocate`),
    canFinalize: hasGrantedPermission(permissions, `${base}.Finalize`),
    canPublish: hasGrantedPermission(permissions, `${base}.Publish`),
    canDelete: hasGrantedPermission(permissions, `${base}.Delete`),
  };
}
