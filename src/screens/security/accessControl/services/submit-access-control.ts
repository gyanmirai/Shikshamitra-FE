import type { Board } from 'src/types/school';
import type { AccessSelection } from 'src/utils/academicHierarchyUtils';
import type { BulkUserScopeAssignmentPayload } from 'src/utils/userScopeBulkAssignPayload';

import { buildUserScopeBulkAssignPayload } from 'src/utils/userScopeBulkAssignPayload';

export const submitAccessControlForm = async ({
  addAccessControl,
  userId,
  currentYearId,
  checkedItem,
  allBoards,
  handleClose,
}: {
  addAccessControl: (body: BulkUserScopeAssignmentPayload) => { unwrap: () => Promise<unknown> };
  userId?: string;
  currentYearId?: string;
  checkedItem: AccessSelection;
  allBoards?: Board[];
  handleClose?: () => void;
}) => {
  if (!userId || !currentYearId || !allBoards?.length) return false;

  await addAccessControl(
    buildUserScopeBulkAssignPayload({
      academicYearId: currentYearId,
      userIds: [userId],
      selection: checkedItem,
      allBoards,
    })
  ).unwrap();
  handleClose?.();
  return true;
};
