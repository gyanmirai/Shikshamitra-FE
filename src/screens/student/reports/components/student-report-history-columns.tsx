import type { IColumn } from 'src/components/customizabaleTable/types';
import type { RecordsReportJob } from 'src/redux/student/records/student-record-reports-api';

import { Label } from 'src/components/label';
import { fDateTime, formatStr } from 'src/utils/format-time';

import { studentReportTitle } from '../utils/compliance-report-model';
import StudentReportHistoryActions from './StudentReportHistoryActions';

import type { useStudentReportHistory } from '../hooks/use-student-report-history';

export function studentReportHistoryColumns(
  history: ReturnType<typeof useStudentReportHistory>
): IColumn[] {
  return [
    {
      id: 'reportType',
      label: 'Report',
      minWidth: 220,
      isFilter: false,
      isSort: false,
      render: (value) => studentReportTitle(value as RecordsReportJob['reportType']),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 150,
      isFilter: false,
      isSort: false,
      render: (value) => (
        <Label color={value === 'Completed' ? 'success' : value === 'Failed' ? 'error' : 'default'}>
          {value === 'Completed' ? 'Report ready' : value}
        </Label>
      ),
    },
    {
      id: 'rowCount',
      label: 'Rows',
      minWidth: 90,
      isFilter: false,
      isSort: false,
      render: (value) => value ?? '—',
    },
    {
      id: 'creationTime',
      label: 'Created',
      minWidth: 170,
      isFilter: false,
      isSort: false,
      render: (value) => fDateTime(value, formatStr.split.dateTime),
    },
    {
      id: 'expiresAt',
      label: 'Expires',
      minWidth: 170,
      isFilter: false,
      isSort: false,
      render: (value) => fDateTime(value, formatStr.split.dateTime),
    },
    {
      id: 'availability',
      label: 'Availability',
      minWidth: 220,
      isFilter: false,
      isSort: false,
      render: (_value, row) =>
        row.status === 'Failed'
          ? 'Generation failed. Generate again to retry.'
          : row.status === 'Expired'
            ? 'File expired. Generate again.'
            : row.status === 'Completed' && !row.canDownload
              ? 'Access or policy changed. Generate again if permitted.'
              : ['Queued', 'Generating'].includes(row.status)
                ? 'Processing; this list refreshes automatically.'
                : '—',
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'left',
      minWidth: 100,
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_value, row) => (
        <StudentReportHistoryActions job={row as RecordsReportJob} history={history} />
      ),
    },
  ];
}
