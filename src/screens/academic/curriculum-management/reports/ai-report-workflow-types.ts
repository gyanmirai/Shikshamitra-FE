import type {
  AcademicReportPreview,
  AcademicDynamicReportSpec,
} from 'src/redux/academicAPI/AcademicReportApi';

export type AiReportStage =
  | 'idle'
  | 'planning'
  | 'clarifying'
  | 'previewing'
  | 'planned'
  | 'generating'
  | 'queued'
  | 'processing'
  | 'ready'
  | 'failed';

export interface AiReportReview {
  plan: AcademicDynamicReportSpec;
  preview: AcademicReportPreview;
  permissionSummary: string;
  assumptions: string[];
  confidence: number;
}
