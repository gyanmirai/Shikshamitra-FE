import type { RootState } from 'src/redux/store';
import type { GrantedPermission } from 'src/utils/permissions';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function canAdvanceAssessmentApplications(permissions: GrantedPermission[] | undefined) {
  return (
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view) &&
    hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage)
  );
}

export function getAssessmentPermissions(permissions: GrantedPermission[] | undefined) {
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Assessments.${action}`);
  const canAddOrUpdate = granted('Add');
  return {
    view: granted('View'),
    manageSessions: canAddOrUpdate,
    book: canAddOrUpdate,
    attendance: canAddOrUpdate,
    results: canAddOrUpdate,
    review: canAddOrUpdate,
    waive: canAddOrUpdate,
  };
}

export function useAssessmentPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  return getAssessmentPermissions(permissions);
}
