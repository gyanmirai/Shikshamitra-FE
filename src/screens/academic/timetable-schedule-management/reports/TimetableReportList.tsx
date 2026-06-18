'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, Tooltip, IconButton } from '@mui/material';
import { TimetableReportApiTypeMap } from 'src/enums/timetable-reports';
import CurriculumReportPreviewDrawer from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewDrawer';
import {
  useGetAcademicReportExportsQuery,
  useLazyDownloadAcademicReportQuery,
  useLazyGetAcademicReportExportJobQuery,
} from 'src/redux/academicAPI/AcademicReportApi';

import TimetableReports from './TimetableReports';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  Queued: 'default',
  Processing: 'warning',
  Completed: 'success',
  Failed: 'error',
};

const TimetableReportList = () => {
  const addReportDialog = useBoolean(false);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(permissions, `${academicPermissions.timetable.reports}.Add`);

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
          // transient error — retry on next tick
        }
      }, 2000);
    },
    [downloadingJobId, pollJobStatus, saveFile, stopPolling, triggerDownload]
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReportRequest, setSelectedReportRequest] = useState<any>(null);
  const [selectedReportTitle, setSelectedReportTitle] = useState('');

  const handleView = (row: any) => {
    try {
      let requestPayload: any = {};
      if (row.requestJson && row.requestJson !== '{}') {
        requestPayload = JSON.parse(row.requestJson);
      }
      if (!requestPayload.reportType) {
        requestPayload.reportType = row.reportType;
      }
      if (!requestPayload.filters) {
        requestPayload.filters = {};
      }
      setSelectedReportRequest(requestPayload);
      setSelectedReportTitle(row.reportType);
      setPreviewOpen(true);
    } catch (e) {
      toast.error('Failed to parse report parameters.');
    }
  };

  const rows = useMemo(() => {
    const allExports = Array.isArray(exportsData) ? exportsData : [];
    const timetableReportTypes = Object.values(TimetableReportApiTypeMap);
    return allExports.filter((job: any) => timetableReportTypes.includes(job.reportType));
  }, [exportsData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          description="View and manage generated timetable reports"
          links={[
            { name: 'Academic', href: '/academic/dashboard/' },
            {
              name: 'Timetable',
            },
            { name: 'Reports' },
          ]}
          action={
            canAdd ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={addReportDialog.onTrue}
              >
                Add Report
              </Button>
            ) : null
          }
        />
      )}

      {addReportDialog.value ? (
        <TimetableReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="timetable-reports"
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
              minWidth: '80px',
              align: 'center',
              isFilter: false,
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              render(value, row) {
                if (!canAdd) return null;
                const isThisDownloading = downloadingJobId === value;
                const canDownload =
                  row.status === 'Completed' ||
                  row.status === 'Queued' ||
                  row.status === 'Processing';
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tooltip title="View">
                      <span>
                        <IconButton size="small" onClick={() => handleView(row)} sx={{ mr: 0.5 }}>
                          <Iconify icon={GlobalIcons.eye} />
                        </IconButton>
                      </span>
                    </Tooltip>
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
                  </Box>
                );
              },
            },
          ]}
        />
      )}
      <CurriculumReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={selectedReportRequest}
        reportTitle={selectedReportTitle}
      />
    </Box>
  );
};

export default TimetableReportList;
