import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { guardStudentNavigation } from 'src/hooks/academic-context-change';
import { useGetLibraryLoanPageQuery } from 'src/redux/library/circulation-read-api';

import { loanAsOfDate, invalidLoanAsOf } from './loan-read-query';

export function useIssueReturnPage() {
  const permissions = useSelector((state: RootState) => state.auth?.permissions);
  const canView = hasGrantedPermission(permissions, 'Library.IssueReturn.View');
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const academicYearId = params.get('year') || '';
  const requestedAsOfDate = params.get('asOfDate') || '';
  const asOfDate = loanAsOfDate(requestedAsOfDate);
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const size = Number(params.get('pageSize'));
  const pageSize = [10, 20, 50, 100].includes(size) ? size : 20;
  const query = useGetLibraryLoanPageQuery(
    {
      academicYearId: academicYearId || undefined,
      asOfDate: asOfDate || undefined,
      page,
      pageSize,
    },
    { skip: !canView || asOfDate === null, refetchOnMountOrArgChange: true }
  );
  const navigate = (nextParams: URLSearchParams) => {
    const proceed = () => router.replace(`${pathname}?${nextParams}`, { scroll: false });
    if (!guardStudentNavigation(proceed)) proceed();
  };
  return {
    ...query,
    canView,
    academicYearId,
    requestedAsOfDate,
    page,
    pageSize,
    invalidAsOf: asOfDate === null,
    currentData: canView && asOfDate !== null && !query.isError ? query.currentData : undefined,
    error: asOfDate === null ? invalidLoanAsOf : query.error,
    onPage: (next: number, nextSize: number) => {
      const nextParams = new URLSearchParams(params.toString());
      nextParams.set('page', String(next));
      nextParams.set('pageSize', String(nextSize));
      navigate(nextParams);
    },
    onFilters: (year: string, date: string) => {
      const nextParams = new URLSearchParams(params.toString());
      if (year) nextParams.set('year', year);
      else nextParams.delete('year');
      if (date) nextParams.set('asOfDate', date);
      else nextParams.delete('asOfDate');
      nextParams.set('page', '1');
      navigate(nextParams);
    },
  };
}
