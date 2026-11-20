import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetLibraryCopyHistoryQuery } from 'src/redux/library/copy-history-api';

import { loanAsOfDate, invalidLoanAsOf } from './loan-read-query';

export function useCopyHistory(bookId: string, copyId: string) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.IssueReturn.View');
  const identity = `${bookId}/${copyId}`;
  const [selection, setSelection] = useState({
    identity,
    page: 1,
    pageSize: 20,
    academicYearId: '',
    asOfDate: '',
  });
  const current =
    selection.identity === identity
      ? selection
      : { identity, page: 1, pageSize: selection.pageSize, academicYearId: '', asOfDate: '' };
  const date = loanAsOfDate(current.asOfDate);
  const query = useGetLibraryCopyHistoryQuery(
    {
      bookId,
      copyId,
      page: current.page,
      pageSize: current.pageSize,
      academicYearId: current.academicYearId || undefined,
      asOfDate: date || undefined,
    },
    { skip: !canView || !bookId || !copyId || date === null, refetchOnMountOrArgChange: true }
  );
  return {
    ...query,
    canView,
    page: current.page,
    pageSize: current.pageSize,
    academicYearId: current.academicYearId,
    requestedAsOfDate: current.asOfDate,
    invalidAsOf: date === null,
    error: date === null ? invalidLoanAsOf : query.error,
    currentData: canView && date !== null && !query.isError ? query.currentData : undefined,
    onPage: (page: number, pageSize: number) => setSelection({ ...current, page, pageSize }),
    onFilters: (academicYearId: string, asOfDate: string) =>
      setSelection({ ...current, page: 1, academicYearId, asOfDate }),
  };
}
