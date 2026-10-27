import { useState } from 'react';

import type { useRoomTable } from './useRoomTable';

export function useRoomTableControls(workspace: ReturnType<typeof useRoomTable>) {
  const [searchInput, setSearchInput] = useState('');
  const {
    roomsQuery,
    totalCount,
    page,
    size,
    sorts,
    filters,
    changePage,
    changeSearch,
    changeSort,
    changeFilters,
    clearFilters,
    search,
  } = workspace;
  return {
    totalCount,
    page,
    rowsPerPage: size,
    defaultRowsPerPage: 25,
    sorts,
    filters,
    serverSidePagination: true,
    serverSideSearch: true,
    serverSideSort: true,
    serverSideFilter: true,
    serverSideSortMode: 'single' as const,
    rowsPerPageOptions: [10, 25, 50, 100],
    paginationDisabled: roomsQuery.isFetching,
    searchTerm: searchInput,
    onSearchInputChange: setSearchInput,
    onServerPagination: (nextPage: number, rows: number) => changePage(nextPage - 1, rows),
    onServerSearch: (value: string) => {
      if (value !== search) changeSearch(value);
    },
    onServerSort: (_column: string, values: typeof sorts) => changeSort(values),
    onServerFilter: changeFilters,
    onClearCriteria: () => {
      setSearchInput('');
      clearFilters();
    },
  };
}
