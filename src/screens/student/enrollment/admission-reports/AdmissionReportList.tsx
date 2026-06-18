'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useRef, useState, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, Tooltip, IconButton } from '@mui/material';
import {
  useGetAcademicReportExportsQuery,
  useLazyDownloadAcademicReportQuery,
  useLazyGetAcademicReportExportJobQuery,
} from 'src/redux/academicAPI/AcademicReportApi';

import AdmissionReports from './AdmissionReports';

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  Queued: 'default',
  Processing: 'warning',
  Completed: 'success',
  Failed: 'error',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdmissionReportList = () => {
  const addReportDialog = useBoolean(false);

  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: exportsData, isLoading: isExportsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicReportExportsQuery,
    popupConfig: { error: true, errorMessage: 'Failed to load export history' },
  });

  const [pollJobStatus] = useLazyGetAcademicReportExportJobQuery();
  const [triggerDownload] = useLazyDownloadAcademicReportQuery();

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

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

  const handleDownload = useCallback(
    async (jobId: string, currentStatus: string) => {
      if (downloadingJobId) return;

      if (currentStatus === 'Completed') {
        setDownloadingJobId(jobId);
        try {
          const dlResult = await triggerDownload({ jobId }, false);
          if ('data' in dlResult && dlResult.data?.bytes) {
            saveFile(dlResult.data);
          }
        } catch {
          toast.error('Download failed. Please try again.');
        } finally {
          setDownloadingJobId(null);
        }
        return;
      }

      setDownloadingJobId(jobId);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusResult = await pollJobStatus({ jobId }, false);
          if (!('data' in statusResult) || !statusResult.data) return;

          const { status } = statusResult.data;
          if (status === 'Completed') {
            stopPolling();
            try {
              const dlResult = await triggerDownload({ jobId }, false);
              if ('data' in dlResult && dlResult.data?.bytes) {
                saveFile(dlResult.data);
              }
            } catch {
              toast.error('Download failed. Please try again.');
            } finally {
              setDownloadingJobId(null);
            }
          } else if (status === 'Failed') {
            stopPolling();
            setDownloadingJobId(null);
            toast.error(statusResult.data.errorMessage || 'Export job failed');
          }
        } catch {
          // Transient error — retry on next tick
        }
      }, 2000);
    },
    [downloadingJobId, pollJobStatus, saveFile, stopPolling, triggerDownload]
  );

  const rows = Array.isArray(exportsData) ? exportsData : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Admission Reports"
          description="View and manage generated admission reports"
          links={[
            { name: 'Student', href: '/student/dashboard/' },
            { name: 'Enrollment' },
            { name: 'Admission Reports' },
          ]}
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={addReportDialog.onTrue}
            >
              Generate Report
            </Button>
          }
        />
      )}

      {addReportDialog.value ? (
        <AdmissionReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="admission-reports"
          isLoading={isExportsLoading}
          data={rows}
          columns={[
            {
              label: 'Report Type',
              id: 'reportType',
              minWidth: '180px',
              align: 'left',
              sticky: true,
            },
            {
              label: 'Format',
              id: 'format',
              minWidth: '80px',
              align: 'left',
            },
            {
              label: 'Status',
              id: 'status',
              minWidth: '110px',
              align: 'left',
              render(value) {
                const color = STATUS_COLOR[value] ?? 'default';
                return <Chip label={value ?? '—'} size="small" color={color} variant="soft" />;
              },
            },
            {
              label: 'File Name',
              id: 'fileName',
              minWidth: '200px',
              align: 'left',
              render(value) {
                return value ?? '—';
              },
            },
            {
              label: 'Created At',
              id: 'creationTime',
              minWidth: '150px',
              align: 'left',
              filterType: 'dateTime',
              render(value) {
                return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
              },
            },
            {
              label: 'Completed At',
              id: 'completedAt',
              minWidth: '150px',
              align: 'left',
              filterType: 'dateTime',
              render(value) {
                return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
              },
            },
            {
              label: 'Expires At',
              id: 'expiresAt',
              minWidth: '150px',
              align: 'left',
              filterType: 'dateTime',
              render(value) {
                return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
              },
            },
            {
              label: 'Action',
              id: 'id',
              minWidth: '60px',
              align: 'center',
              isFilter: false,
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              render(value, row) {
                const isThisDownloading = downloadingJobId === value;
                const canDownload =
                  row.status === 'Completed' ||
                  row.status === 'Queued' ||
                  row.status === 'Processing';
                return (
                  <Tooltip
                    title={
                      row.status === 'Failed'
                        ? (row.errorMessage ?? 'Export failed')
                        : isThisDownloading
                          ? 'Downloading...'
                          : 'Download'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canDownload || !!downloadingJobId}
                        onClick={() => handleDownload(value, row.status)}
                      >
                        <Iconify
                          icon={
                            isThisDownloading
                              ? 'eos-icons:loading'
                              : row.status === 'Failed'
                                ? 'mdi:alert-circle-outline'
                                : GlobalIcons.report
                          }
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                );
              },
            },
          ]}
        />
      )}
    </Box>
  );
};

export default AdmissionReportList;
