import type { IColumn } from 'src/components/customizabaleTable/types';
import type { RecordsReportInput } from 'src/redux/student/records/student-record-reports-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime, formatStr } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useStudentCompliancePreview } from '../hooks/use-student-compliance-preview';
import { reportCellValue, getStudentReportError } from '../utils/compliance-report-model';

type Props = {
  request: RecordsReportInput;
  title: string;
  scopeLabel: string;
  canGenerate: boolean;
  onClose: () => void;
  onGenerated: () => void;
};

export default function ComplianceReportPreview({
  request,
  title,
  scopeLabel,
  canGenerate,
  onClose,
  onGenerated,
}: Props) {
  const { preview, page, setPage, size, setSize, creating, queue } = useStudentCompliancePreview(
    request,
    canGenerate,
    onGenerated
  );
  const columns: IColumn[] = (preview.currentData?.columns ?? []).map((column) => ({
    id: column,
    label: column,
    minWidth: column === 'Student' ? 200 : 150,
    isFilter: false,
    isSort: false,
    render: (value) =>
      column === 'Last UDISE export' && value
        ? fDateTime(String(value), formatStr.split.dateTime)
        : reportCellValue(column, value == null ? null : String(value)),
  }));
  return (
    <CustomDialog
      open
      title={title}
      titleInfo="Preview and Excel use the same scoped query and current policy masks. Generation exports the full selected scope, not only this page."
      handleClose={onClose}
      hasForm={false}
      maxWidth="lg"
      disableClose={creating.isLoading}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <FormSectionCard
            title="Selected Scope"
            icon={GlobalIcons.report}
            descriptionTooltip="Scope remains the one you previewed even if the global academic selector changes."
          >
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {scopeLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current saved statuses for active eligible Student Records. Excel generation rechecks
              your permissions and scope.
            </Typography>
            {!canGenerate && (
              <Typography variant="body2" color="text.secondary">
                Generating Excel requires Student Reports Add/Update permission. You can review this
                preview.
              </Typography>
            )}
          </FormSectionCard>
          <CustomizableTable
            tableId={`student-compliance-preview-${request.reportType}`}
            tableTitle="Report Preview"
            columns={columns}
            data={(preview.currentData?.rows ?? []).map((row, index) => ({
              ...row,
              id: `${page}-${index}`,
            }))}
            isLoading={preview.isFetching && !preview.currentData}
            isRefreshing={preview.isFetching && Boolean(preview.currentData)}
            error={
              preview.isError
                ? getStudentReportError(
                    preview.error,
                    'The report preview could not be loaded. Retry to check the current scope and access.'
                  )
                : undefined
            }
            onRetry={() => preview.refetch()}
            noDataText="No students match this report scope."
            showColumns
            showFullScreen
            showExport={false}
            isSearch={false}
            isFilter={false}
            serverSidePagination
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[10, 25, 50, 100]}
            maxServerRowsPerPage={100}
            totalCount={preview.currentData?.totalCount ?? 0}
            onServerPagination={(next, nextSize) => {
              setPage(next - 1);
              setSize(nextSize);
            }}
            tableContainerProps={{ sx: { maxHeight: 440 } }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={creating.isLoading}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
        <Button
          size="small"
          variant="contained"
          color="inherit"
          onClick={queue}
          loading={creating.isLoading}
          disabled={!canGenerate || preview.isFetching || preview.isError || !preview.currentData}
          startIcon={<Iconify icon={GlobalIcons.generateReport} />}
        >
          Generate Excel
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
