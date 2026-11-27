'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useId, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { usePreviewStudentReportMutation } from 'src/redux/student/student-report/student-report-api';
import {
  Box,
  Chip,
  Table,
  Alert,
  Button,
  Drawer,
  Tooltip,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  LinearProgress,
  TablePagination,
} from '@mui/material';

import { useStudentReportPdfExport } from './use-student-report-pdf-export';

import type { StudentRecordsReportRequest } from './use-student-report-pdf-export';

interface PreviewColumn {
  id: string | null;
  label: string | null;
}

interface PreviewData {
  reportType: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: PreviewColumn[] | null;
  rows: Record<string, string>[] | null;
}

interface StudentRecordsReportPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  reportRequest: StudentRecordsReportRequest | null;
  reportTitle: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface PreviewResult {
  input: StudentRecordsReportRequest;
  owner: string;
  attempt: number;
  data: PreviewData | null;
}

const StudentRecordsReportPreviewDrawer = ({
  open,
  onClose,
  reportRequest,
  reportTitle,
}: StudentRecordsReportPreviewDrawerProps) => {
  const { permissions, sessionContext, user } = useSelector((state: RootState) => state.auth);
  const owner = `${sessionContext?.tenantId ?? ''}:${user?.sub ?? ''}`;
  const canExport = hasGrantedPermission(permissions, 'Students.Records.Reports.Add');
  const titleId = useId();
  const [contentVisible, setContentVisible] = useState(open);
  const [pagination, setPagination] = useState({ request: reportRequest, page: 0 });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const page = reportRequest === pagination.request ? pagination.page : 0;
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewReport] = usePreviewStudentReportMutation();
  const pdf = useStudentReportPdfExport(open && canExport, reportRequest, owner);
  const showPreview = open || contentVisible;

  const previewInput = useMemo(
    () =>
      showPreview && reportRequest
        ? { ...reportRequest, page: page + 1, pageSize: rowsPerPage }
        : null,
    [showPreview, reportRequest, page, rowsPerPage]
  );

  useEffect(() => {
    if (!showPreview) setPagination({ request: reportRequest, page: 0 });
  }, [showPreview, reportRequest]);

  useEffect(() => {
    if (!open || !previewInput) return undefined;

    let active = true;
    const request = previewReport(previewInput);
    const showResult = (data: PreviewData | null) => {
      if (active) setPreviewResult({ input: previewInput, owner, attempt: previewAttempt, data });
    };
    request.unwrap().then(
      (data) => showResult(data ?? null),
      () => showResult(null)
    );

    return () => {
      active = false;
      request.abort();
    };
  }, [open, owner, previewAttempt, previewInput, previewReport]);

  const handleClose = () => {
    if (!pdf.isActive()) onClose();
  };
  const handleChangePage = (_: unknown, newPage: number) =>
    setPagination({ request: reportRequest, page: newPage });
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    handleChangePage(null, 0);
  };

  const currentPreview =
    previewResult?.input === previewInput &&
    previewResult.owner === owner &&
    previewResult.attempt === previewAttempt
      ? previewResult
      : null;
  const isPreviewLoading = Boolean(previewInput && !currentPreview);
  const isPreviewError = currentPreview?.data === null;
  const columns = currentPreview?.data?.columns ?? [];
  const rows = currentPreview?.data?.rows ?? [];
  const totalCount = currentPreview?.data?.totalCount ?? 0;
  const isDownloadInProgress = pdf.phase !== 'idle';

  const downloadStatusText =
    pdf.phase === 'creating'
      ? 'Creating export…'
      : pdf.phase === 'polling'
        ? `Generating PDF${pdf.jobStatus ? ` (${pdf.jobStatus})` : '…'}`
        : 'Downloading…';
  let downloadAction = 'Download PDF';
  if (pdf.recovery?.job?.phase === 'polling') downloadAction = 'Check export status';
  if (pdf.recovery?.job?.phase === 'downloading') downloadAction = 'Retry download';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      onTransitionEnter={() => setContentVisible(true)}
      onTransitionExited={() => setContentVisible(false)}
      slotProps={{
        paper: {
          inert: !open || undefined,
          'aria-labelledby': titleId,
          sx: {
            width: { xs: '100%', sm: '80vw', md: '70vw', lg: '60vw' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            flexWrap: 'wrap',
            gap: 1,
            minWidth: 0,
          }}
        >
          <Typography component="h2" variant="h6" id={titleId} sx={{ overflowWrap: 'anywhere' }}>
            {reportTitle || 'Report Preview'}
          </Typography>
          {totalCount > 0 && (
            <Chip label={`${totalCount} ${totalCount === 1 ? 'record' : 'records'}`} size="small" />
          )}
        </Box>
        <Tooltip title="Close report preview">
          <span>
            <IconButton
              aria-label="Close report preview"
              onClick={handleClose}
              disabled={isDownloadInProgress}
            >
              <Iconify icon={GlobalIcons.cancel} width={20} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {isPreviewLoading && (
        <LinearProgress aria-label="Loading report preview" sx={{ flexShrink: 0 }} />
      )}

      <Scrollbar sx={{ flex: 1, minHeight: 0 }} ariaLabel="Report preview">
        {isPreviewError ? (
          <Alert
            severity="error"
            sx={{ mx: { xs: 2, sm: 3 }, my: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setPreviewAttempt((attempt) => attempt + 1)}
              >
                Retry
              </Button>
            }
          >
            The report preview could not be loaded.
          </Alert>
        ) : (
          previewInput && (
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {isPreviewLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableCell key={i} sx={{ fontWeight: 700 }}>
                          <Skeleton width={80} height={20} />
                        </TableCell>
                      ))
                    : columns.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            color: 'text.primary',
                            fontSize: '0.78rem',
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isPreviewLoading ? (
                  Array.from({ length: rowsPerPage }).map((_, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {Array.from({ length: 5 }).map((__, colIdx) => (
                        <TableCell key={colIdx}>
                          <Skeleton height={18} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length || 1} align="center" sx={{ py: 8 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Iconify icon="mdi:table-off" width={48} sx={{ color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          No data found for the selected filters
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, rowIdx) => (
                    <TableRow
                      key={rowIdx}
                      hover
                      sx={(theme) => ({
                        '&:nth-of-type(even)': {
                          bgcolor: theme.palette.action.hover,
                        },
                      })}
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {col.id ? (row[col.id] ?? '—') : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )
        )}
      </Scrollbar>

      {/* Pagination */}
      {!isPreviewLoading && totalCount > 0 && (
        <Box
          sx={(theme) => ({
            borderTop: `1px solid ${theme.palette.divider}`,
            px: 1,
            flexShrink: 0,
          })}
        >
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            labelRowsPerPage="Rows:"
            sx={{ '.MuiTablePagination-toolbar': { minHeight: 48 } }}
          />
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'flex-end',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {pdf.recovery && (
          <Alert severity="error" sx={{ alignSelf: 'stretch' }}>
            {pdf.recovery.message}
          </Alert>
        )}
        <Box component="span" role="status" sx={{ position: 'absolute', clipPath: 'inset(50%)' }}>
          {isDownloadInProgress ? downloadStatusText : ''}
        </Box>
        <LoadingButton
          variant="contained"
          color="inherit"
          size="small"
          disabled={!canExport || !reportRequest || isPreviewLoading}
          loading={isDownloadInProgress}
          startIcon={<Iconify icon={GlobalIcons.download} />}
          onClick={pdf.run}
        >
          {isDownloadInProgress ? downloadStatusText : downloadAction}
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default StudentRecordsReportPreviewDrawer;
