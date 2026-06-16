import type { ReactNode } from 'react';
import type { ReportCategory, ReportSubCategory } from 'src/components/common-report/types';
import type {
  HrReportField,
  HrReportFormat,
  HrReportSource,
  HrReportRequest,
  HrReportTemplate,
  HrReportExportJob,
  HrReportFilterCondition,
} from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';

import type { HrReportBuilderState, HrReportCatalogSelection } from './hr-report-types';

export const DEFAULT_HR_REPORT_PAGE_SIZE = 25;

const sourceIcons: Record<string, string> = {
  employee: 'mdi:account-tie-outline',
  payroll: 'mdi:cash-multiple',
  attendance: 'mdi:calendar-check-outline',
  leave: 'mdi:calendar-account-outline',
  policies: 'mdi:file-cog-outline',
  performance: 'mdi:chart-line',
};

export const formatHrReportDateTime = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '-';

export const defaultHrReportOperator = (field?: HrReportField) => field?.operators[0] ?? 'equals';

export const getHrReportDateFields = (source?: HrReportSource) =>
  (source?.fields ?? []).filter((field) => field.type === 'date');

export const isHrReportChartableField = (field: HrReportField) =>
  field.chartable ?? (field.groupable || field.summarizable);

export const getHrReportChartCategoryFields = (source?: HrReportSource) =>
  (source?.fields ?? []).filter((field) => field.groupable && isHrReportChartableField(field));

export const getHrReportChartValueFields = (source?: HrReportSource) =>
  (source?.fields ?? []).filter((field) => field.summarizable && isHrReportChartableField(field));

export const getDefaultHrReportDateField = (source?: HrReportSource) => {
  const fields = getHrReportDateFields(source);

  if (!source || fields.length === 0) return '';

  const preferredBySource: Record<string, string> = {
    employee: 'dateOfJoining',
    attendance: 'attendanceDate',
    leave: 'startDate',
    policies: 'effectiveFrom',
    performance: 'finalizedAt',
  };

  const preferred = preferredBySource[source.id];
  return fields.some((field) => field.id === preferred) ? preferred : fields[0].id;
};

export const isHrReportPayrollSource = (source?: HrReportSource) => source?.id === 'payroll';

export const getHrReportDateRangeError = (fromDate?: string, toDate?: string) =>
  fromDate && toDate && fromDate > toDate ? 'From Date must be on or before To Date.' : '';

export const cleanHrReportConditions = (
  conditions: HrReportFilterCondition[] = []
): HrReportFilterCondition[] =>
  conditions.flatMap<HrReportFilterCondition>((condition) => {
    if (!condition.field) return [];
    if (condition.operator === 'in') {
      const rawValues = condition.values?.length ? condition.values : [condition.value ?? ''];
      const values = rawValues
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0);

      return values.length ? [{ ...condition, value: undefined, values }] : [];
    }

    if (typeof condition.value !== 'string' || condition.value.trim().length === 0) return [];
    return [{ ...condition, value: condition.value.trim(), values: undefined }];
  });

export const createHrReportStateFromSource = (source: HrReportSource): HrReportBuilderState => ({
  selectedSourceId: source.id,
  selectedTemplate: null,
  reportName: source.label,
  columns: source.defaultColumns,
  dateField: isHrReportPayrollSource(source) ? '' : getDefaultHrReportDateField(source),
  fromDate: '',
  toDate: '',
  month: '',
  conditions: [],
  sortField: source.defaultSorts[0] ?? '',
  sortDirection: 'asc',
  groups: [],
  summaryField: '',
  chartType: 'none',
  chartCategoryField: '',
  chartValueField: '',
  visibility: 'private',
});

export const createHrReportStateFromTemplate = (
  template: HrReportTemplate,
  source?: HrReportSource
): HrReportBuilderState => {
  const { definition } = template;

  return {
    selectedSourceId: template.dataSource,
    selectedTemplate: template,
    reportName: template.name,
    columns: definition.columns?.length ? definition.columns : (source?.defaultColumns ?? []),
    dateField:
      definition.filters?.dateField ??
      (isHrReportPayrollSource(source) ? '' : getDefaultHrReportDateField(source)),
    fromDate: definition.filters?.fromDate ?? '',
    toDate: definition.filters?.toDate ?? '',
    month: definition.filters?.month ?? '',
    conditions: definition.filters?.conditions ?? [],
    sortField: definition.sorts?.[0]?.field ?? source?.defaultSorts[0] ?? '',
    sortDirection: definition.sorts?.[0]?.direction === 'desc' ? 'desc' : 'asc',
    groups: definition.groups ?? [],
    summaryField: definition.summaries?.[0]?.field ?? '',
    chartType:
      definition.chart?.type === 'kpi' ||
      definition.chart?.type === 'bar' ||
      definition.chart?.type === 'line' ||
      definition.chart?.type === 'donut'
        ? definition.chart.type
        : 'none',
    chartCategoryField: definition.chart?.categoryField ?? definition.groups?.[0] ?? '',
    chartValueField: definition.chart?.valueField ?? definition.summaries?.[0]?.field ?? '',
    visibility: template.visibility === 'organization' ? 'organization' : 'private',
  };
};

export const buildHrReportRequest = (
  state: HrReportBuilderState,
  source?: HrReportSource,
  page = 1,
  pageSize = DEFAULT_HR_REPORT_PAGE_SIZE,
  format: HrReportRequest['format'] = 'excel'
): HrReportRequest => ({
  reportType: state.reportName || source?.label || 'HR Report',
  dataSource: state.selectedSourceId,
  format,
  templateId: state.selectedTemplate?.id,
  templateName: state.selectedTemplate?.name,
  sourceAction: 'manualExport',
  page,
  pageSize,
  columns: state.columns,
  groups: state.groups,
  summaries: state.summaryField ? [{ field: state.summaryField, function: 'sum' }] : [],
  ...(state.chartType !== 'none'
    ? {
        chart: {
          type: state.chartType,
          categoryField:
            state.chartType === 'kpi' ? undefined : state.chartCategoryField || state.groups[0],
          valueField: state.chartValueField || state.summaryField || undefined,
          function: state.chartValueField || state.summaryField ? 'sum' : 'count',
          title: `${state.reportName || source?.label || 'HR Report'} Analytics`,
        },
      }
    : {}),
  sorts: state.sortField ? [{ field: state.sortField, direction: state.sortDirection }] : [],
  filters: {
    dateField: state.dateField || undefined,
    fromDate: state.fromDate || undefined,
    toDate: state.toDate || undefined,
    month: state.month || undefined,
    conditions: cleanHrReportConditions(state.conditions),
  },
});

export const mapHrSourcesToCategories = (sources: HrReportSource[]): ReportCategory[] =>
  sources.map((source) => ({
    id: source.id,
    name: source.category || source.label,
    icon: sourceIcons[source.id] ?? 'mdi:file-chart-outline',
  }));

export const mapHrSourcesToSubCategories = (
  sources: HrReportSource[],
  templates: HrReportTemplate[],
  render: (selection: HrReportCatalogSelection) => ReactNode
): ReportSubCategory[] =>
  sources.flatMap((source) => {
    const sourceTemplates = templates.filter((template) => template.dataSource === source.id);
    const customReport: ReportSubCategory = {
      id: `${source.id}-custom-report`,
      name: `New ${source.category || source.label} Report`,
      categoryId: source.id,
      icon: 'mdi:file-plus-outline',
      description: source.description,
      render: () => render({ source }),
    };

    return [
      customReport,
      ...sourceTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        categoryId: source.id,
        icon:
          template.visibility === 'organization'
            ? 'mdi:file-check-outline'
            : 'mdi:file-lock-outline',
        description: template.description || `${template.status} ${template.category} template`,
        render: () => render({ source, template }),
      })),
    ];
  });

export const getHrReportExportFileName = (
  job: Pick<HrReportExportJob, 'fileName' | 'reportType'>
) => job.fileName || `${job.reportType || 'hr-report'}`;

export const getHrReportFormatLabel = (format?: HrReportFormat) =>
  format === 'pdf' ? 'PDF' : 'Excel';

export const getHrReportRequestSignature = (request: HrReportRequest) =>
  JSON.stringify({
    reportType: request.reportType,
    dataSource: request.dataSource,
    format: request.format,
    columns: request.columns ?? [],
    sorts: request.sorts ?? [],
    groups: request.groups ?? [],
    summaries: request.summaries ?? [],
    chart: request.chart ?? null,
    filters: request.filters ?? {},
  });

export const isHrReportExportActive = (job: HrReportExportJob) =>
  job.status === 'Queued' || job.status === 'Running';
