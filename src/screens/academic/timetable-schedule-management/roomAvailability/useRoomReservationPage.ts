import type { IParams, ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useGetReservationPageQuery } from 'src/redux/academicAPI/timetableApi/roomAvailabilityApi';

import { roomReservationRead } from './roomReservationRead';
import { useRoomReservationExport } from './useRoomReservationExport';

const initialCriteria = { page: 1, pageSize: 10, search: '', filters: [] as IParams['filters'], sorts: [] as IParams['sorts'], statusGroup: 'all', searchColumns: undefined as string[] | undefined };

export function useRoomReservationPage(scope: { createdDate?: string; isApprovalView?: boolean }, skip: boolean) {
  const scopeKey = JSON.stringify(scope);
  const [state, setState] = useState({ scopeKey, ...initialCriteria });
  const criteria = state.scopeKey === scopeKey ? state : { scopeKey, ...initialCriteria };
  if (criteria !== state) setState(criteria);
  const change = (patch: Partial<typeof initialCriteria>) => setState(previous =>
    Object.entries(patch).every(([key, value]) => JSON.stringify(criteria[key as keyof typeof initialCriteria]) === JSON.stringify(value))
      ? previous : { ...criteria, page: 1, ...patch });
  const statusGroup = scope.isApprovalView ? 'pendingApproval' : criteria.statusGroup;
  const query = useGetReservationPageQuery({ ...scope, statusGroup, skipCount: (criteria.page - 1) * criteria.pageSize,
    maxResultCount: criteria.pageSize, searchTerm: criteria.search, searchColumns: criteria.searchColumns,
    filters: JSON.stringify(criteria.filters), sorting: criteria.sorts.map(sort => `${sort.column} ${sort.direction}`).join(',') }, { skip });
  const onExport = useRoomReservationExport({ ...scope, statusGroup, searchColumns: criteria.searchColumns });
  const tableProps: Partial<ICustomizableTableProps> = {
    serverSidePagination: true, serverSideSearch: true, serverSideSort: true, serverSideFilter: true,
    exportScope: 'all', maxServerRowsPerPage: 100, page: criteria.page - 1, rowsPerPage: criteria.pageSize, searchTerm: criteria.search,
    filters: criteria.filters, sorts: criteria.sorts, totalCount: query.currentData?.totalCount ?? 0,
    onServerPagination: (page, pageSize) => change({ page, pageSize: Math.min(100, Math.max(1, pageSize)) }), onServerSearch: search => change({ search }),
    onServerSort: (_column, sorts) => change({ sorts }), onServerFilter: filters => change({ filters }),
    onVisibleColumnsChange: searchColumns => change({ searchColumns, page: criteria.search ? 1 : criteria.page }), onClearCriteria: () => change({ search: '', filters: [] }), onExport,
    error: query.error, onRetry: query.refetch,
  };
  return { data: (query.currentData?.items ?? []).map(roomReservationRead), counts: query.currentData?.statusCounts ?? {},
    tableProps, status: criteria.statusGroup, setStatus: (value: string) => change({ statusGroup: value }),
    isLoading: query.isLoading || query.isFetching, isFetching: query.isFetching,
    error: query.isError ? 'Failed to load reservations.' : null, refetch: () => skip ? undefined : query.refetch() };
}
