import type { RootState } from 'src/redux/store';

import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetLibraryBookEditorOptionsQuery } from 'src/redux/library/book-editor-api';

import { BookEditorOptionsContext } from './book-editor-options-context';

export function useBookEditorOptions() {
  const snapshot = useContext(BookEditorOptionsContext);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = snapshot?.academicYearId || (currentYear as { id?: string })?.id || '';
  const canRead =
    hasGrantedPermission(permissions, 'Library.AllBooks.View') &&
    (hasGrantedPermission(permissions, 'Library.AllBooks.Add') ||
      hasGrantedPermission(permissions, 'Library.AllBooks.Update'));
  const query = useGetLibraryBookEditorOptionsQuery(
    { academicYearId },
    { skip: Boolean(snapshot) || !academicYearId || !canRead, refetchOnMountOrArgChange: true }
  );
  return {
    ...query,
    ...(snapshot
      ? {
          currentData: snapshot.options,
          isFetching: false,
          isError: false,
          refetch: snapshot.refresh,
        }
      : {}),
    academicYearId,
    canRead,
  };
}
