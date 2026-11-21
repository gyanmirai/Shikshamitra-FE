import type { IParams } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useGetHostTenantsQuery } from 'src/redux/host-tenants/host-tenant-api';

export function useTenantTable(enabled: boolean) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filter, setFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [sorting, setSorting] = useState('name asc');
  const status = columnFilters[0]?.value;
  const query = useGetHostTenantsQuery(
    {
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
      filter,
      sorting,
      ...(status === 'true' || status === 'false' ? { isActive: status === 'true' } : {}),
    },
    { skip: !enabled }
  );
  return {
    query,
    page,
    rowsPerPage,
    filter,
    columnFilters,
    sorting,
    applyColumnFilters: (filters: IParams['filters']) => {
      const statusFilters = filters.filter(
        ({ column, type, value }) =>
          column === 'isActive' && type === 'equals' && (value === 'true' || value === 'false')
      );
      setColumnFilters(statusFilters.slice(-1));
      setPage(0);
    },
    search: (value: string) => {
      setFilter(value);
      setPage(0);
    },
    paginate: (nextPage: number, size: number) => {
      setPage(nextPage - 1);
      setRowsPerPage(size);
    },
    sort: (column: string, orders: { column: string; direction: 'asc' | 'desc' }[]) => {
      setSorting(orders[0] ? `${orders[0].column} ${orders[0].direction}` : 'name asc');
      setPage(0);
    },
  };
}
