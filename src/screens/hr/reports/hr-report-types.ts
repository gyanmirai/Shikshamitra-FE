import type {
  HrReportSource,
  HrReportTemplate,
  HrReportRecipient,
  HrReportFilterCondition,
} from 'src/redux/hr/hrReportsApi';

export type HrReportBuilderState = {
  selectedSourceId: string;
  selectedTemplate: HrReportTemplate | null;
  reportName: string;
  columns: string[];
  dateField: string;
  fromDate: string;
  toDate: string;
  month: string;
  conditions: HrReportFilterCondition[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  groups: string[];
  summaryField: string;
  chartType: 'none' | 'kpi' | 'bar' | 'line' | 'donut';
  chartCategoryField: string;
  chartValueField: string;
  visibility: 'private' | 'organization';
};

export type HrReportCatalogSelection = {
  source: HrReportSource;
  template?: HrReportTemplate;
};

export type HrReportScheduleFormState = {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  deliveryMode: 'inApp' | 'inAppAndEmail';
  firstRunAt: string;
  recipients: HrReportRecipient[];
};

export type HrReportsCenterTab = 'exports' | 'templates' | 'schedules';

export type HrReportExportAction = 'cancel' | 'retry' | 'regenerate' | 'share';

export type HrReportTemplateAction = 'duplicate' | 'publish' | 'draft' | 'delete';

export type HrReportScheduleAction = 'pause' | 'resume' | 'runNow' | 'delete';

export type HrReportQueuedExport = {
  jobId: string;
  format: 'excel' | 'pdf';
};
