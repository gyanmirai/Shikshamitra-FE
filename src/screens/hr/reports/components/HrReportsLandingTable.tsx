import type {
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import Tab from '@mui/material/Tab';
import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { HrReportExportsTab } from './center/HrReportExportsTab';
import { HrReportSchedulesTab } from './center/HrReportSchedulesTab';
import { HrReportTemplatesTab } from './center/HrReportTemplatesTab';
import { getHrReportsCenterCounts } from '../hr-report-center-utils';
import { HrReportsSummaryCards } from './center/HrReportsSummaryCards';
import { HrReportActiveExportBanner } from './center/HrReportActiveExportBanner';

import type { HrReportPermissions } from '../hr-report-permissions';
import type {
  HrReportsCenterTab,
  HrReportExportAction,
  HrReportScheduleAction,
  HrReportTemplateAction,
  HrReportExportDateFilter,
} from '../hr-report-types';

type HrReportsLandingTableProps = {
  templates: HrReportTemplate[];
  schedules: HrReportSchedule[];
  exportJobs: HrReportExportJob[];
  activeTab: HrReportsCenterTab;
  highlightedExportId?: string | null;
  isLoading: boolean;
  isDownloading: boolean;
  exportActionsDisabled: boolean;
  currentUserId?: string | null;
  onRefreshExports: () => void;
  onTabChange: (tab: HrReportsCenterTab) => void;
  onOpenTemplate: (template: HrReportTemplate) => void;
  onRunTemplate: (template: HrReportTemplate) => void;
  onDownload: (jobId: string, fileName?: string) => void;
  onExportAction: (action: HrReportExportAction, jobId: string) => void;
  onTemplateAction: (action: HrReportTemplateAction, template: HrReportTemplate) => void;
  onScheduleAction: (action: HrReportScheduleAction, schedule: HrReportSchedule) => void;
  permissions: HrReportPermissions;
  exportDateFilter: HrReportExportDateFilter;
  onExportDateFilterChange: (filter: HrReportExportDateFilter) => void;
};

export function HrReportsLandingTable({
  templates,
  schedules,
  exportJobs,
  activeTab,
  highlightedExportId,
  isLoading,
  isDownloading,
  exportActionsDisabled,
  currentUserId,
  onRefreshExports,
  onTabChange,
  onOpenTemplate,
  onRunTemplate,
  onDownload,
  onExportAction,
  onTemplateAction,
  onScheduleAction,
  permissions,
  exportDateFilter,
  onExportDateFilterChange,
}: HrReportsLandingTableProps) {
  const [templateToDelete, setTemplateToDelete] = useState<HrReportTemplate | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<HrReportSchedule | null>(null);
  const [exportToDelete, setExportToDelete] = useState<HrReportExportJob | null>(null);
  const counts = useMemo(
    () => getHrReportsCenterCounts(exportJobs, templates, schedules),
    [exportJobs, schedules, templates]
  );

  useEffect(() => {
    setExportToDelete(null);
  }, [exportDateFilter.fromDate, exportDateFilter.preset, exportDateFilter.toDate]);

  const handleTemplateAction = (action: HrReportTemplateAction, template: HrReportTemplate) => {
    if (action === 'delete') {
      setTemplateToDelete(template);
      return;
    }
    onTemplateAction(action, template);
  };

  const handleScheduleAction = (action: HrReportScheduleAction, schedule: HrReportSchedule) => {
    if (action === 'delete') {
      setScheduleToDelete(schedule);
      return;
    }
    onScheduleAction(action, schedule);
  };

  const handleExportAction = (action: HrReportExportAction, jobId: string) => {
    if (exportActionsDisabled) return;

    if (action === 'delete') {
      setExportToDelete(exportJobs.find((job) => job.id === jobId) ?? null);
      return;
    }
    onExportAction(action, jobId);
  };

  return (
    <Stack spacing={2} data-testid="hr-reports-center">
      <HrReportsSummaryCards {...counts} />

      <CustomTabs
        value={activeTab}
        onChange={(_event, value) => onTabChange(value as HrReportsCenterTab)}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        <Tab data-testid="hr-reports-tab-exports" value="exports" label="Exports" />
        <Tab data-testid="hr-reports-tab-templates" value="templates" label="Templates" />
        <Tab data-testid="hr-reports-tab-schedules" value="schedules" label="Schedules" />
      </CustomTabs>

      {activeTab === 'exports' ? (
        <>
          <HrReportActiveExportBanner
            exportJobs={exportJobs}
            isRefreshing={isLoading}
            onRefresh={onRefreshExports}
          />
          <HrReportExportsTab
            exportJobs={exportJobs}
            highlightedExportId={highlightedExportId}
            isLoading={isLoading}
            isDownloading={isDownloading}
            actionsDisabled={exportActionsDisabled}
            currentUserId={currentUserId}
            permissions={permissions}
            dateFilter={exportDateFilter}
            onDateFilterChange={onExportDateFilterChange}
            onDownload={onDownload}
            onExportAction={handleExportAction}
          />
        </>
      ) : null}

      {activeTab === 'templates' ? (
        <HrReportTemplatesTab
          templates={templates}
          isLoading={isLoading}
          permissions={permissions}
          onOpenTemplate={onOpenTemplate}
          onRunTemplate={onRunTemplate}
          onTemplateAction={handleTemplateAction}
        />
      ) : null}

      {activeTab === 'schedules' ? (
        <HrReportSchedulesTab
          schedules={schedules}
          isLoading={isLoading}
          permissions={permissions}
          onScheduleAction={handleScheduleAction}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(exportToDelete)}
        onClose={() => setExportToDelete(null)}
        title="Remove failed export?"
        icon="warning"
        content={`This removes "${exportToDelete?.reportType ?? 'this failed export'}" from your export history.`}
        action={
          <Button
            color="error"
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            disabled={exportActionsDisabled}
            onClick={() => {
              if (exportActionsDisabled) return;
              if (exportToDelete) {
                onExportAction('delete', exportToDelete.id);
              }
              setExportToDelete(null);
            }}
          >
            Remove Export
          </Button>
        }
      />

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        title="Delete report template?"
        icon="warning"
        content={`This will permanently delete "${templateToDelete?.name ?? 'this template'}".`}
        action={
          <Button
            color="error"
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              if (templateToDelete) {
                onTemplateAction('delete', templateToDelete);
              }
              setTemplateToDelete(null);
            }}
          >
            Delete Template
          </Button>
        }
      />

      <ConfirmDialog
        open={Boolean(scheduleToDelete)}
        onClose={() => setScheduleToDelete(null)}
        title="Delete report schedule?"
        icon="warning"
        content={`This will permanently delete "${scheduleToDelete?.name ?? 'this schedule'}".`}
        action={
          <Button
            color="error"
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              if (scheduleToDelete) {
                onScheduleAction('delete', scheduleToDelete);
              }
              setScheduleToDelete(null);
            }}
          >
            Delete Schedule
          </Button>
        }
      />
    </Stack>
  );
}
