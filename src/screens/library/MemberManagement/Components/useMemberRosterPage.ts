import type { RootState } from 'src/redux/store';
import type { LibraryPaginatedList } from 'src/redux/library/library-adapters';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';
import { useGetLibraryMembersQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { useSettledText } from '../../circulation/useSettledText';

import type { IMember } from './type';

export function useMemberRosterPage() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Library.LibraryMembers.View');
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedSize = Number(params.get('pageSize'));
  const pageSize = [10, 20, 50, 100].includes(requestedSize) ? requestedSize : 10;
  const search = params.get('search') || '';
  const settledSearch = useSettledText(search);
  const settling = search.trim() !== settledSearch;
  const query = useGetLibraryMembersQuery(
    {
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
      search: settledSearch || undefined,
    },
    { skip: !canView || settling, refetchOnMountOrArgChange: true }
  );
  const currentData: LibraryPaginatedList<IMember> | undefined =
    canView && !settling && !query.isError ? query.currentData : undefined;
  const navigate = (next: URLSearchParams) => {
    if (next.toString() === params.toString()) return;
    const proceed = () => router.replace(`${pathname}?${next}`, { scroll: false });
    if (!guardAcademicContextChange(proceed)) proceed();
  };
  return {
    canView,
    page,
    pageSize,
    search,
    currentData,
    loading: settling || (query.isFetching && !currentData),
    refreshing: query.isFetching && Boolean(currentData),
    error: canView && !settling && query.isError ? query.error : undefined,
    retry: () => query.refetch(),
    paginationDisabled: settling || query.isFetching,
    onPage: (nextPage: number, nextSize: number) => {
      const next = new URLSearchParams(params.toString());
      next.set('page', String(nextPage));
      next.set('pageSize', String(nextSize));
      navigate(next);
    },
    onSearch: (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set('search', value);
      else next.delete('search');
      next.set('page', '1');
      navigate(next);
    },
  };
}
