'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicReportExportJobResponse } from 'src/redux/academicAPI/AcademicReportApi';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, Tooltip, IconButton } from '@mui/material';
import { CurriculumReportApiTypeMap } from 'src/enums/curriuculum-reports';
import {
  useGetAcademicReportExportsQuery,
  useLazyGetAcademicReportExportJobQuery,
} from 'src/redux/academicAPI/AcademicReportApi';

import CurriculumReports from './CurriculumReports';
import { startAcademicReportDownload } from './ai-report-utils';
import ShikshaMitraAiReportDrawer from './ShikshaMitraAiReportDrawer';
import CurriculumReportPreviewDrawer from './CurriculumReportPreviewDrawer';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  Queued: 'default',
  Processing: 'warning',
  Completed: 'success',
  Failed: 'error',
};

const CurriculumReportList = () => {
  const addReportDialog = useBoolean(false);
  const aiReportDialog = useBoolean(false);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(permissions, `${academicPermissions.curriculum.reports}.Add`);

  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: exportsData, isLoading: isExportsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicReportExportsQuery,
    popupConfig: { error: true, errorMessage: 'Failed to load export history' },
  });

  const [pollJobStatus] = useLazyGetAcademicReportExportJobQuery();

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const handleDownload = useCallback(
    async (jobId: string, currentStatus: string) => {
      if (downloadingJobId) return;

      if (currentStatus === 'Completed') {
        setDownloadingJobId(jobId);
        try {
          startAcademicReportDownload(jobId);
        } catch (error: unknown) {
          shikshaMitraToast.error({
            message:
              error instanceof Error ? error.message : 'Download failed. Please try again.',
          });
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
              startAcademicReportDownload(jobId);
            } catch (error: unknown) {
              shikshaMitraToast.error({
                message:
                  error instanceof Error ? error.message : 'Download failed. Please try again.',
              });
            } finally {
              setDownloadingJobId(null);
            }
          } else if (status === 'Failed') {
            stopPolling();
            setDownloadingJobId(null);
            shikshaMitraToast.error({
              message: statusResult.data.errorMessage || 'Export job failed',
            });
          }
        } catch {
          // transient error — retry on next tick
        }
      }, 2000);
    },
    [downloadingJobId, pollJobStatus, stopPolling]
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExportJobId, setPreviewExportJobId] = useState<string | null>(null);
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
      setPreviewExportJobId(row.status === 'Completed' ? row.id : null);
      setSelectedReportTitle(row.reportType);
      setPreviewOpen(true);
    } catch (e) {
      shikshaMitraToast.error({ message: 'Failed to parse report parameters.' });
    }
  };

  const rows = useMemo(() => {
    const allExports: AcademicReportExportJobResponse[] = Array.isArray(exportsData)
      ? exportsData
      : [];
    const curriculumReportTypes: string[] = Object.values(CurriculumReportApiTypeMap);
    return allExports.filter(
      (job) =>
        curriculumReportTypes.includes(job.reportType) ||
        (job.isDynamic && job.module === 'Curriculum')
    );
  }, [exportsData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Reports"
          description="View and manage generated curriculum reports"
          links={[
            { name: 'Academic', href: '/academic/dashboard/' },
            { name: 'Curriculum' },
            { name: 'Reports' },
          ]}
          action={
            canAdd ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addReportDialog.onTrue}
                >
                  Report
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
                  onClick={aiReportDialog.onTrue}
                >
                  Generate report using ShikshaMitra AI
                </Button>
              </Box>
            ) : null
          }
        />
      )}

      {addReportDialog.value && canAdd ? (
        <CurriculumReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="curriculum-reports"
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
                    {!row.isDynamic && (
                      <Tooltip title="View">
                        <span>
                          <IconButton size="small" onClick={() => handleView(row)} sx={{ mr: 0.5 }}>
                            <Iconify icon={GlobalIcons.eye} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
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
        existingExportJobId={previewExportJobId}
      />
      <ShikshaMitraAiReportDrawer open={aiReportDialog.value} onClose={aiReportDialog.onFalse} />
    </Box>
  );
};

export default CurriculumReportList;
