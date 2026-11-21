import type { LibraryReportPreview as ReportPreview } from 'src/redux/library/library-adapters';

import { Alert, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { supportsReportAsOf } from './report-draft-types';
import { LibraryReadDateNotice } from '../../circulation/LibraryReadDateNotice';

export function LibraryReportPreview({
  preview,
  reportId,
}: {
  preview: ReportPreview | null;
  reportId: string;
}) {
  if (!preview)
    return <Alert severity="info">Run a preview to inspect the first 50 rows before export.</Alert>;
  return (
    <Stack spacing={1}>
      {supportsReportAsOf(reportId) && <LibraryReadDateNotice school={preview} overdue={preview} />}
      {preview.queryWarnings.length > 0 && (
        <Alert severity="warning">{preview.queryWarnings.join(' ')}</Alert>
      )}
      <Typography variant="subtitle2">Preview: {preview.reportType}</Typography>
      <Typography variant="caption" color="text.secondary">
        Showing {preview.rows.length} of {preview.totalCount} matching records. Export includes all
        matching records.
      </Typography>
      <CustomizableTable
        tableId={`library-report-preview-${reportId}`}
        columns={preview.columns.map((column) => ({
          id: column.id,
          label: column.label,
          minWidth: 140,
          align: 'left' as const,
          isSort: false,
          isFilter: false,
        }))}
        data={preview.rows}
        isPagination={false}
        isSearch={false}
        isFilter={false}
        showExport={false}
      />
    </Stack>
  );
}
