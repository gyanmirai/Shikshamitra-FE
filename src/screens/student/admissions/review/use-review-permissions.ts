import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useReviewPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Reviews.${action}`);
  return {
    view: granted('View'),
    edit: granted('Edit'),
    submit: granted('Submit'),
    assign: granted('Assign'),
    decide: granted('Decide'),
    reopen: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Reopen'),
  };
}
