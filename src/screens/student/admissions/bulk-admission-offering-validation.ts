import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

export type BulkOfferingFieldIssue = { message: string; blocking: boolean };
export type BulkOfferingFieldIssues = Partial<
  Record<keyof BulkOfferingValues, BulkOfferingFieldIssue>
>;

export const bulkOfferingValidationFields: Record<string, keyof BulkOfferingValues> = {
  RteRequiresDirectRegistration: 'track',
  CycleMissing: 'admissionCycle',
  CycleUnavailable: 'admissionCycle',
  HierarchyInvalid: 'standardIds',
  HierarchyOutOfScope: 'standardIds',
  Duplicate: 'standardIds',
  OfferingDuplicate: 'standardIds',
  DateRangeInvalid: 'admissionCycle',
  WorkflowMissing: 'workflowDefinitionId',
  WorkflowRequired: 'workflowDefinitionId',
  WorkflowNotPublished: 'workflowDefinitionId',
  DirectWorkflowContainsInquiry: 'workflowDefinitionId',
  DirectWorkflowMustStartWithForm: 'workflowDefinitionId',
  RteWorkflowContainsAssessment: 'workflowDefinitionId',
  ApplicationFormMissing: 'workflowDefinitionId',
  ApplicationFormNotPublished: 'workflowDefinitionId',
  ApplicationFormPurposeMismatch: 'workflowDefinitionId',
  ApplicationFormIdentityIncomplete: 'workflowDefinitionId',
  WorkflowFormMismatch: 'workflowDefinitionId',
  EligibilityFormMismatch: 'workflowDefinitionId',
  InquiryCounsellorUnavailable: 'workflowDefinitionId',
  ReviewAssigneeUnavailable: 'workflowDefinitionId',
  InquiryFormMissing: 'inquiryFormDefinitionId',
  InquiryFormNotPublished: 'inquiryFormDefinitionId',
  InquiryFormPurposeMismatch: 'inquiryFormDefinitionId',
  InquiryIntakeProfileMissing: 'inquiryIntakeProfileId',
  InquiryIntakeProfileInvalid: 'inquiryIntakeProfileId',
  CounsellorAssignmentProfileMissing: 'inquiryIntakeProfileId',
  CounsellorAssignmentProfileInvalid: 'inquiryIntakeProfileId',
};

export const bulkOfferingFieldLabels: Partial<Record<keyof BulkOfferingValues, string>> = {
  admissionCycle: 'Admission cycle',
  track: 'Admission type',
  entryMode: 'Admission route',
  standardIds: 'Class',
  workflowDefinitionId: 'Published workflow',
  inquiryFormDefinitionId: 'Inquiry form',
  inquiryIntakeProfileId: 'Intake & assignment setup',
};

// The API permits missing configuration when saving Inactive. Keep those checks visible,
// without turning an activation requirement into a new creation blocker.
const activationRequirements = new Set([
  'CycleUnavailable',
  'WorkflowMissing',
  'WorkflowRequired',
  'InquiryFormMissing',
  'ApplicationFormMissing',
  'InquiryIntakeProfileMissing',
  'CounsellorAssignmentProfileMissing',
]);

export function getBulkOfferingFieldIssues(
  preview: BulkAdmissionOfferingResult | null,
  standardNameById: Record<string, string>
): BulkOfferingFieldIssues {
  const items = preview?.items ?? [];
  const grouped = new Map<
    string,
    { field: keyof BulkOfferingValues; message: string; ids: Set<string>; blocking: boolean }
  >();
  items.forEach((item) => {
    item.errors.forEach((error) => {
      const field = bulkOfferingValidationFields[error.code];
      if (!field) return;
      const key = `${field}:${error.message}`;
      const entry = grouped.get(key) ?? {
        field,
        message: error.message,
        ids: new Set<string>(),
        blocking: false,
      };
      entry.ids.add(item.standardId);
      entry.blocking ||= !item.canSaveInactive && !activationRequirements.has(error.code);
      grouped.set(key, entry);
    });
  });
  const issues: BulkOfferingFieldIssues = {};
  grouped.forEach(({ field, message, ids, blocking }) => {
    const classes = [...ids].map((id) => standardNameById[id] || 'Selected class').join(', ');
    const detail = `${field === 'standardIds' || ids.size < items.length ? `${classes}: ` : ''}${message}`;
    const previous = issues[field];
    issues[field] = {
      message: previous ? `${previous.message}\n${detail}` : detail,
      blocking: Boolean(previous?.blocking || blocking),
    };
  });
  return issues;
}
