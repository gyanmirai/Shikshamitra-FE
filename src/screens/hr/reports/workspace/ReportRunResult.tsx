import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { Box, Chip, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import {
  useGetReportingRunQuery,
  useGetReportingRowsQuery,
  useRetryReportingRunMutation,
  useCancelReportingRunMutation,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportResultTable } from './ReportResultTable';
import { useReportTableState } from '../hooks/useReportTableState';
import {
  reportError,
  displayReportValue,
  reportListPagination,
} from '../reporting-workspace-utils';

const Chart = dynamic(
  () => import('../components/HrReportChartPreview').then((m) => m.HrReportChartPreview),
  { ssr: false }
);
export function ReportRunResult({ id }: { id: string }) {
  const router = useRouter();
  const exportTable = useHrTableExport('hr-generated-report', { runId: id });
  const [poll, setPoll] = useState(true);
  const tableState = useReportTableState();
  const { query, updateQuery } = tableState;
  const { page: pageIndex, pageSize } = reportListPagination(query);
  const pagination = { page: pageIndex + 1, pageSize };
  const [error, setError] = useState('');
  const {
    data: run,
    error: loadError,
    isLoading,
  } = useGetReportingRunQuery(id, { pollingInterval: poll ? 2000 : 0 });
  const {
    currentData: page,
    isFetching,
    error: rowsError,
    refetch: refetchRows,
  } = useGetReportingRowsQuery(
    { id, ...pagination, criteria: tableState.criteria },
    { skip: run?.status !== 'Completed' || run.isExpired }
  );
  const [cancel] = useCancelReportingRunMutation();
  const [retry, retryState] = useRetryReportingRunMutation();
  useEffect(() => {
    if (run)
      setPoll(
        ['Queued', 'Running'].includes(run.status) ||
          run.excelStatus === 'Queued' ||
          run.pdfStatus === 'Queued'
      );
  }, [run]);
  if (loadError) return <Alert severity="error">{reportError(loadError)}</Alert>;
  if (isLoading || !run) return <LinearProgress aria-label="Loading generated report" />;
  return (
    <Stack spacing={2} sx={{ height: 1, minHeight: 0 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Typography variant="subtitle1">{run.name}</Typography>
        <Chip size="small" label={run.isExpired ? 'Expired' : run.status} />
        <Typography variant="caption" color="text.secondary">
          {run.rowCount.toLocaleString('en-IN')} rows ·{' '}
          {displayReportValue(run.capturedAt, 'datetime', run.parameters.timeZone)}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Period: {run.parameters.fromDate || 'Current records'}
        {run.parameters.toDate ? ` to ${run.parameters.toDate}` : ''}. Staff:{' '}
        {run.parameters.employeeIds.length || 'All authorized'}. Departments:{' '}
        {run.parameters.departments.join(', ') || 'All authorized'}.
      </Typography>
      {(error || run.errorMessage) && <Alert severity="error">{error || run.errorMessage}</Alert>}
      {run.warnings.map((warning) => (
        <Alert key={warning} severity="warning">
          {warning}
        </Alert>
      ))}
      {run.isExpired && (
        <HrNotice severity="info">
          This captured result has expired. Generate again to capture current data for the required
          period.
        </HrNotice>
      )}
      {['Queued', 'Running'].includes(run.status) && (
        <>
          <LinearProgress aria-label="Report generation in progress" />
          <Typography variant="body2" role="status">
            Preparing your report. You can return to the template library while it runs.
          </Typography>
          <Button
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            onClick={async () => {
              try {
                await cancel(id).unwrap();
              } catch (e) {
                setError(reportError(e));
              }
            }}
          >
            Cancel generation
          </Button>
        </>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {['Failed', 'Cancelled'].includes(run.status) && (
          <Button
            size="small"
            variant="contained"
            disabled={retryState.isLoading}
            onClick={async () => {
              try {
                const next = await retry(id).unwrap();
                router.push(hrReportPaths.result(next.id));
              } catch (e) {
                setError(reportError(e));
              }
            }}
          >
            Retry generation
          </Button>
        )}
        <Button
          size="small"
          color="inherit"
          onClick={() => router.push(hrReportPaths.generate(run.templateId))}
        >
          Generate again
        </Button>
      </Stack>
      {run.excelStatus === 'Failed' || run.pdfStatus === 'Failed' ? (
        <Alert severity="warning">
          A file could not be prepared. Retry it or use Excel for larger results. PDF supports up to
          10,000 rows.
        </Alert>
      ) : null}
      {run.chart && <Chart chart={run.chart} />}
      {!!Object.keys(run.totals).length && (
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ overflowX: 'auto', flexShrink: 0, py: 0.5 }}
          aria-label="Captured report totals"
        >
          {Object.entries(run.totals).map(([field, total]) => (
            <Typography key={field} variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Captured {run.columns.find((column) => column.id === field)?.label || field}:{' '}
              </Box>
              {displayReportValue(
                total,
                run.columns.find((column) => column.id === field)?.type || 'number'
              )}
            </Typography>
          ))}
        </Stack>
      )}
      {run.status === 'Completed' && !run.isExpired && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {rowsError ? (
            <Alert
              severity="error"
              action={
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => updateQuery({ search: '', filters: '', sorts: '', page: '0' })}
                  >
                    Reset table
                  </Button>
                  <Button size="small" disabled={isFetching} onClick={() => refetchRows()}>
                    Retry
                  </Button>
                </Stack>
              }
            >
              {reportError(rowsError)}
            </Alert>
          ) : (
            <ReportResultTable
              tableState={tableState}
              onExport={exportTable}
              columns={run.columns}
              rows={page?.rows || []}
              count={page?.totalCount ?? 0}
              loading={isFetching}
              {...pagination}
              onPage={(next, size) =>
                updateQuery({ page: String(next - 1), pageSize: String(size) })
              }
              timezone={run.parameters.timeZone}
            />
          )}
        </Box>
      )}
    </Stack>
  );
}
