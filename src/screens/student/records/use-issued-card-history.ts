import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetRecordIssuedIdsQuery } from 'src/redux/student/records/student-record-documents-api';
import { useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';

import { directoryScope } from './student-directory-scope';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

const issuedCardSortFields: Record<string, string> = {
  studentName: 'studentName',
  grNumber: 'grNumber',
  classDivision: 'standardName',
  number: 'cardNumber',
  date: 'issuedAt',
  status: 'status',
};

export function useIssuedCardHistory(enabled: boolean, academicYearId?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.toString();
  const [appliedYear, setAppliedYear] = useState(academicYearId);
  const yearChanged = Boolean(appliedYear && appliedYear !== academicYearId);
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId },
    { skip: !enabled || !academicYearId }
  );
  const scope = useMemo(
    () => directoryScope(new URLSearchParams(current), options.currentData),
    [current, options.currentData]
  );
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const requestedSort = params.get('sort') ?? 'issuedAt desc';
  const [sortField, direction] = requestedSort.split(' ');
  const sorting =
    requestedSort.split(' ').length === 2 &&
    Object.values(issuedCardSortFields).includes(sortField) &&
    ['asc', 'desc'].includes(direction)
      ? requestedSort
      : 'issuedAt desc';
  const update = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const url = recordsQueryUrl(pathname, current, {
        board: scope.board || undefined,
        medium: scope.medium || undefined,
        ...changes,
        view: 'issued',
        student: undefined,
      });
      if (url !== `${pathname}${current ? `?${current}` : ''}`) router.push(url, { scroll: false });
    },
    [pathname, current, router, scope.board, scope.medium]
  );
  useEffect(() => {
    if (!enabled || appliedYear === academicYearId) return;
    setAppliedYear(academicYearId);
    // Initial shell hydration restores a deep link; only an actual year change clears its scope.
    if (appliedYear)
      update({
        board: undefined,
        medium: undefined,
        class: undefined,
        division: undefined,
        page: 0,
      });
  }, [enabled, academicYearId, appliedYear, update]);
  const ready = Boolean(
    enabled &&
    academicYearId &&
    !yearChanged &&
    options.currentData &&
    !options.isError &&
    scope.ready
  );
  const query = useGetRecordIssuedIdsQuery(
    {
      academicYearId: academicYearId ?? '',
      boardId: scope.board,
      mediumId: scope.medium,
      standardId: scope.classes[0],
      divisionId: scope.divisions[0],
      search: search || undefined,
      sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !ready }
  );
  const tableProps: Partial<ICustomizableTableProps> = {
    serverSidePagination: true,
    serverSideSearch: true,
    serverSideSort: true,
    serverSideSortMode: 'single',
    page,
    rowsPerPage: pageSize,
    rowsPerPageOptions: [10, 25, 50, 100],
    totalCount: ready && !query.isError ? (query.currentData?.totalCount ?? 0) : 0,
    searchTerm: search,
    sorts: [
      {
        column:
          Object.entries(issuedCardSortFields).find(
            ([, field]) => field === sorting.split(' ')[0]
          )?.[0] ?? 'date',
        direction: sorting.endsWith('desc') ? 'desc' : 'asc',
      },
    ],
    onServerPagination: (nextPage, nextSize) =>
      update({
        page: nextSize === pageSize ? Math.max(0, nextPage - 1) : 0,
        pageSize: nextSize,
      }),
    onServerSearch: (value) => {
      if (value !== search) update({ search: value || undefined, page: 0 });
    },
    onServerSort: (_column, sorts) =>
      update({
        sort: sorts.length
          ? `${issuedCardSortFields[sorts[0].column]} ${sorts[0].direction}`
          : undefined,
        page: 0,
      }),
    searchFieldProps: {
      placeholder: 'Search student, GR or card number',
      inputProps: { 'aria-label': 'Search issued cards', maxLength: 150 },
    },
    exportScope: 'loaded',
    exportLabel: 'Export page',
    exportDisabled: !ready || query.isError || !query.currentData?.items.length,
  };
  return { options, scope, ready, query, page, pageSize, search, sorting, update, tableProps };
}
