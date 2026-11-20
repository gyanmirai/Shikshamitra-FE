import type { IParams } from 'src/components/customizabaleTable/types';

import { useState, useEffect } from 'react';

export function useIdentityTableState(defaultSorting: string) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const sorting = sorts.length
    ? `${sorts.map((sort) => `${sort.column} ${sort.direction}`).join(',')},id`
    : defaultSorting;

  const onServerPagination = (nextPage: number, size: number) => {
    setPage(nextPage - 1);
    setRowsPerPage(size);
  };
  const onServerSearch = (value: string) => {
    const next = value.trim();
    if (next !== searchTerm) {
      setPage(0);
      setSearchTerm(next);
    }
  };
  const onServerSort = (_column: string, nextSorts: IParams['sorts']) => {
    setPage(0);
    setSorts(nextSorts);
  };

  return {
    params: {
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
      filter: searchTerm,
      sorting,
    },
    tableProps: {
      page,
      rowsPerPage,
      sorts,
      onServerPagination,
      onServerSearch,
      onSearchInputChange: () => setPage(0),
      onServerSort,
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideSort: true,
      maxServerRowsPerPage: 1000,
    },
    setPage,
  };
}

export function useIdentityPageBounds(
  totalCount: number | undefined,
  page: number,
  rowsPerPage: number,
  setPage: (page: number) => void
) {
  useEffect(() => {
    if (totalCount === undefined) return;
    const lastPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [totalCount, page, rowsPerPage, setPage]);
}
