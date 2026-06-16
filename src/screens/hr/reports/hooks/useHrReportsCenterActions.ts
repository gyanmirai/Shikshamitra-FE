import type { Dispatch, SetStateAction } from 'react';
import type {
  HrReportSource,
  HrReportFormat,
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
  HrReportRecipient,
} from 'src/redux/hr/hrReportsApi';

import { useMemo, useState, useCallback } from 'react';
import {
  useShareHrReportExportMutation,
  useRetryHrReportExportMutation,
  useCreateHrReportExportMutation,
  useCancelHrReportExportMutation,
  usePauseHrReportScheduleMutation,
  useUpdateHrReportTemplateMutation,
  useDeleteHrReportTemplateMutation,
  useResumeHrReportScheduleMutation,
  useDeleteHrReportScheduleMutation,
  useRunHrReportScheduleNowMutation,
  useDownloadHrReportExportMutation,
  useRegenerateHrReportExportMutation,
  useDuplicateHrReportTemplateMutation,
} from 'src/redux/hr/hrReportsApi';

import { hrReportToast } from '../hr-report-notifications';
import { getHrReportExportFileName } from '../hr-report-utils';
import {
  isHrReportRefetchErrorResult,
  buildHrReportTemplateExportRequest,
} from '../hr-report-center-utils';

import type {
  HrReportsCenterTab,
  HrReportQueuedExport,
  HrReportExportAction,
  HrReportScheduleAction,
  HrReportTemplateAction,
  HrReportCatalogSelection,
} from '../hr-report-types';

type UseHrReportsCenterActionsInput = {
  sources: HrReportSource[];
  exportJobs: HrReportExportJob[];
  setActiveCenterTab: (tab: HrReportsCenterTab) => void;
  setDirectSelection: Dispatch<SetStateAction<HrReportCatalogSelection | null>>;
  highlightExportJob: (jobId: string) => void;
  refetchExports: () => unknown;
  openGenerateReport: () => void;
  closeGenerateReport: () => void;
};

const createObjectUrl = (blob: Blob) => window.URL.createObjectURL(blob);

const runCenterAction = async (action: () => Promise<void>, errorMessage: string) => {
  try {
    await action();
    return true;
  } catch {
    hrReportToast.error(errorMessage);
    return false;
  }
};

export function useHrReportsCenterActions({
  sources,
  exportJobs,
  setActiveCenterTab,
  setDirectSelection,
  highlightExportJob,
  refetchExports,
  openGenerateReport,
  closeGenerateReport,
}: UseHrReportsCenterActionsInput) {
  const [templateToRun, setTemplateToRun] = useState<HrReportTemplate | null>(null);
  const [shareExportJobId, setShareExportJobId] = useState<string | null>(null);
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();
  const [createTemplateExport, { isLoading: isRunningTemplateExport }] =
    useCreateHrReportExportMutation();
  const [shareExport, { isLoading: isSharingExport }] = useShareHrReportExportMutation();
  const [cancelExport] = useCancelHrReportExportMutation();
  const [retryExport] = useRetryHrReportExportMutation();
  const [regenerateExport] = useRegenerateHrReportExportMutation();
  const [duplicateTemplate] = useDuplicateHrReportTemplateMutation();
  const [updateTemplate] = useUpdateHrReportTemplateMutation();
  const [deleteTemplate] = useDeleteHrReportTemplateMutation();
  const [pauseSchedule] = usePauseHrReportScheduleMutation();
  const [resumeSchedule] = useResumeHrReportScheduleMutation();
  const [runScheduleNow] = useRunHrReportScheduleNowMutation();
  const [deleteSchedule] = useDeleteHrReportScheduleMutation();

  const shareExportJob = useMemo(
    () => exportJobs.find((job) => job.id === shareExportJobId) ?? null,
    [exportJobs, shareExportJobId]
  );

  const refreshExportsWithWarning = useCallback(
    async (message: string) => {
      try {
        const refreshResult = await Promise.resolve(refetchExports());
        if (isHrReportRefetchErrorResult(refreshResult)) {
          throw new Error('Export history refresh failed.');
        }
      } catch {
        hrReportToast.warning(message);
      }
    },
    [refetchExports]
  );

  const handleDownload = useCallback(
    async (jobId: string, fileName?: string) => {
      await runCenterAction(async () => {
        const blob = await downloadExport(jobId).unwrap();
        const url = createObjectUrl(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'hr-report';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 'Export could not be downloaded. Refresh and try again.');
    },
    [downloadExport]
  );

  const handleScheduleAction = useCallback(
    async (action: HrReportScheduleAction, schedule: HrReportSchedule) => {
      if (action === 'pause') {
        await runCenterAction(async () => {
          await pauseSchedule(schedule.id).unwrap();
          hrReportToast.success('Schedule paused');
        }, 'Schedule could not be paused. Refresh and try again.');
      } else if (action === 'resume') {
        await runCenterAction(async () => {
          await resumeSchedule(schedule.id).unwrap();
          hrReportToast.success('Schedule resumed');
        }, 'Schedule could not be resumed. Refresh and try again.');
      } else if (action === 'runNow') {
        await runCenterAction(async () => {
          const run = await runScheduleNow(schedule.id).unwrap();
          highlightExportJob(run.jobId);
          setActiveCenterTab('exports');
          await refreshExportsWithWarning(
            'Schedule run queued, but exports could not refresh. It will update on the next poll or manual refresh.'
          );
          hrReportToast.success('Schedule run queued');
        }, 'Schedule run could not be queued. Refresh and try again.');
      } else {
        await runCenterAction(async () => {
          await deleteSchedule(schedule.id).unwrap();
          hrReportToast.success('Schedule deleted');
        }, 'Schedule could not be deleted. Refresh and try again.');
      }
    },
    [
      deleteSchedule,
      highlightExportJob,
      pauseSchedule,
      refreshExportsWithWarning,
      resumeSchedule,
      runScheduleNow,
      setActiveCenterTab,
    ]
  );

  const handleExportAction = useCallback(
    async (action: HrReportExportAction, jobId: string) => {
      if (action === 'share') {
        setShareExportJobId(jobId);
        return;
      }

      let actionSucceeded = false;
      if (action === 'cancel') {
        actionSucceeded = await runCenterAction(async () => {
          await cancelExport(jobId).unwrap();
          hrReportToast.success('Export cancelled');
        }, 'Export could not be cancelled. Refresh and try again.');
      } else if (action === 'retry') {
        actionSucceeded = await runCenterAction(async () => {
          const retry = await retryExport(jobId).unwrap();
          highlightExportJob(retry.jobId);
          hrReportToast.success('Export retry queued');
        }, 'Export retry could not be queued. Refresh and try again.');
      } else {
        actionSucceeded = await runCenterAction(async () => {
          const regenerated = await regenerateExport(jobId).unwrap();
          highlightExportJob(regenerated.jobId);
          hrReportToast.success('Export regeneration queued');
        }, 'Export regeneration could not be queued. Refresh and try again.');
      }

      if (!actionSucceeded) {
        return;
      }

      await refreshExportsWithWarning(
        'Export action completed, but exports could not refresh. Use Refresh to check again.'
      );
    },
    [cancelExport, highlightExportJob, refreshExportsWithWarning, regenerateExport, retryExport]
  );

  const handleShareExport = useCallback(
    async (recipients: HrReportRecipient[]) => {
      if (!shareExportJob) {
        return;
      }

      try {
        await shareExport({
          jobId: shareExportJob.id,
          userIds: recipients.map((recipient) => recipient.id),
        }).unwrap();
        setShareExportJobId(null);
        hrReportToast.success('Export shared');
        await refreshExportsWithWarning(
          'Export shared, but exports could not refresh. Use Refresh to check again.'
        );
      } catch {
        hrReportToast.error('Export could not be shared.');
      }
    },
    [refreshExportsWithWarning, shareExport, shareExportJob]
  );

  const handleTemplateAction = useCallback(
    async (action: HrReportTemplateAction, template: HrReportTemplate) => {
      if (action === 'duplicate') {
        await runCenterAction(async () => {
          await duplicateTemplate(template.id).unwrap();
          hrReportToast.success('Template duplicated');
        }, 'Template could not be duplicated. Refresh and try again.');
      } else if (action === 'delete') {
        await runCenterAction(async () => {
          await deleteTemplate(template.id).unwrap();
          hrReportToast.success('Template deleted');
        }, 'Template could not be deleted. Refresh and try again.');
      } else {
        const status = action === 'publish' ? 'Published' : 'Draft';
        await runCenterAction(async () => {
          await updateTemplate({
            id: template.id,
            body: {
              name: template.name,
              description: template.description,
              category: template.category,
              dataSource: template.dataSource,
              visibility: action === 'publish' ? 'organization' : 'private',
              status,
              definition: template.definition,
            },
          }).unwrap();
          hrReportToast.success(
            action === 'publish' ? 'Template published' : 'Template moved to draft'
          );
        }, 'Template could not be updated. Refresh and try again.');
      }
    },
    [deleteTemplate, duplicateTemplate, updateTemplate]
  );

  const handleRunTemplate = useCallback((template: HrReportTemplate) => {
    setTemplateToRun(template);
  }, []);

  const handleQueueTemplateExport = useCallback(
    async (format: HrReportFormat) => {
      if (!templateToRun) {
        return;
      }

      try {
        const result = await createTemplateExport(
          buildHrReportTemplateExportRequest(templateToRun, format)
        ).unwrap();
        highlightExportJob(result.jobId);
        setActiveCenterTab('exports');
        setTemplateToRun(null);
        hrReportToast.success('Template report queued. Track it in Exports.');
        await refreshExportsWithWarning(
          'Template report queued, but exports could not refresh. It will update on the next poll or manual refresh.'
        );
      } catch {
        hrReportToast.error('Template report could not be queued.');
      }
    },
    [
      createTemplateExport,
      highlightExportJob,
      refreshExportsWithWarning,
      setActiveCenterTab,
      templateToRun,
    ]
  );

  const handleExportQueued = useCallback(
    (exportJob: HrReportQueuedExport) => {
      highlightExportJob(exportJob.jobId);
      setActiveCenterTab('exports');
      setDirectSelection(null);
      closeGenerateReport();
    },
    [closeGenerateReport, highlightExportJob, setActiveCenterTab, setDirectSelection]
  );

  const handleGenerateReport = useCallback(() => {
    setDirectSelection(null);
    openGenerateReport();
  }, [openGenerateReport, setDirectSelection]);

  const handleOpenTemplate = useCallback(
    (template: HrReportTemplate) => {
      const source = sources.find((item) => item.id === template.dataSource);
      if (source) {
        setDirectSelection({ source, template });
      }
      openGenerateReport();
    },
    [openGenerateReport, setDirectSelection, sources]
  );

  const handleBack = useCallback(() => {
    setDirectSelection(null);
    closeGenerateReport();
  }, [closeGenerateReport, setDirectSelection]);

  return {
    isDownloading,
    isRunningTemplateExport,
    isSharingExport,
    templateToRun,
    shareExportJob,
    setTemplateToRun,
    setShareExportJobId,
    handleDownload,
    handleScheduleAction,
    handleExportAction,
    handleShareExport,
    handleTemplateAction,
    handleRunTemplate,
    handleQueueTemplateExport,
    handleExportQueued,
    handleGenerateReport,
    handleOpenTemplate,
    handleBack,
    getExportFileName: getHrReportExportFileName,
  };
}
