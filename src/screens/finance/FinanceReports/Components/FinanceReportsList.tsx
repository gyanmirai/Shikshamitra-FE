'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FinanceReportExport } from 'src/redux/finance/reports/financeReportsApi';

import { useEffect } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Chip, Alert, Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetFinanceReportOptionsQuery, useGetFinanceReportExportsQuery, useDownloadFinanceReportMutation,
} from 'src/redux/finance/reports/financeReportsApi';

import { FinanceAiReportDrawer } from './FinanceAiReportDrawer';
import { FinanceReportWorkspace } from './FinanceReportWorkspace';
import { phaseOneReports } from '../finance-report-catalog';

const statusColors = {
  Completed: 'success',
  Running: 'info',
  Failed: 'error',
  Queued: 'default',
  Expired: 'default',
} as const;

const dateColumn = (id: string, label: string): IColumn => ({
  id, label, minWidth: 165, align: 'left', filterType: 'dateTime',
});

function reportFileName(job: FinanceReportExport) {
  return `${job.reportType} ${job.createdAt.slice(0, 10)}.${job.format === 'pdf' ? 'pdf' : 'xlsx'}`;
}

const columns: IColumn[] = [
  { label: 'Report type', id: 'reportType', minWidth: 245, align: 'left', filterType: 'string' },
  { label: 'Format', id: 'format', minWidth: 80, align: 'left', render: (value) => value === 'pdf' ? 'PDF' : 'Excel' },
  { label: 'File name', id: 'fileName', minWidth: 225, align: 'left', filterType: 'string' },
  dateColumn('createdAt', 'Created'),
  dateColumn('completedAt', 'Completed'),
  dateColumn('expiresAt', 'Expires'),
  {
    label: 'Status', id: 'status', minWidth: 125, align: 'left', filterType: 'enum',
    render: (value) => <Chip size="small" variant="soft"
      color={statusColors[value as keyof typeof statusColors] ?? 'default'}
      label={value === 'Running' ? 'Generating' : value} />,
  },
];

const FinanceReportsList = () => {
  const build = useBoolean(false);
  const ai = useBoolean(false);
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const options = useGetFinanceReportOptionsQuery();
  const history = useGetFinanceReportExportsQuery();
  const [download, downloadState] = useDownloadFinanceReportMutation();
  const available = options.currentData?.reportTypes ?? [];
  const canBuild = available.length > 0;
  const canUseAi = available.some((report) => !phaseOneReports.some((type) => type === report.id));
  const refreshHistory = history.refetch;
  const hasRunningJobs = history.currentData?.some((job) => job.status === 'Queued' || job.status === 'Running');

  useEffect(() => {
    if (!hasRunningJobs) return undefined;
    const poll = window.setInterval(refreshHistory, 4000);
    return () => window.clearInterval(poll);
  }, [hasRunningJobs, refreshHistory]);

  const handleQueued = () => {
    build.onFalse();
    ai.onFalse();
    void history.refetch();
    shikshaMitraToast.success({ message: 'Report queued. Download it from the history when it is ready.' });
  };

  async function handleDownload(job: FinanceReportExport) {
    try {
      const file = await download(job.jobId).unwrap();
      const url = URL.createObjectURL(new Blob([Uint8Array.from(file)], {
        type: job.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
      const link = document.createElement('a');
      link.href = url;
      link.download = reportFileName(job);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      shikshaMitraToast.error({ message: 'Could not download this report. Try again or generate a new report.' });
    } finally {
      downloadState.reset();
    }
  }

  if (build.value && options.currentData && canBuild) {
    return <FinanceReportWorkspace options={options.currentData} defaultYear={academicYearId}
      onBack={build.onFalse} onQueued={handleQueued} />;
  }

  const data = (history.currentData ?? []).map((job) => ({
    ...job, fileName: job.status === 'Completed' ? reportFileName(job) : '—',
  }));

  return (
    <Stack spacing={1} sx={{ height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs heading="Reports"
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Reports' }]}
        action={(
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {canUseAi && <Button size="small" variant="soft"
              startIcon={<Iconify icon="solar:magic-stick-3-bold" />} onClick={ai.onTrue}>
              Generate with AI
            </Button>}
            <Button size="small" variant="contained" startIcon={<Add />} disabled={!canBuild} onClick={build.onTrue}>
              Report
            </Button>
          </Stack>
        )}
      />
      {options.isError && <Alert severity="error" action={<Button onClick={() => options.refetch()}>Retry</Button>}>
        Could not load the reports available to you.
      </Alert>}
      {options.isSuccess && !canBuild && <Alert severity="info">There are no finance reports available for your permissions and scope.</Alert>}
      {history.isError && <Alert severity="error" action={<Button onClick={() => history.refetch()}>Retry</Button>}>
        Could not load report history.
      </Alert>}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable tableTitle="Generated finance reports" tableId="finance-report-export-requests"
          columns={[
            ...columns,
            {
              label: 'Actions', id: 'actions', minWidth: 110, align: 'right', stickyPosition: 'right', sticky: true,
              render: (_value, row) => {
                const job = row as FinanceReportExport;
                return job.status === 'Completed' ? (
                  <Button size="small" disabled={downloadState.isLoading} onClick={() => void handleDownload(job)}>
                    Download
                  </Button>
                ) : null;
              },
            },
          ]}
          data={data} isLoading={history.isLoading} isPagination isSearch isFilter
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText="No reports have been generated yet."
        />
      </Box>
      {canUseAi && <FinanceAiReportDrawer open={ai.value} onClose={ai.onFalse} onExportQueued={handleQueued} />}
    </Stack>
  );
};

export default FinanceReportsList;
