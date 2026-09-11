import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationResult,
} from 'src/redux/student/admissions/admission-workflows-api';

export type WorkflowSidePanel = 'preview' | 'validation' | 'versions' | 'usage' | null;

export type WorkflowBuilderDraft = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  dirty: boolean;
  validation: AdmissionWorkflowValidationResult | null;
};

export const WORKFLOW_STATUS_LABELS = ['Draft', 'Published', 'Archived'] as const;
export const WORKFLOW_STATUS_COLORS = ['default', 'success', 'error'] as const;
