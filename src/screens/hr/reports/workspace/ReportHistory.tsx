import type { IColumn } from 'src/components/customizabaleTable/types';

import { RouterLink } from 'src/routes/components';
import { useMemo, useState, useEffect } from 'react';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Button, LinearProgress } from '@mui/material';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useGetReportingRunsQuery } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useReportTableState } from '../hooks/useReportTableState';
import { displayReportValue, reportListPagination } from '../reporting-workspace-utils';

export function ReportHistory() {
  const tableState = useReportTableState();
  const { query, updateQuery } = tableState;
  const { page, pageSize } = reportListPagination(query);
  const skip = page * pageSize;
  const exportTable = useHrTableExport('hr-generated-report-history', {});
  const [active, setActive] = useState(true);
  const {
    currentData: history,
    error,
    isFetching,
    refetch,
  } = useGetReportingRunsQuery(
    { skip, take: pageSize, criteria: tableState.criteria },
    { pollingInterval: active ? 5000 : 0, skipPollingIfUnfocused: true }
  );
  const data = useMemo(() => history?.items || [], [history?.items]);
  useEffect(() => {
    setActive(data.some((run) => ['Queued', 'Running'].includes(run.status)));
  }, [data]);
  const columns = useMemo<IColumn[]>(
    () => [
      {
        filterType: 'string',
        id: 'name',
        label: 'Report',
        minWidth: '220px',
        sticky: true,
        stickyOnMobile: false,
        render: (value, row) => (
          <Box
            component={RouterLink}
            href={hrReportPaths.result(row.id)}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {value}
          </Box>
        ),
      },
      {
        id: 'status',
        filterType: 'enum',
        enumOptions: ['Queued', 'Running', 'Completed', 'Failed', 'Cancelled', 'Expired'].map(
          (value) => ({ label: value, value })
        ),
        label: 'Status',
        minWidth: '120px',
        render: (_: unknown, row: any) => (
          <Chip size="small" variant="outlined" label={row.isExpired ? 'Expired' : row.status} />
        ),
      },
      { filterType: 'string', id: 'period', label: 'Reporting period', minWidth: '210px' },
      {
        id: 'capturedAt',
        filterType: 'dateTime',
        valueType: 'datetime',
        label: 'Generated',
        minWidth: '180px',
        render: (v: string, row: any) => displayReportValue(v, 'datetime', row.parameters.timeZone),
      },
      {
        id: 'rowCount',
        label: 'Rows',
        minWidth: '100px',
        filterType: 'number',
        valueType: 'number',
        align: 'right',
      },
      {
        id: 'action',
        isSort: false,
        isFilter: false,
        label: 'Action',
        minWidth: '130px',
        sticky: true,
        stickyPosition: 'right' as const,
        stickyOnMobile: false,
        excludeFromExport: true,
        render: (_: unknown, row: any) => (
          <Button
            size="small"
            sx={{ whiteSpace: 'nowrap' }}
            variant="outlined"
            component={RouterLink}
            href={hrReportPaths.result(row.id)}
            aria-label={`Open report ${row.name}`}
          >
            Open report
          </Button>
        ),
      },
    ],
    []
  );
  return (
    <Stack spacing={1} sx={{ height: 1, minHeight: 0 }}>
      {isFetching && data.length > 0 && <LinearProgress aria-label="Refreshing reports" />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          showColumns
          showExport
          showFullScreen
          exportScope="all"
          tableId="hr-generated-report-history"
          tableTitle="Reports"
          error={error}
          onRetry={() => refetch()}
          onExport={exportTable}
          columns={columns}
          data={data.map((run) => ({
            ...run,
            period: run.parameters.fromDate
              ? `${run.parameters.fromDate} to ${run.parameters.toDate}`
              : 'Current records',
          }))}
          isLoading={isFetching && !data.length}
          serverSidePagination
          paginationMode="unknown"
          hasNextPage={history?.hasMore ?? false}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onServerPagination={(nextPage, size) => {
            updateQuery({ page: String(nextPage - 1), pageSize: String(size) });
          }}
          {...tableState}
          serverSideSearch
          serverSideSort
          serverSideFilter
          searchFieldProps={{
            placeholder: 'Search reports',
            inputProps: { 'aria-label': 'Search reports' },
          }}
          noDataText={
            tableState.searchTerm || tableState.filters.length ? (
              'No reports match your search and filters.'
            ) : history?.hasMore || skip > 0 ? (
              'No reports available on this page with your current access.'
            ) : (
              <>
                <Box component="span" sx={{ display: 'block' }}>
                  No reports generated yet
                </Box>
                <Button
                  component={RouterLink}
                  href={hrReportPaths.choose}
                  size="small"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Generate report
                </Button>
              </>
            )
          }
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
    </Stack>
  );
}
