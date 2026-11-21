import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useMemberRecordPage(memberId?: string) {
  const permissions = useSelector((state: RootState) => state.auth?.permissions);
  const canView = hasGrantedPermission(permissions, 'Library.LibraryMembers.View');
  const [selection, setSelection] = useState({ memberId, page: 1, pageSize: 20 });
  const current =
    selection.memberId === memberId
      ? selection
      : { memberId, page: 1, pageSize: selection.pageSize };
  return {
    canView,
    page: current.page,
    pageSize: current.pageSize,
    args: { memberId: memberId || '', page: current.page, pageSize: current.pageSize },
    skip: !memberId || !canView,
    onPage: (page: number, pageSize: number) => setSelection({ memberId, page, pageSize }),
  };
}
