import type { IColumn } from 'src/components/customizabaleTable/types';
import type { HrReportTemplate, HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { formatHrReportDateTime, getHrReportExportFileName } from '../hr-report-utils';

type HrReportsLandingTableProps = {
  templates: HrReportTemplate[];
  exportJobs: HrReportExportJob[];
  isLoading: boolean;
  isDownloading: boolean;
  onGenerateReport: () => void;
  onDownload: (jobId: string, fileName?: string) => void;
};

type LandingRow = {
  id: string;
  name: string;
  category: string;
  type: 'Template' | 'Export';
  status: string;
  date?: string;
  format?: string;
  job?: HrReportExportJob;
};

export function HrReportsLandingTable({
  templates,
  exportJobs,
  isLoading,
  isDownloading,
  onGenerateReport,
  onDownload,
}: HrReportsLandingTableProps) {
  const rows = useMemo<LandingRow[]>(
    () => [
      ...exportJobs.map((job) => ({
        id: `export-${job.id}`,
        name: job.reportType,
        category: job.format.toUpperCase(),
        type: 'Export' as const,
        status: job.status,
        date: job.creationTime,
        format: job.format,
        job,
      })),
      ...templates.map((template) => ({
        id: `template-${template.id}`,
        name: template.name,
        category: template.category,
        type: 'Template' as const,
        status: template.status,
        date: template.lastModificationTime || template.creationTime,
      })),
    ],
    [exportJobs, templates]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      { id: 'name', label: 'Report Name', minWidth: '16vw', align: 'left' as const, sticky: true },
      { id: 'type', label: 'Type', minWidth: '8vw', align: 'left' as const },
      { id: 'category', label: 'Category / Format', minWidth: '10vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '10vw',
        align: 'left' as const,
        render: (value: string, row: any) => (
          <Chip
            size="small"
            label={value}
            variant="soft"
            color={
              value === 'Completed' || value === 'Published'
                ? 'success'
                : value === 'Failed'
                  ? 'error'
                  : row.type === 'Template'
                    ? 'default'
                    : 'info'
            }
          />
        ),
      },
      {
        id: 'date',
        label: 'Updated / Requested',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatHrReportDateTime(value),
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: '8vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value: any, row: any) =>
          row.job ? (
            <IconButton
              size="small"
              disabled={row.job.status !== 'Completed' || isDownloading}
              onClick={() => onDownload(row.job!.id, getHrReportExportFileName(row.job!))}
            >
              <Iconify icon={GlobalIcons.download} />
            </IconButton>
          ) : (
            <Button
              size="small"
              variant="text"
              startIcon={<Iconify icon={GlobalIcons.report} />}
              onClick={onGenerateReport}
            >
              Open
            </Button>
          ),
      },
    ],
    [isDownloading, onDownload, onGenerateReport]
  );

  return (
    <CustomizableTable
      tableId="hr-reports-landing"
      tableTitle="HR Reports"
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isSearch
      noDataText="No saved templates or export jobs found."
    />
  );
}
