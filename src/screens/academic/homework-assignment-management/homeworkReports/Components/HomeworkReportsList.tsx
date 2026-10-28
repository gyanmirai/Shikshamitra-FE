'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { HomeworkReportApiTypeMap } from 'src/enums/homework-wise-reports';
import { AssignmentReportApiTypeMap } from 'src/enums/assignment-wise-report';
import { Box, Chip, Stack, Button, Tooltip, IconButton } from '@mui/material';
import {
  useGetAcademicReportExportsQuery,
} from 'src/redux/academicAPI/AcademicReportApi';
import { HomeworkAssignmentAnalyticReportApiTypeMap } from 'src/enums/homeworkAssignmentAnalytic-report';
import { useAcademicReportDownload } from 'src/screens/academic/components/reports/useAcademicReportDownload';
import CurriculumReportPreviewDrawer from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewDrawer';

import HomeworkAssignmentReports from '..';
import { HomeworkAssignmentAiReportButton } from './HomeworkAssignmentAiReportButton';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  Queued: 'default',
  Processing: 'warning',
  Completed: 'success',
  Failed: 'error',
};

const HomeworkReportsList = () => {
  const addReportDialog = useBoolean(false);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(permissions, `${academicPermissions.homework.reports}.Add`);

  const { downloadingJobId, handleDownload } = useAcademicReportDownload();

  const { data: exportsData, isLoading: isExportsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicReportExportsQuery,
    popupConfig: { error: true, errorMessage: 'Failed to load export history' },
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReportRequest, setSelectedReportRequest] = useState<any>(null);
  const [selectedReportTitle, setSelectedReportTitle] = useState('');
  const [previewExportJobId, setPreviewExportJobId] = useState<string | null>(null);

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
      setPreviewExportJobId(row.status === 'Completed' && String(row.format || 'pdf').toLowerCase() === 'pdf' ? row.id : null);
      setSelectedReportTitle(row.reportType);
      setPreviewOpen(true);
    } catch (e) {
      toast.error('Failed to parse report parameters.');
    }
  };

  const rows = useMemo(() => {
    const allExports = Array.isArray(exportsData) ? exportsData : [];
    const homeworkReportTypes = Object.values(HomeworkReportApiTypeMap);
    const assignmentReportTypes = Object.values(AssignmentReportApiTypeMap);
    const analyticsReportTypes = Object.values(HomeworkAssignmentAnalyticReportApiTypeMap);

    return allExports.filter(
      (job: any) =>
        homeworkReportTypes.includes(job.reportType) ||
        assignmentReportTypes.includes(job.reportType) ||
        analyticsReportTypes.includes(job.reportType) ||
        (job.isDynamic && job.module === 'Homework & Assignment')
    );
  }, [exportsData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Reports"
          description="Review generated homework, assignment, and analytics reports."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment' },
            { name: 'Reports' },
          ]}
          action={
            canAdd ? (
              <Stack direction="row" spacing={1}>
                <HomeworkAssignmentAiReportButton />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addReportDialog.onTrue}
                  sx={{ px: '32px' }}
                >
                  Add Report
                </Button>
              </Stack>
            ) : null
          }
        />
      )}

      {addReportDialog.value ? (
        <HomeworkAssignmentReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableTitle="Learning Task Reports"
          noDataText="No generated reports yet."
          tableId="homeworkReportsList"
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
          isSearch
          isFilter
          tableContainerProps={{ sx: { height: '100%' } }}
        />
      )}
      <CurriculumReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={selectedReportRequest}
        reportTitle={selectedReportTitle}
        existingExportJobId={previewExportJobId}
      />
    </Box>
  );
};

export default HomeworkReportsList;
