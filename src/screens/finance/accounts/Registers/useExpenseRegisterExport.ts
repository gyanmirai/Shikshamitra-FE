import type { AppDispatch } from 'src/redux/store';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type {
  AccountsActivityRow,
  AccountsActivityQuery,
} from 'src/redux/finance/accountsActivityApi';

import { useDispatch } from 'react-redux';
import { accountsActivityApi } from 'src/redux/finance/accountsActivityApi';
import { exportTable } from 'src/components/customizabaleTable/table-export';

import { toRegisterTableRow } from './registerTablePresentation';

const exportPageSize = 100;
const maxRegisterPages = 1000;

export function useExpenseRegisterExport(query: AccountsActivityQuery, context: string[]) {
  const dispatch = useDispatch<AppDispatch>();

  return async ({ format, columns, signal }: TableExportRequest) => {
    const rows: AccountsActivityRow[] = [];
    const recordIds = new Set<string>();
    let expectedCount: number | undefined;
    for (let page = 1; ; page += 1) {
      signal?.throwIfAborted();
      const request = dispatch(
        accountsActivityApi.endpoints.getAccountsActivity.initiate(
          { ...query, page, pageSize: exportPageSize },
          { subscribe: false, forceRefetch: true }
        )
      );
      const abort = () => request.abort();
      signal?.addEventListener('abort', abort, { once: true });
      let result;
      try {
        // Read successive pages using the same filters and verify each server count.
        // eslint-disable-next-line no-await-in-loop
        result = await request.unwrap();
      } finally {
        signal?.removeEventListener('abort', abort);
        request.unsubscribe();
      }
      signal?.throwIfAborted();
      expectedCount ??= result.totalCount;
      if (expectedCount > exportPageSize * maxRegisterPages) {
        throw new Error('Narrow the expense filters to export 100,000 rows or fewer.');
      }
      if (format === 'pdf' && (expectedCount > 10000 || expectedCount * columns.length > 200000)) {
        throw new Error(
          'PDF supports up to 10,000 rows and 200,000 cells. Use Excel or narrow the filters.'
        );
      }
      if (
        result.totalCount !== expectedCount ||
        rows.length + result.items.length > expectedCount
      ) {
        throw new Error('Expenses changed during export. Refresh and try again.');
      }
      result.items.forEach((row) => {
        if (recordIds.has(row.id)) {
          throw new Error('Expenses changed during export. Refresh and try again.');
        }
        recordIds.add(row.id);
        rows.push(row);
      });
      if (rows.length === expectedCount) break;
      if (!result.items.length || page === maxRegisterPages) {
        throw new Error('The complete expense export could not be loaded. Please try again.');
      }
    }

    await exportTable({
      format,
      columns,
      columnVisibility: Object.fromEntries(columns.map((column) => [column.id, true])),
      rows: rows.map(toRegisterTableRow),
      tableTitle: 'Expenses',
      context,
      beforeDownload: () => signal?.throwIfAborted(),
    });
  };
}
