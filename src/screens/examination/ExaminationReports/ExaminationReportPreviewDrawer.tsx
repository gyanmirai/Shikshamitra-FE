'use client';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  usePreviewAcademicReportMutation,
} from 'src/redux/academicAPI/AcademicReportApi';
import { useAcademicReportDownload } from 'src/screens/academic/components/reports/useAcademicReportDownload';
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
  existingExportJobId?: string | null;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const ExaminationReportPreviewDrawerContent = ({
  open,
  onClose,
  reportRequest,
  reportTitle,
  existingExportJobId,
}: ExaminationReportPreviewDrawerProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { downloadPhase, jobStatusLabel, handleDownload: downloadJob, handleCreateDownload } = useAcademicReportDownload();

  const [previewReport, { data: previewData, isLoading: isPreviewLoading }] = useQueryAndMutation<
    typeof usePreviewAcademicReportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: usePreviewAcademicReportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to load report preview' },
  });

  useEffect(() => {
    if (open && reportRequest) {
      previewReport({ ...reportRequest, page: page + 1, pageSize: rowsPerPage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reportRequest, page, rowsPerPage]);

  const handleDownload = async () => {
    if (!reportRequest || downloadPhase !== 'idle') return;
    if (existingExportJobId) await downloadJob(existingExportJobId, 'Completed', true);
    else await handleCreateDownload(reportRequest);
  };

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
    downloadPhase === 'creating'
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
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
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

const ExaminationReportPreviewDrawer = ({ open, reportRequest, ...props }: ExaminationReportPreviewDrawerProps) =>
  open ? <ExaminationReportPreviewDrawerContent key={JSON.stringify(reportRequest)} open={open} reportRequest={reportRequest} {...props} /> : null;

export default ExaminationReportPreviewDrawer;
