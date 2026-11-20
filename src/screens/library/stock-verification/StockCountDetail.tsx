'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import { CustomTabs } from 'src/components/custom-tabs';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Chip, Alert, Stack, Button, Typography } from '@mui/material';
import {
  useGetStockCountQuery,
  useGetStockCountOptionsQuery,
  useGetStockCountBaselineQuery,
  useGetStockCountObservationsQuery,
} from 'src/redux/library/stock-verification-api';

import { RecordStockScan } from './RecordStockScan';
import { StockCountActions } from './StockCountActions';
import { StockApprovalDialog } from './StockApprovalDialog';
import { StockDecisionHistory } from './StockDecisionHistory';
import { StockReconciliationView } from './StockReconciliationView';
import { StockPublishedResultView } from './StockPublishedResultView';
import { useStockVerificationAccess } from './useStockVerificationAccess';
import { stockCopyStatus, stockCountStatus, stockLocationLabel } from './stock-verification-labels';

const baselineColumns: IColumn[] = [
  { id: 'accessionNumber', label: 'Accession' },
  {
    id: 'copyStatus',
    label: 'Status at opening',
    render: (status: number) => stockCopyStatus(status),
  },
].map((col) => ({ ...col, isFilter: false, isSort: false }));
const scanColumns: IColumn[] = [
  { id: 'sequence', label: 'Scan number' },
  { id: 'accessionNumber', label: 'Accession or barcode' },
  { id: 'schoolDate', label: 'School date', render: (date: string) => formatDateOnly(date) },
  {
    id: 'copyId',
    label: 'Match',
    render: (value: string | null) => (value ? 'Recognized copy' : 'Unknown accession'),
  },
].map((col) => ({ ...col, isFilter: false, isSort: false }));

export default function StockCountDetail({ id }: { id: string }) {
  const access = useStockVerificationAccess();
  const [selectedView, setView] = useState<
    'baseline' | 'scans' | 'reconciliation' | 'decisions' | 'result'
  >();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [page, setPage] = useState({ page: 1, pageSize: 20 });
  const detail = useGetStockCountQuery(id, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const session = access.canRead && !detail.isError ? detail.currentData : undefined;
  const canReconcile = session?.status === 1 || session?.status === 2;
  const canReadDecisions = Boolean(session && session.status !== 1);
  const canReadResult = session?.status === 3;
  const fallbackView = canReadResult ? 'result' : 'scans';
  const view =
    ((selectedView === 'reconciliation' && !canReconcile) ||
    (selectedView === 'decisions' && !canReadDecisions) ||
    (selectedView === 'result' && !canReadResult)
      ? fallbackView
      : selectedView) ?? fallbackView;
  const { currentData: options } = useGetStockCountOptionsQuery(undefined, {
    skip: !access.canRead,
  });
  const baseline = useGetStockCountBaselineQuery(
    { id, ...page },
    { skip: !session || view !== 'baseline' }
  );
  const observations = useGetStockCountObservationsQuery(
    { id, ...page },
    { skip: !session || view !== 'scans' }
  );
  const query = view === 'baseline' ? baseline : observations;
  const data = query.isError ? undefined : query.currentData;
  const columns = useMemo(() => {
    const locations = options?.sections ?? [];
    const location: IColumn =
      view === 'baseline'
        ? {
            id: 'sectionId',
            label: 'Location at opening',
            isFilter: false,
            isSort: false,
            render: (section: string, row) =>
              stockLocationLabel(locations, section, row.shelfId, 'Unknown location'),
          }
        : {
            id: 'observedSectionId',
            label: 'Observed location',
            isFilter: false,
            isSort: false,
            render: (section: string | null, row) =>
              stockLocationLabel(locations, section, row.observedShelfId, 'Unknown location'),
          };
    return [...(view === 'baseline' ? baselineColumns : scanColumns), location];
  }, [options?.sections, view]);

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={session?.name ?? 'Stock Count'}
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Stock Verification', href: libraryPaths.stockVerification },
          { name: session?.name ?? 'Stock Count' },
        ]}
        sx={{ px: 1 }}
      />
      {detail.isError && (
        <Alert severity="error" action={<Button onClick={detail.refetch}>Retry</Button>}>
          Could not load this count.
        </Alert>
      )}
      {session && (
        <>
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            spacing={2}
            alignItems="center"
            sx={{ px: 2, py: 1 }}
          >
            <Chip size="small" label={stockCountStatus(session.status)} />
            <Typography variant="body2">
              {stockLocationLabel(
                options?.sections ?? [],
                session.sectionId,
                session.shelfId,
                'Whole school'
              )}
            </Typography>
            <Typography variant="body2">
              School date {formatDateOnly(session.schoolDate)}
            </Typography>
            <Typography variant="body2">{session.expectedCopyCount} expected copies</Typography>
            <Typography variant="body2">{session.observationCount} scans recorded</Typography>
            {canReconcile && access.canRecord && (
              <StockCountActions session={session} readCurrent={() => detail.refetch().unwrap()} />
            )}
            {session.status === 2 && access.canApprove && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setApprovalOpen(true)}
                startIcon={<Iconify icon={GlobalIcons.prerequisites} />}
              >
                Approve count
              </Button>
            )}
          </Stack>
          {session.status === 4 && session.cancellationReason && (
            <Alert severity="info" sx={{ mx: 2, my: 1 }}>
              <Typography variant="subtitle2">Cancellation Reason</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {session.cancellationReason}
              </Typography>
            </Alert>
          )}
          {session.status === 1 && access.canRecord && <RecordStockScan id={id} />}
          <CustomTabs
            value={view}
            aria-label="Stock count records"
            onChange={(_event, value: typeof view) => {
              setView(value);
              setPage((current) => ({ ...current, page: 1 }));
            }}
          >
            <Tab
              value="scans"
              label="Scans"
              id="stock-count-scans-tab"
              aria-controls="stock-count-records-panel"
            />
            <Tab
              value="baseline"
              label="Expected copies"
              id="stock-count-baseline-tab"
              aria-controls="stock-count-records-panel"
            />
            {canReconcile && (
              <Tab
                value="reconciliation"
                label="Reconciliation"
                id="stock-count-reconciliation-tab"
                aria-controls="stock-count-records-panel"
              />
            )}
            {canReadDecisions && (
              <Tab
                value="decisions"
                label="Decision history"
                id="stock-count-decisions-tab"
                aria-controls="stock-count-records-panel"
              />
            )}
            {canReadResult && (
              <Tab
                value="result"
                label="Published result"
                id="stock-count-result-tab"
                aria-controls="stock-count-records-panel"
              />
            )}
          </CustomTabs>
        </>
      )}
      <Box
        role={session ? 'tabpanel' : undefined}
        aria-labelledby={session ? `stock-count-${view}-tab` : undefined}
        id="stock-count-records-panel"
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {view === 'reconciliation' && session ? (
          <StockReconciliationView
            id={id}
            locations={options?.sections ?? []}
            isReviewing={session.status === 2}
            canDecide={access.canRecord}
          />
        ) : view === 'result' ? (
          <StockPublishedResultView id={id} />
        ) : view === 'decisions' ? (
          <StockDecisionHistory id={id} />
        ) : (
          !detail.isError && (
            <CustomizableTable
              tableId={`library-stock-count-${view}`}
              columns={columns}
              data={data?.items || []}
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              isLoading={(detail.isFetching || query.isFetching) && !data}
              isRefreshing={query.isFetching && Boolean(data)}
              error={query.isError ? 'Could not load records for this count.' : undefined}
              onRetry={() => query.refetch()}
              noDataText={
                view === 'baseline'
                  ? 'There were no expected copies when this count opened.'
                  : 'No scans have been recorded for this count.'
              }
              isFilter={false}
              isSearch={false}
              showExport={false}
              serverSidePagination
              page={page.page - 1}
              rowsPerPage={page.pageSize}
              totalCount={data?.totalCount || 0}
              onServerPagination={(nextPage, pageSize) => setPage({ page: nextPage, pageSize })}
              maxServerRowsPerPage={100}
            />
          )
        )}
      </Box>
      {session?.status === 2 && access.canApprove && approvalOpen && (
        <StockApprovalDialog
          id={id}
          onClose={() => setApprovalOpen(false)}
          onViewFindings={() => {
            setApprovalOpen(false);
            setView('reconciliation');
          }}
          onApproved={() => {
            setApprovalOpen(false);
            setView('result');
          }}
        />
      )}
    </Box>
  );
}
