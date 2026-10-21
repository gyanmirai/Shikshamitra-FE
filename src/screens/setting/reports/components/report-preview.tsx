import type { IColumn } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { reportError } from '../types';
import { ReportDrawer } from './report-drawer';
import { useReportPreview } from '../hooks/use-report-preview';

import type { InstituteReportRequest } from '../types';

export function ReportPreviewDrawer({
  request,
  onClose,
  onGenerate,
  busy,
  canAdd,
}: {
  request: InstituteReportRequest;
  onClose: () => void;
  onGenerate: (request: InstituteReportRequest) => Promise<void>;
  busy: boolean;
  canAdd: boolean;
}) {
  const { preview, page, size, loading, error, setPagination, retry } = useReportPreview(request);
  const columns: IColumn[] = preview?.columns.map((column) => ({
    ...column,
    isFilter: false,
    isSort: false,
    align: 'left',
    minWidth: 140,
    cellSx: { overflowWrap: 'anywhere' },
  })) ?? [{ id: 'loading', label: <Skeleton width={120} />, isFilter: false, isSort: false }];
  return (
    <ReportDrawer
      title="Report Preview"
      wide
      scrollBody={false}
      busy={busy}
      onClose={onClose}
      info="Preview current data using the saved report filters. Previously generated downloads retain their original contents."
      footer={
        <>
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="outlined"
            disabled={busy}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          >
            Close
          </Button>
          {canAdd && (
            <SubmitButton
              type="button"
              loading={busy}
              disabled={busy || loading || Boolean(error) || !preview}
              startIcon={<Iconify icon={GlobalIcons.generateReport} width={18} />}
              buttonText={`Generate ${request.format === 'excel' ? 'Excel' : request.format.toUpperCase()} report`}
              onClick={() => {
                if (!busy && !loading && !error && preview) onGenerate(request);
              }}
            />
          )}
        </>
      }
    >
      <Typography variant="body2" role="status" sx={{ flexShrink: 0, overflowWrap: 'anywhere' }}>
        {loading
          ? 'Loading report preview...'
          : error
            ? 'Report preview could not be loaded.'
            : `${preview?.filterSummary} · ${preview?.totalCount} matching rows`}
      </Typography>
      <Box
        sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflow: 'hidden' }}
        aria-busy={loading || busy}
      >
        <CustomizableTable
          tableId="institute-report-preview"
          tableTitle="Report Preview"
          columns={columns}
          data={
            loading || error
              ? []
              : (preview?.rows ?? []).map((row) =>
                  Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [key, value ?? 'Not set'])
                  )
                )
          }
          isLoading={loading}
          error={error ? reportError(error) : undefined}
          onRetry={busy ? undefined : retry}
          noDataText="No records match the selected report filters."
          showToolbar={false}
          isFilter={false}
          isSearch={false}
          serverSidePagination
          page={page}
          rowsPerPage={size}
          defaultRowsPerPage={size}
          totalCount={preview?.totalCount ?? 0}
          rowsPerPageOptions={[10, 25, 50, 100]}
          paginationDisabled={loading || busy || Boolean(error)}
          onServerPagination={(next, pageSize) => {
            if (!loading && !busy && !error) setPagination({ page: next - 1, size: pageSize });
          }}
          wrapperProps={{ sx: { height: 1, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
        Generation runs in the background. You may leave the page and return to download the file.
      </Typography>
    </ReportDrawer>
  );
}
