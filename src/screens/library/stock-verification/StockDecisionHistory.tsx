import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetStockDecisionsQuery } from 'src/redux/library/stock-verification-api';

import { stockFinding, stockDecisionLabel } from './stock-verification-labels';

const columns: IColumn[] = [
  { id: 'accessionNumber', label: 'Accession or barcode' },
  { id: 'finding', label: 'Reviewed finding', render: (value: number) => stockFinding(value) },
  { id: 'outcome', label: 'Decision', render: (value: number) => stockDecisionLabel(value) },
  { id: 'reason', label: 'Reason' },
  { id: 'version', label: 'Version' },
  { id: 'decidedAt', label: 'Recorded at', render: (value: string) => fDateTime(value) },
].map((column) => ({ ...column, isFilter: false, isSort: false }));

export function StockDecisionHistory({ id }: { id: string }) {
  const [page, setPage] = useState({ page: 1, pageSize: 20 });
  const query = useGetStockDecisionsQuery({ id, ...page }, { refetchOnMountOrArgChange: true });
  const data = query.isError ? undefined : query.currentData;
  return (
    <CustomizableTable
      tableId="library-stock-decision-history"
      columns={columns}
      data={data?.items ?? []}
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      isLoading={query.isFetching && !data}
      isRefreshing={query.isFetching && Boolean(data)}
      error={query.isError ? 'Could not load the decision history.' : undefined}
      onRetry={query.refetch}
      noDataText="No decisions have been recorded."
      isFilter={false}
      isSearch={false}
      showExport={false}
      serverSidePagination
      page={page.page - 1}
      rowsPerPage={page.pageSize}
      totalCount={data?.totalCount ?? 0}
      onServerPagination={(nextPage, pageSize) => setPage({ page: nextPage, pageSize })}
      maxServerRowsPerPage={100}
    />
  );
}
