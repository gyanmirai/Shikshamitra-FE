'use client';

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
  Button,
  Drawer,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  LinearProgress,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import { CurriculumReportPreviewTable } from './CurriculumReportPreviewTable';

import type {
  PreviewData,
  PreviewColumn,
  AcademicReportRequestDto,
} from './CurriculumReportPreview.types';

interface CurriculumReportPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  reportRequest: AcademicReportRequestDto | null;
  reportTitle: string;
  existingExportJobId?: string | null;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const CurriculumReportPreviewDrawerContent = ({
  open,
  onClose,
  reportRequest,
  reportTitle,
  existingExportJobId,
}: CurriculumReportPreviewDrawerProps) => {
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
    else await handleCreateDownload(reportRequest, true);
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
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Report Preview',
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
              // bgcolor: (t) => alpha(t.palette.common.white, 0.2),
              color: 'inherit',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <Tooltip title="Close">
          <IconButton
            aria-label="Close report preview"
            onClick={onClose}
            size="small"
            sx={{ color: 'inherit', ml: 1 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Tooltip>
      </Box>

      {isPreviewLoading && <LinearProgress sx={{ height: 3, flexShrink: 0 }} />}

      <CurriculumReportPreviewTable
        columns={columns}
        isLoading={isPreviewLoading}
        rows={rows}
        rowsPerPage={rowsPerPage}
      />

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
          // bgcolor: alpha(theme.palette.grey[100], 0.6),
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

const CurriculumReportPreviewDrawer = ({ open, reportRequest, ...props }: CurriculumReportPreviewDrawerProps) =>
  open ? <CurriculumReportPreviewDrawerContent key={JSON.stringify(reportRequest)} open={open} reportRequest={reportRequest} {...props} /> : null;

export default CurriculumReportPreviewDrawer;
