import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

const offeringPermission = {
  add: 'Students.Admissions.Offerings.Add',
  delete: 'Students.Admissions.Offerings.Delete',
} as const;

export const getAdmissionOfferingPermissions = (granted: GrantedPermission[] | undefined) => {
  const canAdd = hasGrantedPermission(granted, offeringPermission.add);
  const canDelete = hasGrantedPermission(granted, offeringPermission.delete);

  return {
    create: canAdd,
    bulkCreate: canAdd,
    edit: canAdd,
    clone: canAdd,
    activate: canAdd,
    deactivate: canDelete,
    delete: canDelete,
  };
};
