import type {
  AcademicReportPreview,
  AcademicAiReportClarificationAnswer,
  AcademicAiReportClarificationQuestion,
} from 'src/redux/academicAPI/AcademicReportApi';

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportFilters = Partial<Record<
  'academicYearId' | 'boardId' | 'mediumId' | 'stageId' | 'standardId' | 'divisionId' |
  'buildingId' | 'floorId' | 'roomTypeId' | 'shiftId' | 'roomAssignment' | 'documentCategory' | 'identityScope', string
>>;
export interface InstituteReportRequest {
  reportType: string;
  format: ReportFormat;
  page: number;
  pageSize: number;
  filters: ReportFilters;
  columns: string[];
  conditions: { field: string; operator: 'eq' | 'contains' | 'gt' | 'lt'; value: string }[];
  sortField?: string | null;
  descending: boolean;
}
export interface ReportDefinition {
  id: string;
  label: string;
  academic: boolean;
  requiredPermissions: string[];
  columns: { id: string; label: string }[];
}
export interface ReportOptions {
  reportTypes: ReportDefinition[];
  choices: Partial<Record<keyof ReportFilters, { id: string; name: string; parentId?: string | null }[]>>;
  values?: Partial<Record<keyof ReportFilters, { value: string; label: string }[]>>;
}
export interface ReportJob {
  id: string;
  reportType: string;
  format: ReportFormat;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Expired';
  fileName?: string | null;
  errorMessage?: string | null;
  creationTime: string;
  completedAt?: string | null;
  expiresAt: string;
  request: InstituteReportRequest;
  isDynamic: boolean;
}
export interface AiPlanInput {
  prompt: string;
  academicYearId?: string;
  clarificationAnswers: AcademicAiReportClarificationAnswer[];
}
export interface AiPlanResult {
  status: 'Ready' | 'NeedsClarification';
  summary: string;
  plan: InstituteReportRequest | null;
  approvalToken: string | null;
  clarificationQuestions: AcademicAiReportClarificationQuestion[];
}
export interface ApprovedReport { plan: InstituteReportRequest; approvalToken: string }
export type ReportPreview = AcademicReportPreview;

export const reportActions = { view: 'InstituteSetup.Reports.View', add: 'InstituteSetup.Reports.Add' };
export const newReportRequest = (reportType: string, filters: ReportFilters = {}): InstituteReportRequest => ({
  reportType, format: 'pdf', page: 1, pageSize: 25, filters, columns: [], conditions: [], descending: false,
});

export function reportError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data as { error?: { message?: string }; message?: string; detail?: string } | undefined;
    return data?.error?.message ?? data?.detail ?? data?.message ?? 'The report request failed. Please try again.';
  }
  return error instanceof Error ? error.message : 'The report request failed. Please try again.';
}
