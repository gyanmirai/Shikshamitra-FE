import { useRouter } from 'src/routes/hooks';
import { useMemo, useState, useEffect } from 'react';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { Box, Chip, Alert, Stack, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetReportingRunsQuery } from 'src/redux/hr/hrReportingWorkspaceApi';

import { reportError, displayReportValue } from '../reporting-workspace-utils';

export function ReportHistory() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [active, setActive] = useState(true);
  const {
    data: history,
    error,
    isFetching,
  } = useGetReportingRunsQuery(
    { skip, take: 50 },
    { pollingInterval: active ? 5000 : 0, skipPollingIfUnfocused: true }
  );
  const data = useMemo(() => history?.items || [], [history?.items]);
  useEffect(() => {
    setActive(data.some((run) => ['Queued', 'Running'].includes(run.status)));
  }, [data]);
  const columns = useMemo(
    () => [
      { id: 'name', label: 'Report', minWidth: '220px', sticky: true },
      {
        id: 'status',
        label: 'Status',
        minWidth: '120px',
        render: (_: unknown, row: any) => (
          <Chip size="small" variant="outlined" label={row.isExpired ? 'Expired' : row.status} />
        ),
      },
      { id: 'period', label: 'Reporting period', minWidth: '210px' },
      {
        id: 'capturedAt',
        label: 'Generated',
        minWidth: '180px',
        render: (v: string, row: any) => displayReportValue(v, 'datetime', row.parameters.timeZone),
      },
      { id: 'rowCount', label: 'Rows', minWidth: '80px' },
      {
        id: 'action',
        label: 'Action',
        minWidth: '100px',
        render: (_: unknown, row: any) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(hrReportPaths.result(row.id))}
          >
            Open report
          </Button>
        ),
      },
    ],
    [router]
  );
  if (error) return <Alert severity="error">{reportError(error)}</Alert>;
  return (
    <Stack spacing={1} sx={{ height: 1, minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="hr-generated-report-history"
          columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
          data={data.map((run) => ({
            ...run,
            period: run.parameters.fromDate
              ? `${run.parameters.fromDate} to ${run.parameters.toDate}`
              : 'Current records',
          }))}
          isLoading={isFetching && !data.length}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          showToolbar={false}
          noDataText={
            history?.hasMore || skip > 0
              ? 'No reports available on this page with your current access.'
              : 'No generated reports available. Choose a template to generate a report.'
          }
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button size="small" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - 50))}>
          Previous
        </Button>
        <Button size="small" disabled={!history?.hasMore} onClick={() => setSkip(skip + 50)}>
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
