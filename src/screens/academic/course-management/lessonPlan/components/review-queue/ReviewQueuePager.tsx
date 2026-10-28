import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import TablePagination from '@mui/material/TablePagination';

export function ReviewQueuePager({ table }: { table: Partial<ICustomizableTableProps> }) {
  return <TablePagination component="div" count={table.totalCount ?? 0} page={table.page ?? 0}
    rowsPerPage={table.rowsPerPage ?? 25} rowsPerPageOptions={[10, 25, 50, 100]}
    onPageChange={(_event, page) => table.onServerPagination?.(page + 1, table.rowsPerPage ?? 25)}
    onRowsPerPageChange={event => table.onServerPagination?.(1, Number(event.target.value))} />;
}
