import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useEligibilityPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    hasGrantedPermission(permissions, `Students.Admissions.Eligibility.${action}`);
  return {
    view: granted('View'),
    evaluate: granted('Add'),
    requestException: granted('Add'),
    reviewException: granted('Add'),
  };
}
