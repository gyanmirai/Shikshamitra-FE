import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function useReviewPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Reviews.${action}`);
  const canWriteReview = granted('Add');
  return {
    view: granted('View'),
    edit: canWriteReview,
    submit: canWriteReview,
    assign: canWriteReview,
    decide: canWriteReview,
    reopen: hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage),
  };
}
