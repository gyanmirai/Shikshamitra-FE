import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type {
  StockDecision,
  StockReconciliationSource,
} from 'src/redux/library/stock-verification-api';

import { useState } from 'react';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, MenuItem, TextField, Typography } from '@mui/material';
import { useGetStockPublishedResultQuery } from 'src/redux/library/stock-verification-api';

import {
  stockFinding,
  stockCopyStatus,
  stockDecisionLabel,
  stockFindingSources,
} from './stock-verification-labels';

const columns: IColumn[] = [
  { id: 'accessionNumber', label: 'Accession or barcode' },
  {
    id: 'finding',
    label: 'Published finding',
    render: (value: number, row: IData) => stockFinding(value, row.receivedAfterOpening === true),
  },
  {
    id: 'currentStatus',
    label: 'Status at approval',
    render: (value: number | null) => (value == null ? 'Unavailable' : stockCopyStatus(value)),
  },
  { id: 'expectedLocation', label: 'Expected location' },
  { id: 'observedLocation', label: 'Observed location' },
  {
    id: 'decision',
    label: 'Decision',
    render: (decision: StockDecision | null) =>
      decision ? (
        <Stack
          spacing={0.5}
          sx={{ py: 0.5, minWidth: 180, whiteSpace: 'normal', overflowWrap: 'anywhere' }}
        >
          <Typography variant="body2">{stockDecisionLabel(decision.outcome)}</Typography>
          <Typography variant="caption">{decision.reason}</Typography>
        </Stack>
      ) : (
        'No decision required'
      ),
  },
].map((column) => ({ ...column, isFilter: false, isSort: false }));

export function StockPublishedResultView({ id }: { id: string }) {
  const [source, setSource] = useState<StockReconciliationSource>(1);
  const [page, setPage] = useState({ page: 1, pageSize: 20 });
  const query = useGetStockPublishedResultQuery({ id, source, ...page });
  const result = query.isError ? undefined : query.currentData;
  const data = result?.findings;
  const noPublication = query.error && 'status' in query.error && query.error.status === 409;

  return (
    <Stack sx={{ height: 1, minHeight: 0 }}>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={2}
        alignItems="center"
        sx={{ px: 2, py: 1.5 }}
      >
        <TextField
          select
          label="Records"
          size="small"
          value={source}
          sx={{ minWidth: 190 }}
          onChange={(event) => {
            const selected = stockFindingSources.find(
              (row) => row.id === Number(event.target.value)
            );
            if (!selected) return;
            setSource(selected.id);
            setPage((current) => ({ ...current, page: 1 }));
          }}
        >
          {stockFindingSources.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.label}
            </MenuItem>
          ))}
        </TextField>
        {result && (
          <>
            <Typography variant="body2">Approved {fDateTime(result.publishedAt)}</Typography>
            <Typography variant="body2">{result.findingCount} findings</Typography>
            <Typography variant="body2">{result.discrepancyCount} flagged findings</Typography>
          </>
        )}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId={`library-stock-result-${source}`}
          columns={columns}
          data={data?.items ?? []}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          error={
            query.isError && !noPublication ? 'Could not load the published result.' : undefined
          }
          onRetry={query.refetch}
          noDataText={
            noPublication
              ? 'This count has no published findings.'
              : stockFindingSources.find((row) => row.id === source)?.empty
          }
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
      </Box>
    </Stack>
  );
}
