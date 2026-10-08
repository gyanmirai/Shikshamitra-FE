import { useState } from 'react';
import { useGetHostTenantsQuery } from 'src/redux/host-tenants/host-tenant-api';

export function useTenantTable(enabled: boolean) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('all');
  const [sorting, setSorting] = useState('name asc');
  const query = useGetHostTenantsQuery(
    {
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
      filter,
      sorting,
      ...(status === 'all' ? {} : { isActive: status === 'active' }),
    },
    { skip: !enabled }
  );
  return {
    query,
    page,
    rowsPerPage,
    filter,
    status,
    sorting,
    changeStatus: (value: string) => {
      setStatus(value);
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
