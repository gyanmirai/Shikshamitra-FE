'use client';

import dayjs from 'dayjs';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useGetHrReportExportsQuery,
  useGetHrReportSourcesQuery,
  useGetHrReportSchedulesQuery,
  useGetHrReportTemplatesQuery,
} from 'src/redux/hr/hrReportsApi';

import { hrReportToast } from './hr-report-notifications';
import { HrReportCatalog } from './components/HrReportCatalog';
import { HrReportsLandingTable } from './components/HrReportsLandingTable';
import { useHrReportsCenterActions } from './hooks/useHrReportsCenterActions';
import { getHrReportFormatLabel, isHrReportExportActive } from './hr-report-utils';
import { useHrReportExportPollingGuard } from './hooks/useHrReportExportPollingGuard';
import { HrReportRunTemplateDialog } from './components/center/HrReportRunTemplateDialog';
import { HrReportShareExportDialog } from './components/center/HrReportShareExportDialog';
import { useHrReportPermissions, useHrReportCurrentUserId } from './hooks/useHrReportPermissions';

import type {
  HrReportsCenterTab,
  HrReportCatalogSelection,
  HrReportExportDateFilter,
} from './hr-report-types';

const ALL_EXPORT_DATES: HrReportExportDateFilter = {
  preset: 'all',
  fromDate: '',
  toDate: '',
};

const buildExportDateParams = (filter: HrReportExportDateFilter) => {
  const tomorrow = dayjs().add(1, 'day').startOf('day');
  if (filter.preset === 'today') {
    return {
      requestedFrom: dayjs().startOf('day').toISOString(),
      requestedTo: tomorrow.toISOString(),
    };
  }
  if (filter.preset === 'last7Days' || filter.preset === 'last30Days') {
    const days = filter.preset === 'last7Days' ? 7 : 30;
    return {
      requestedFrom: dayjs()
        .subtract(days - 1, 'day')
        .startOf('day')
        .toISOString(),
      requestedTo: tomorrow.toISOString(),
    };
  }
  if (filter.preset === 'custom') {
    if (filter.fromDate && filter.toDate && filter.toDate < filter.fromDate) {
      return {};
    }
    return {
      requestedFrom: filter.fromDate
        ? dayjs(filter.fromDate).startOf('day').toISOString()
        : undefined,
      requestedTo: filter.toDate
        ? dayjs(filter.toDate).add(1, 'day').startOf('day').toISOString()
        : undefined,
    };
  }
  return {};
};

const ReportsScreen = () => {
  const openGenerateReport = useBoolean();
  const [directSelection, setDirectSelection] = useState<HrReportCatalogSelection | null>(null);
  const [activeCenterTab, setActiveCenterTab] = useState<HrReportsCenterTab>('exports');
  const [exportDateFilter, setExportDateFilter] =
    useState<HrReportExportDateFilter>(ALL_EXPORT_DATES);
  const [notifiedExportIds, setNotifiedExportIds] = useState<string[]>([]);
  const { shouldPollExports, highlightedExportId, highlightExportJob, observeExports } =
    useHrReportExportPollingGuard();
  const reportPermissions = useHrReportPermissions();
  const currentUserId = useHrReportCurrentUserId();
  const { data: sourcesData, isLoading: isLoadingSources } = useGetHrReportSourcesQuery();
  const { data: templatesData, isFetching: isFetchingTemplates } = useGetHrReportTemplatesQuery();
  const { data: schedulesData, isFetching: isFetchingSchedules } = useGetHrReportSchedulesQuery();

  const exportDateParams = useMemo(
    () => buildExportDateParams(exportDateFilter),
    [exportDateFilter]
  );
  const isExportDateRangeInvalid =
    exportDateFilter.preset === 'custom' &&
    Boolean(
      exportDateFilter.fromDate &&
      exportDateFilter.toDate &&
      exportDateFilter.toDate < exportDateFilter.fromDate
    );
  const {
    currentData: currentExportJobs,
    refetch: refetchExports,
    isFetching: isFetchingExports,
    fulfilledTimeStamp: exportsFulfilledTimeStamp,
  } = useGetHrReportExportsQuery(exportDateParams, {
    pollingInterval: shouldPollExports ? 5000 : 0,
    skip: isExportDateRangeInvalid,
  });
  const exportJobs = useMemo(
    () => (isExportDateRangeInvalid ? [] : (currentExportJobs ?? [])),
    [currentExportJobs, isExportDateRangeInvalid]
  );
  const exportActionsDisabled =
    isExportDateRangeInvalid || isFetchingExports || currentExportJobs === undefined;

  const sources = useMemo(() => sourcesData?.sources ?? [], [sourcesData?.sources]);
  const templates = useMemo(() => templatesData?.items ?? [], [templatesData?.items]);
  const schedules = useMemo(() => schedulesData?.items ?? [], [schedulesData?.items]);
  const hasActiveExports = useMemo(() => exportJobs.some(isHrReportExportActive), [exportJobs]);
  const revealQueuedExport = useCallback(
    (jobId: string) => {
      setExportDateFilter(ALL_EXPORT_DATES);
      highlightExportJob(jobId);
    },
    [highlightExportJob]
  );
  const actions = useHrReportsCenterActions({
    sources,
    exportJobs,
    setActiveCenterTab,
    setDirectSelection,
    highlightExportJob: revealQueuedExport,
    refetchExports,
    openGenerateReport: openGenerateReport.onTrue,
    closeGenerateReport: openGenerateReport.onFalse,
  });

  useEffect(() => {
    observeExports({ exportJobs, fulfilledTimeStamp: exportsFulfilledTimeStamp });
  }, [exportJobs, exportsFulfilledTimeStamp, observeExports]);

  useEffect(() => {
    const highlightedJob = exportJobs.find((job) => job.id === highlightedExportId);
    if (!highlightedJob || notifiedExportIds.includes(highlightedJob.id)) {
      return;
    }

    if (highlightedJob.status === 'Completed' && !highlightedJob.isExpired) {
      hrReportToast.success(
        `${getHrReportFormatLabel(highlightedJob.format)} export is ready to download.`
      );
      setNotifiedExportIds((current) => [...current, highlightedJob.id]);
    } else if (highlightedJob.status === 'Failed') {
      hrReportToast.error(
        highlightedJob.errorMessage || 'Export failed. You can retry it from Exports.'
      );
      setNotifiedExportIds((current) => [...current, highlightedJob.id]);
    } else if (highlightedJob.status === 'Cancelled') {
      hrReportToast.warning('Export was cancelled.');
      setNotifiedExportIds((current) => [...current, highlightedJob.id]);
    }
  }, [exportJobs, highlightedExportId, notifiedExportIds]);

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
        onBack={actions.handleBack}
        action={
          !openGenerateReport.value ? (
            <Button
              data-testid="hr-reports-generate-button"
              variant="contained"
              size="small"
              onClick={actions.handleGenerateReport}
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
            isLoadingSources={isLoadingSources}
            isFetchingExports={isFetchingExports && hasActiveExports}
            refetchExports={refetchExports}
            permissions={reportPermissions}
            directSelection={directSelection}
            onExportQueued={actions.handleExportQueued}
          />
        ) : (
          <HrReportsLandingTable
            templates={templates}
            schedules={schedules}
            exportJobs={exportJobs}
            activeTab={activeCenterTab}
            highlightedExportId={highlightedExportId}
            isLoading={isFetchingExports || isFetchingTemplates || isFetchingSchedules}
            isDownloading={actions.isDownloading}
            exportActionsDisabled={exportActionsDisabled}
            currentUserId={currentUserId}
            onRefreshExports={refetchExports}
            onTabChange={setActiveCenterTab}
            onOpenTemplate={actions.handleOpenTemplate}
            onRunTemplate={actions.handleRunTemplate}
            onDownload={actions.handleDownload}
            onExportAction={actions.handleExportAction}
            onTemplateAction={actions.handleTemplateAction}
            onScheduleAction={actions.handleScheduleAction}
            permissions={reportPermissions}
            exportDateFilter={exportDateFilter}
            onExportDateFilterChange={setExportDateFilter}
          />
        )}
      </Box>

      <HrReportRunTemplateDialog
        open={Boolean(actions.templateToRun)}
        template={actions.templateToRun}
        isSubmitting={actions.isRunningTemplateExport}
        onClose={() => actions.setTemplateToRun(null)}
        onSubmit={actions.handleQueueTemplateExport}
      />
      <HrReportShareExportDialog
        open={Boolean(actions.shareExportJob)}
        job={actions.shareExportJob}
        isSubmitting={actions.isSharingExport}
        onClose={() => actions.setShareExportJobId(null)}
        onSubmit={actions.handleShareExport}
      />
    </Box>
  );
};

export default ReportsScreen;
