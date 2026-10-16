import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationResult,
} from 'src/redux/student/admissions/admission-workflows-api';

export type WorkflowSidePanel =
  'preview' | 'simulation' | 'versions' | 'usage' | 'governance' | null;

export type WorkflowBuilderDraft = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  dirty: boolean;
  validation: AdmissionWorkflowValidationResult | null;
};

export const WORKFLOW_STATUS_LABELS = [
  'Draft',
  'Published',
  'Archived',
  'Validated',
  'Submitted',
  'Approved',
  'Scheduled',
  'Superseded',
] as const;
export const WORKFLOW_STATUS_COLORS = [
  'default',
  'success',
  'error',
  'info',
  'warning',
  'primary',
  'secondary',
  'default',
] as const;
