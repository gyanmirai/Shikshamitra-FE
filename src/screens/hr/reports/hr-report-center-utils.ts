import type {
  HrReportFilter,
  HrReportFormat,
  HrReportRequest,
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';

import { isHrReportExportActive } from './hr-report-utils';

export const HR_REPORT_MISSING_HIGHLIGHTED_EXPORT_POLL_LIMIT = 3;

const exportStatusPriority = (job: HrReportExportJob) => {
  if (isHrReportExportActive(job)) return 0;
  if (job.status === 'Completed' && !job.isExpired) return 1;
  if (job.status === 'Failed' || job.status === 'Cancelled') return 2;
  if (job.isExpired) return 3;
  return 4;
};

export const sortHrReportExportsForCenter = (jobs: HrReportExportJob[]) =>
  [...jobs].sort((left, right) => {
    const priority = exportStatusPriority(left) - exportStatusPriority(right);
    if (priority !== 0) return priority;

    return new Date(right.creationTime).getTime() - new Date(left.creationTime).getTime();
  });

export const getHrReportsCenterCounts = (
  exportJobs: HrReportExportJob[],
  templates: HrReportTemplate[],
  schedules: HrReportSchedule[]
) => ({
  activeExports: exportJobs.filter(isHrReportExportActive).length,
  completedExports: exportJobs.filter((job) => job.status === 'Completed' && !job.isExpired).length,
  draftTemplates: templates.filter((template) => template.status !== 'Published').length,
  activeSchedules: schedules.filter((schedule) => schedule.status === 'Active').length,
});

export const getHrReportExportDisplayStatus = (job: HrReportExportJob) =>
  job.isExpired ? 'Expired' : job.status;

export const buildHrReportTemplateExportRequest = (
  template: HrReportTemplate,
  format: HrReportFormat
): HrReportRequest => {
  const staleLineageKeys = new Set(['parentjobid', 'sourceaction']);
  const definition = Object.fromEntries(
    Object.entries(template.definition).filter(([key]) => !staleLineageKeys.has(key.toLowerCase()))
  ) as HrReportRequest;

  return {
    ...definition,
    reportType: template.definition.reportType || template.name,
    dataSource: template.definition.dataSource || template.dataSource,
    format,
    templateId: template.id,
    templateName: template.name,
    sourceAction: 'manualExport',
  };
};

const hasMeaningfulArrayValue = (values?: unknown[]) =>
  Array.isArray(values) && values.some((value) => value != null && String(value).trim() !== '');

const hasMeaningfulText = (value?: string) => Boolean(value?.trim());

export const countHrReportFilters = (filters?: HrReportFilter) => {
  if (!filters) return 0;

  const conditionCount =
    filters.conditions?.filter((condition) => {
      if (!condition.field) return false;
      if (hasMeaningfulArrayValue(condition.values)) return true;
      return hasMeaningfulText(condition.value);
    }).length ?? 0;

  return (
    conditionCount +
    (hasMeaningfulArrayValue(filters.employeeIds) ? 1 : 0) +
    (hasMeaningfulArrayValue(filters.departments) ? 1 : 0) +
    (hasMeaningfulArrayValue(filters.statuses) ? 1 : 0) +
    (hasMeaningfulArrayValue(filters.componentNames) ? 1 : 0) +
    (filters.genderType !== undefined && filters.genderType !== null ? 1 : 0) +
    (hasMeaningfulText(filters.month) ? 1 : 0) +
    (hasMeaningfulText(filters.fromDate) || hasMeaningfulText(filters.toDate) ? 1 : 0)
  );
};

export const getHrReportTemplateRunSummary = (template: HrReportTemplate) => ({
  category: template.category || '-',
  dataSource: template.definition.dataSource || template.dataSource || '-',
  columnCount: template.definition.columns?.length ?? 0,
  filterCount: countHrReportFilters(template.definition.filters),
  groupCount: template.definition.groups?.length ?? 0,
  summaryCount: template.definition.summaries?.length ?? 0,
});

export const isHrReportExportOwnedByCurrentUser = (
  job: Pick<HrReportExportJob, 'requestedByUserId'>,
  currentUserId?: string | null
) =>
  Boolean(
    currentUserId &&
    job.requestedByUserId &&
    job.requestedByUserId.toLowerCase() === currentUserId.toLowerCase()
  );

export const canDownloadHrReportExport = (job: Pick<HrReportExportJob, 'status' | 'isExpired'>) =>
  job.status === 'Completed' && !job.isExpired;

export const getHrReportExportPollingDecision = (
  exportJobs: HrReportExportJob[],
  highlightedExportId?: string | null,
  missingHighlightedExportPolls = 0
) => {
  const hasActiveExports = exportJobs.some(isHrReportExportActive);
  const highlightedJob = highlightedExportId
    ? exportJobs.find((job) => job.id === highlightedExportId)
    : undefined;
  const hasHighlightedJob = Boolean(highlightedJob);
  const isHighlightedJobMissing = Boolean(highlightedExportId && !highlightedJob);
  const isMissingHighlightedExportLimitReached =
    isHighlightedJobMissing &&
    missingHighlightedExportPolls >= HR_REPORT_MISSING_HIGHLIGHTED_EXPORT_POLL_LIMIT;
  const shouldPoll =
    hasActiveExports ||
    Boolean(
      highlightedExportId &&
      (highlightedJob
        ? isHrReportExportActive(highlightedJob)
        : !isMissingHighlightedExportLimitReached)
    );

  return {
    hasActiveExports,
    highlightedJob,
    hasHighlightedJob,
    isHighlightedJobMissing,
    isMissingHighlightedExportLimitReached,
    shouldPoll,
  };
};

export const shouldPollHrReportExports = (
  exportJobs: HrReportExportJob[],
  highlightedExportId?: string | null,
  missingHighlightedExportPolls = 0
) =>
  getHrReportExportPollingDecision(exportJobs, highlightedExportId, missingHighlightedExportPolls)
    .shouldPoll;

export const isHrReportRefetchErrorResult = (result: unknown): result is { error: unknown } =>
  Boolean(
    result &&
    typeof result === 'object' &&
    'error' in result &&
    (result as { error?: unknown }).error
  );

export const formatHrReportFileSize = (size?: number | null) => {
  if (!size || size <= 0) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatHrReportRowCount = (rowCount?: number | null) =>
  rowCount == null ? '-' : rowCount.toLocaleString();

export const getHrReportExportLineageLabel = (job: HrReportExportJob) => {
  if (job.sourceAction === 'retry') return 'Retry of this export';
  if (job.sourceAction === 'regenerate') return 'Regenerated from a previous export';
  if (job.sourceAction === 'scheduleRun') return 'Scheduled run';
  if (job.templateName) return `Generated from template: ${job.templateName}`;
  return 'Manual export';
};

export const getHrReportRecipientLabel = (schedule: Pick<HrReportSchedule, 'recipientUserIds'>) => {
  const additionalCount = schedule.recipientUserIds.filter(Boolean).length;
  return additionalCount > 0 ? `You + ${additionalCount}` : 'You only';
};

const addScheduleInterval = (value: dayjs.Dayjs, frequency: HrReportSchedule['frequency']) => {
  if (frequency === 'daily') return value.add(1, 'day');
  if (frequency === 'weekly') return value.add(1, 'week');
  return value.add(1, 'month');
};

const getDefaultScheduleFirstRun = (now: Date) => {
  const current = dayjs(now);
  let firstRun = current.startOf('day').hour(7).minute(0).second(0).millisecond(0);

  if (!firstRun.isAfter(current)) {
    firstRun = firstRun.add(1, 'day');
  }

  return firstRun;
};

export const getHrReportSchedulePreviewRuns = (
  frequency: HrReportSchedule['frequency'],
  firstRunAt?: string,
  now: Date = new Date()
) => {
  const explicitFirstRun = firstRunAt ? dayjs(firstRunAt) : null;
  const baseFirstRun =
    explicitFirstRun?.isValid() === true ? explicitFirstRun : getDefaultScheduleFirstRun(now);
  const firstRun =
    firstRunAt || frequency === 'daily'
      ? baseFirstRun
      : addScheduleInterval(baseFirstRun, frequency);
  const secondRun = addScheduleInterval(firstRun, frequency);

  return [firstRun, secondRun, addScheduleInterval(secondRun, frequency)];
};
