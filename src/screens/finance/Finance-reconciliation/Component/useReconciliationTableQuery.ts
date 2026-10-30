import type { IParams } from 'src/components/customizabaleTable/types';
import type { GetReconciliationListParams } from 'src/types/finance/reconciliation';

import { useState, useEffect } from 'react';
import { ReconciliationStatusType } from 'src/enums/reconciliation-status-type';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

const FILTERABLE_METHOD_NAMES = ['Cheque', 'DemandDraft', 'BankTransfer', 'CreditCard', 'DebitCard', 'UPI'] as const;
const FILTERABLE_METHODS = new Set(
  FILTERABLE_METHOD_NAMES.flatMap((method) => [method, String(ReconciliationStatusType[method])])
);

/** Keep the complete server query synchronized with each payment-method table. */
export function useReconciliationTableQuery(queryParams?: GetReconciliationListParams) {
  const scope = JSON.stringify(queryParams ?? {});
  const supportsColumnFilters = FILTERABLE_METHODS.has(String(queryParams?.paymentMethod ?? ''));
  const [state, setState] = useState({ scope, page: 0, pageSize: 10, search: '', filters: [] as IParams['filters'] });
  const page = state.scope === scope ? state.page : 0;
  useEffect(() => {
    setState((previous) => (previous.scope === scope ? previous : { ...previous, scope, page: 0 }));
  }, [scope]);
  return {
    params: queryParams
      ? {
          ...queryParams,
          page: page + 1,
          pageSize: state.pageSize,
          search: state.search || undefined,
          filters: supportsColumnFilters ? serializeFinanceTableFilters(state.filters) : undefined,
        }
      : undefined,
    tableProps: {
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideFilter: supportsColumnFilters,
      isFilter: supportsColumnFilters,
      filters: supportsColumnFilters ? state.filters : [],
      showColumns: true,
      showExport: true,
      showFullScreen: true,
      page,
      rowsPerPage: state.pageSize,
      searchTerm: state.search,
      maxServerRowsPerPage: 100,
      exportLabel: 'Export current page',
      searchFieldProps: { placeholder: 'Receipt number, student name or GR number' },
      onServerPagination: (nextPage: number, pageSize: number) =>
        setState((previous) => ({ ...previous, scope, page: nextPage - 1, pageSize })),
      onServerSearch: (search: string) =>
        setState((previous) => ({ ...previous, scope, page: 0, search })),
      ...(supportsColumnFilters ? {
        onServerFilter: (filters: IParams['filters']) =>
          setState((previous) => ({ ...previous, scope, page: 0, filters })),
      } : {}),
    },
  };
}
