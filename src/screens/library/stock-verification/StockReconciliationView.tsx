import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StockLocation,
  StockReconciliationRow,
  StockReconciliationSource,
} from 'src/redux/library/stock-verification-api';

import { useMemo, useState } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useGetStockReconciliationQuery } from 'src/redux/library/stock-verification-api';

import { StockDecisionDialog } from './StockDecisionDialog';
import {
  stockFinding,
  stockCopyStatus,
  stockDecisionLabel,
  stockLocationLabel,
  stockFindingSources,
} from './stock-verification-labels';

export function StockReconciliationView({
  id,
  locations,
  isReviewing,
  canDecide,
}: {
  id: string;
  locations: readonly StockLocation[];
  isReviewing: boolean;
  canDecide: boolean;
}) {
  const [source, setSource] = useState<StockReconciliationSource>(1);
  const [page, setPage] = useState({ page: 1, pageSize: 20 });
  const [editing, setEditing] = useState<StockReconciliationRow>();
  const query = useGetStockReconciliationQuery(
    { id, source, ...page },
    { refetchOnMountOrArgChange: true }
  );
  const data = query.isError ? undefined : query.currentData;
  const columns = useMemo<IColumn[]>(() => {
    const base: IColumn[] = [
      { id: 'accessionNumber', label: 'Accession or barcode' },
      {
        id: 'finding',
        label: 'Finding',
        render: (value: number, row) =>
          row.requiresReview ? (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={stockFinding(value, row.receivedAfterOpening === true)}
            />
          ) : (
            stockFinding(value)
          ),
      },
      {
        id: 'observedSectionId',
        label: 'Observed location',
        render: (section: string | null, row) =>
          row.observationSequence
            ? stockLocationLabel(locations, section, row.observedShelfId, 'Not recorded')
            : 'No scan',
      },
    ];
    if (source === 1) {
      base.push(
        {
          id: 'expectedSectionId',
          label: 'Location at opening',
          render: (section: string | null, row) =>
            stockLocationLabel(locations, section, row.expectedShelfId, 'Unavailable'),
        },
        {
          id: 'currentStatus',
          label: 'Current copy status',
          render: (status: number | null) =>
            status == null ? 'Unavailable' : stockCopyStatus(status),
        }
      );
    }
    if (isReviewing) {
      base.push({
        id: 'decision',
        label: 'Decision',
        render: (_decision, record) => {
          const row = record as StockReconciliationRow;
          if (!row.requiresReview) return 'No decision required';
          const label =
            row.decision && row.decisionIsCurrent
              ? stockDecisionLabel(row.decision.outcome)
              : row.decision
                ? 'Evidence changed'
                : 'Awaiting decision';
          return (
            <Stack direction="row" useFlexGap flexWrap="wrap" alignItems="center" spacing={1}>
              <span>{label}</span>
              {canDecide && row.evidenceRevision && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditing(row)}
                  aria-label={`Record decision for ${row.accessionNumber}`}
                >
                  {row.decision ? 'Review decision' : 'Record decision'}
                </Button>
              )}
            </Stack>
          );
        },
      });
    }
    return base.map((column) => ({ ...column, isFilter: false, isSort: false }));
  }, [locations, source, isReviewing, canDecide]);

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
            const selection = stockFindingSources.find(
              (record) => record.id === Number(event.target.value)
            );
            if (!selection) return;
            setSource(selection.id);
            setPage((current) => ({ ...current, page: 1 }));
          }}
        >
          {stockFindingSources.map((record) => (
            <MenuItem key={record.id} value={record.id}>
              {record.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Live comparison with the copy register
        </Typography>
        <Button size="small" onClick={query.refetch} disabled={query.isFetching}>
          Refresh
        </Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId={`library-stock-reconciliation-${source}`}
          columns={columns}
          data={data?.items ?? []}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          isRefreshing={query.isFetching && Boolean(data)}
          error={query.isError ? 'Could not load reconciliation records.' : undefined}
          onRetry={query.refetch}
          noDataText={stockFindingSources.find((record) => record.id === source)?.empty}
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
      {isReviewing && canDecide && editing && (
        <StockDecisionDialog
          countId={id}
          source={source}
          initial={editing}
          onClose={() => setEditing(undefined)}
          readFinding={async () =>
            (await query.refetch().unwrap()).items.find((row) => row.id === editing.id)
          }
        />
      )}
    </Stack>
  );
}
