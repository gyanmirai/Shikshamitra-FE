'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useCallback } from 'react';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetHrReportExportsQuery,
  useGetHrReportSourcesQuery,
  useGetHrReportSchedulesQuery,
  useGetHrReportTemplatesQuery,
  usePauseHrReportScheduleMutation,
  useResumeHrReportScheduleMutation,
  useRunHrReportScheduleNowMutation,
  useDownloadHrReportExportMutation,
} from 'src/redux/hr/hrReportsApi';

import { isHrReportExportActive } from './hr-report-utils';
import { HrReportCatalog } from './components/HrReportCatalog';
import { HrReportsLandingTable } from './components/HrReportsLandingTable';
import { type HrReportPermissions, defaultHrReportPermissions } from './hr-report-permissions';

const ReportsScreen = () => {
  const openGenerateReport = useBoolean();
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const { data: sourcesData, isLoading: isLoadingSources } = useGetHrReportSourcesQuery();
  const { data: templatesData, isFetching: isFetchingTemplates } = useGetHrReportTemplatesQuery();
  const { data: schedulesData, isFetching: isFetchingSchedules } = useGetHrReportSchedulesQuery();
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();
  const [pauseSchedule] = usePauseHrReportScheduleMutation();
  const [resumeSchedule] = useResumeHrReportScheduleMutation();
  const [runScheduleNow] = useRunHrReportScheduleNowMutation();

  const {
    data: exportJobs = [],
    refetch: refetchExports,
    isFetching: isFetchingExports,
  } = useGetHrReportExportsQuery(undefined, { pollingInterval: 5000 });

  const sources = useMemo(() => sourcesData?.sources ?? [], [sourcesData?.sources]);
  const templates = useMemo(() => templatesData?.items ?? [], [templatesData?.items]);
  const schedules = useMemo(() => schedulesData?.items ?? [], [schedulesData?.items]);
  const hasActiveExports = useMemo(() => exportJobs.some(isHrReportExportActive), [exportJobs]);
  const reportPermissions = useMemo<HrReportPermissions>(() => {
    if (!permissionsInitialized) return defaultHrReportPermissions;

    return {
      canView: hasGrantedPermission(permissions, hrPermissions.reportActions.view),
      canBuild: hasGrantedPermission(permissions, hrPermissions.reportActions.build),
      canExport: hasGrantedPermission(permissions, hrPermissions.reportActions.export),
      canSchedule: hasGrantedPermission(permissions, hrPermissions.reportActions.schedule),
      canManageTemplates: hasGrantedPermission(
        permissions,
        hrPermissions.reportActions.manageTemplates
      ),
      canDelete: hasGrantedPermission(permissions, hrPermissions.reportActions.delete),
      canShare: hasGrantedPermission(permissions, hrPermissions.reportActions.share),
    };
  }, [permissions, permissionsInitialized]);

  const handleDownload = useCallback(
    async (jobId: string, fileName?: string) => {
      const blob = await downloadExport(jobId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'hr-report';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [downloadExport]
  );

  const handleScheduleAction = useCallback(
    async (action: 'pause' | 'resume' | 'runNow', scheduleId: string) => {
      if (action === 'pause') {
        await pauseSchedule(scheduleId).unwrap();
      } else if (action === 'resume') {
        await resumeSchedule(scheduleId).unwrap();
      } else {
        await runScheduleNow(scheduleId).unwrap();
        await refetchExports();
      }
    },
    [pauseSchedule, refetchExports, resumeSchedule, runScheduleNow]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={openGenerateReport.value ? 'Generate Report' : 'Reports Center'}
        description={
          openGenerateReport.value
            ? 'Configure, preview, save, publish, and export HR reports.'
            : 'Generate and view HR reports across employee, payroll, attendance, leave, policy, and performance data.'
        }
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports Center' }]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          !openGenerateReport.value ? (
            <Button
              data-testid="hr-reports-generate-button"
              variant="contained"
              size="small"
              onClick={openGenerateReport.onTrue}
              startIcon={<Iconify icon={GlobalIcons.report} />}
            >
              {reportPermissions.canBuild ? 'Generate Report' : 'View Reports'}
            </Button>
          ) : null
        }
        sx={{ px: 2 }}
      />

      <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
        {openGenerateReport.value ? (
          <HrReportCatalog
            sources={sources}
            templates={templates}
            exportJobs={exportJobs}
            isLoadingSources={isLoadingSources}
            isFetchingExports={isFetchingExports && hasActiveExports}
            refetchExports={refetchExports}
            permissions={reportPermissions}
          />
        ) : (
          <HrReportsLandingTable
            templates={templates}
            schedules={schedules}
            exportJobs={exportJobs}
            isLoading={isFetchingExports || isFetchingTemplates || isFetchingSchedules}
            isDownloading={isDownloading}
            onGenerateReport={openGenerateReport.onTrue}
            onDownload={handleDownload}
            onScheduleAction={handleScheduleAction}
            permissions={reportPermissions}
          />
        )}
      </Box>
    </Box>
  );
};

export default ReportsScreen;
