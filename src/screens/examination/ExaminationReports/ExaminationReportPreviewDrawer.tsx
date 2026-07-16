'use client';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  usePreviewAcademicReportMutation,
  useLazyDownloadAcademicReportQuery,
  useCreateAcademicReportExportMutation,
  useLazyGetAcademicReportExportJobQuery,
} from 'src/redux/academicAPI/AcademicReportApi';
import {
  Box,
  Chip,
  Table,
  Button,
  Drawer,
  Tooltip,
  Divider,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  LinearProgress,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

interface AcademicReportRequestDto {
  reportType: string;
  format?: string | null;
  page?: number;
  pageSize?: number;
  filters?: {
    academicYearId?: string | null;
    standardIds?: string[] | null;
    standardId?: string | null;
    divisionIds?: string[] | null;
    examId?: string | null;
    examIds?: string[] | null;
    examGroupId?: string | null;
    examGroupIds?: string[] | null;
    subjectIds?: string[] | null;
    subjectId?: string | null;
    grades?: string[] | null;
    studentIds?: string[] | null;
    studentId?: string | null;
  };
}

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

interface ExaminationReportPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  reportRequest: AcademicReportRequestDto | null;
  reportTitle: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type DownloadPhase = 'idle' | 'creating' | 'polling' | 'downloading';

const ExaminationReportPreviewDrawer = ({
  open,
  onClose,
  reportRequest,
  reportTitle,
}: ExaminationReportPreviewDrawerProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>('idle');
  const [jobStatusLabel, setJobStatusLabel] = useState('');
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [previewReport, { data: previewData, isLoading: isPreviewLoading }] = useQueryAndMutation<
    typeof usePreviewAcademicReportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: usePreviewAcademicReportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to load report preview' },
  });

  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  const [pollJobStatus] = useLazyGetAcademicReportExportJobQuery();
  const [triggerDownload] = useLazyDownloadAcademicReportQuery();

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (open && reportRequest) {
      previewReport({ ...reportRequest, page: page + 1, pageSize: rowsPerPage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reportRequest, page, rowsPerPage]);

  useEffect(() => {
    if (open) {
      setPage(0);
      stopPolling();
      setDownloadPhase('idle');
      setJobStatusLabel('');
    }
  }, [open, reportRequest, stopPolling]);

  const saveFile = useCallback(
    (data: { bytes: string; contentType?: string | null; fileName?: string | null }) => {
      const byteChars = atob(data.bytes);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) {
        byteArr[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteArr], { type: data.contentType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleDownload = useCallback(async () => {
    if (!reportRequest || downloadPhase !== 'idle') return;

    setDownloadPhase('creating');
    setJobStatusLabel('');

    const exportResult = await createExport({ ...reportRequest, format: 'pdf' });
    if (!('data' in exportResult) || !exportResult.data?.jobId) {
      setDownloadPhase('idle');
      return;
    }

    const { jobId } = exportResult.data;
    setDownloadPhase('polling');
    setJobStatusLabel(exportResult.data.status || 'Queued');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusResult = await pollJobStatus({ jobId }, false);
        if (!('data' in statusResult) || !statusResult.data) return;

        const { status } = statusResult.data;
        setJobStatusLabel(status || '');

        if (status === 'Completed') {
          stopPolling();
          setDownloadPhase('downloading');
          try {
            const dlResult = await triggerDownload({ jobId }, false);
            if ('data' in dlResult && dlResult.data?.bytes) {
              saveFile(dlResult.data);
            }
          } catch {
            shikshaMitraToast.error({ message: 'Download failed. Please try again.' });
          } finally {
            setDownloadPhase('idle');
            setJobStatusLabel('');
          }
        } else if (status === 'Failed') {
          stopPolling();
          setDownloadPhase('idle');
          setJobStatusLabel('');
          shikshaMitraToast.error({
            message: statusResult.data.errorMessage || 'Export job failed',
          });
        }
      } catch {
        // transient poll error — retry on next tick
      }
    }, 2000);
  }, [
    reportRequest,
    downloadPhase,
    createExport,
    pollJobStatus,
    triggerDownload,
    stopPolling,
    saveFile,
  ]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const typedPreviewData = previewData as PreviewData | undefined;
  const columns: PreviewColumn[] = typedPreviewData?.columns || [];
  const rows: Record<string, string>[] = typedPreviewData?.rows || [];
  const totalCount = typedPreviewData?.totalCount || 0;

  const isDownloadInProgress = downloadPhase !== 'idle';

  const downloadStatusText =
    downloadPhase === 'creating' || isExportCreating
      ? 'Creating export...'
      : downloadPhase === 'polling'
        ? `Generating PDF${jobStatusLabel ? ` (${jobStatusLabel})` : '...'}`
        : downloadPhase === 'downloading'
          ? 'Downloading...'
          : 'Download PDF';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: '80vw', md: '70vw', lg: '60vw' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={(theme) => ({
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          flexShrink: 0,
        })}
      >
        <Iconify icon="mdi:file-chart-outline" width={22} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1, lineHeight: 1.2 }}>
          {reportTitle}
        </Typography>
        {!isPreviewLoading && totalCount > 0 && (
          <Chip
            label={`${totalCount} records`}
            size="small"
            sx={{
              bgcolor: (t) => alpha(t.palette.common.white, 0.2),
              color: 'inherit',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <Tooltip title="Close">
          <IconButton onClick={onClose} size="small" sx={{ color: 'inherit', ml: 1 }}>
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Tooltip>
      </Box>

      {isPreviewLoading && <LinearProgress sx={{ height: 3, flexShrink: 0 }} />}

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {isPreviewLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableCell
                      key={i}
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.primary.light, 0.12),
                        fontWeight: 700,
                      })}
                    >
                      <Skeleton width={80} height={20} />
                    </TableCell>
                  ))
                : columns.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.primary.light, 0.12),
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color: theme.palette.primary.dark,
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        fontSize: '0.78rem',
                      })}
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
                      gap: 1,
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
                      bgcolor: alpha(theme.palette.grey[100], 0.6),
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
      </TableContainer>

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
      <Divider />
      <Box
        sx={(theme) => ({
          px: 3,
          py: 2,
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          bgcolor: alpha(theme.palette.grey[100], 0.6),
          flexShrink: 0,
        })}
      >
        <Button variant="outlined" color="inherit" size="small" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={isDownloadInProgress || isPreviewLoading}
          startIcon={
            isDownloadInProgress ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="mdi:download-outline" width={18} />
            )
          }
          onClick={handleDownload}
          sx={{ minWidth: 160 }}
        >
          {downloadStatusText}
        </Button>
      </Box>
    </Drawer>
  );
};

export default ExaminationReportPreviewDrawer;
