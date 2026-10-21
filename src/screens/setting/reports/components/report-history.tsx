import type { IColumn } from 'src/components/customizabaleTable/types';

import { Chip } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { reportError } from '../types';

import type { ReportJob } from '../types';
import type { ReportWorkspace } from '../hooks/use-report-workspace';

export function ReportHistory({ workspace }: { workspace: ReportWorkspace }) {
  const { history, canAdd, downloading, setPreview, download, generate } = workspace;
  const columns: IColumn[] = [
    { id: 'reportType', label: 'Report Type', minWidth: 190 },
    { id: 'format', label: 'Format', minWidth: 85, render: (value: string) => value.toUpperCase() },
    { id: 'status', label: 'Status', minWidth: 120, render: (value: ReportJob['status']) => <Chip size="small" variant="soft" label={value}
      color={value === 'Completed' ? 'success' : value === 'Failed' ? 'error' : 'default'}
      sx={(theme) => value === 'Completed' ? { color: 'success.darker', ...theme.applyStyles('dark', { color: 'success.light' }) } : {}} /> },
    { id: 'fileName', label: 'File Name', minWidth: 240, render: (value: string | null) => value ?? 'Not available' },
    { id: 'creationTime', label: 'Created At', minWidth: 160, filterType: 'dateTime', render: (value: string) => fDateTime(value) },
    { id: 'completedAt', label: 'Completed At', minWidth: 160, filterType: 'dateTime', render: (value: string | null) => value ? fDateTime(value) : 'Pending' },
    { id: 'expiresAt', label: 'Expires At', minWidth: 160, filterType: 'dateTime', render: (value: string) => fDateTime(value) },
    { id: 'actions', label: 'Actions', width: 110, sticky: true, stickyPosition: 'right', excludeFromExport: true, isFilter: false, isSort: false,
      render: (_value: unknown, record) => {
        const job = record as ReportJob;
        return <AdaptiveThreeDotsActions moreLabel={`Actions for ${job.reportType}`} actions={[
          { id: 'preview', label: 'Preview current data', icon: GlobalIcons.eye, onClick: () => setPreview(job.request) },
          ...(job.status === 'Completed' ? [{ id: 'download', label: 'Download report', icon: GlobalIcons.download,
            disabled: Boolean(downloading), loading: downloading === job.id, onClick: () => { download(job); } }] : []),
          ...(canAdd && (job.status === 'Failed' || job.status === 'Expired') ? [{ id: 'regenerate', label: 'Generate again', icon: GlobalIcons.generateReport,
            disabled: workspace.exporting, tooltip: job.errorMessage ?? 'The generated file has expired.', onClick: () => { generate(job.request); } }] : []),
        ]} />;
      } },
  ];
  return <CustomizableTable tableId="institute-setup-reports" tableTitle="Institute Setup Reports" columns={columns}
    data={history.data ?? []} isLoading={history.isLoading} error={history.isError ? reportError(history.error) : undefined}
    onRetry={() => { history.refetch(); }} defaultRowsPerPage={10}
    noDataText="No reports have been generated yet." wrapperProps={{ sx: { height: 1 } }} tableContainerProps={{ sx: { height: 1 } }} />;
}
