import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetLibraryCopyEventsQuery } from 'src/redux/library/copy-lifecycle-api';

export function useCopyEvents(bookId: string, copyId: string) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.AllBooks.View');
  const identity = `${bookId}:${copyId}`;
  const [paging, setPaging] = useState({ identity, page: 1, pageSize: 20 });
  const page = paging.identity === identity ? paging.page : 1;
  const query = useGetLibraryCopyEventsQuery(
    { bookId, copyId, page, pageSize: paging.pageSize },
    { skip: !canView || !bookId || !copyId, refetchOnMountOrArgChange: true }
  );
  return {
    ...query,
    canView,
    page,
    pageSize: paging.pageSize,
    onPage: (next: number, pageSize: number) => setPaging({ identity, page: next, pageSize }),
  };
}
